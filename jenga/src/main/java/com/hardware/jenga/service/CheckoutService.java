package com.hardware.jenga.service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hardware.jenga.dto.CheckoutDtos.*;
import com.hardware.jenga.dto.MpesaCallbackDto;
import com.hardware.jenga.entity.Order;
import com.hardware.jenga.entity.OrderItem;
import com.hardware.jenga.entity.Product;
import com.hardware.jenga.entity.User;
import com.hardware.jenga.repository.OrderRepository;
import com.hardware.jenga.repository.ProductRepository;
import com.hardware.jenga.repository.UserRepository;

@Service
public class CheckoutService {

    private static final Logger log = LoggerFactory.getLogger(CheckoutService.class);
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final MpesaService mpesaService;

    public CheckoutService(
        OrderRepository orderRepository,
        ProductRepository productRepository,
        UserRepository userRepository,
        MpesaService mpesaService
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.mpesaService = mpesaService;
    }

    @Transactional
    public CheckoutResponse processCheckout(CheckoutRequest request, String idempotencyKey, String authUserEmail) {
        // 1. Idempotency Check: Prevent duplicate orders on retries
        Optional<Order> existingOrder = orderRepository.findByIdempotencyKey(idempotencyKey);
        if (existingOrder.isPresent()) {
            Order order = existingOrder.get();
            return new CheckoutResponse(
                order.getTrackingNumber(),
                order.getOrderStatus().name(),
                order.getTotalAmount(),
                order.getCheckoutRequestId(),
                "Existing transaction resumed."
            );
        }

        // 2. Resolve Buyer (Authenticated or Guest)
        User buyer = null;
        if (authUserEmail != null) {
            buyer = userRepository.findByEmail(authUserEmail).orElse(null);
        }

        // 3. Build & Calculate Order Items
        Order order = new Order();
        order.setIdempotencyKey(idempotencyKey);
        order.setTrackingNumber(generateTrackingNumber());
        order.setBuyer(buyer);
        order.setCustomerName(request.firstName() + " " + request.lastName());
        order.setCustomerEmail(request.email());
        order.setCustomerPhone(request.phone());
        order.setDeliveryAddress(request.deliveryAddress());
        order.setPaymentMethod(request.paymentMethod());
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setOrderStatus(Order.OrderStatus.PENDING_PAYMENT);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItemDto itemDto : request.items()) {
            Product product = productRepository.findById(itemDto.productId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemDto.productId()));

            // Stock Check
            if (product.getStockQuantity() < itemDto.quantity()) {
                throw new IllegalStateException("Insufficient inventory for product: " + product.getTitle());
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemDto.quantity());
            BigDecimal itemPrice = BigDecimal.valueOf(product.getPrice());
            item.setUnitPrice(itemPrice);
            subtotal = subtotal.add(itemPrice.multiply(BigDecimal.valueOf(itemDto.quantity())));

            order.getItems().add(item);
        }

        BigDecimal deliveryFee = BigDecimal.valueOf(250.00); // Standard Nairobi courier flat-fee
        order.setSubtotalAmount(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTotalAmount(subtotal.add(deliveryFee));

        Order savedOrder = orderRepository.save(order);

        // 4. Trigger Payment Protocol
        String checkoutRequestId = null;
        String promptMsg = "Order created. Complete payment to finalize.";

        if (request.paymentMethod() == Order.PaymentMethod.MPESA) {
            checkoutRequestId = mpesaService.initiateStkPush(
                request.phone(),
                savedOrder.getTotalAmount().intValue(),
                savedOrder.getTrackingNumber()
            );
            savedOrder.setCheckoutRequestId(checkoutRequestId);
            orderRepository.save(savedOrder);
            promptMsg = "M-Pesa STK Prompt sent to " + request.phone() + ". Enter your M-Pesa PIN to complete.";
        }

        return new CheckoutResponse(
            savedOrder.getTrackingNumber(),
            savedOrder.getOrderStatus().name(),
            savedOrder.getTotalAmount(),
            checkoutRequestId,
            promptMsg
        );
    }

    /**
     * Handles Safaricom Callback: Validates receipt, updates inventory, and confirms order.
     */
    @Transactional
    public void handleMpesaCallback(MpesaCallbackDto callback) {
        if (callback == null || callback.getBody() == null || callback.getBody().getStkCallback() == null) {
            return;
        }

        var stk = callback.getBody().getStkCallback();
        String checkoutRequestId = stk.getCheckoutRequestId();
        Integer resultCode = stk.getResultCode();

        Order order = orderRepository.findByCheckoutRequestId(checkoutRequestId).orElse(null);
        if (order == null) {
            log.error("No order found matching checkoutRequestId: {}", checkoutRequestId);
            return;
        }

        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            log.info("Order {} is already paid. Skipping duplicate callback.", order.getTrackingNumber());
            return;
        }

        if (Objects.equals(resultCode, 0)) {
            // Success: Extract Receipt Number
            String receiptNo = "MPESA-" + System.currentTimeMillis();
            if (stk.getCallbackMetadata() != null && stk.getCallbackMetadata().getItem() != null) {
                for (var item : stk.getCallbackMetadata().getItem()) {
                    if ("MpesaReceiptNumber".equalsIgnoreCase(item.getName()) && item.getValue() != null) {
                        receiptNo = item.getValue().toString();
                    }
                }
            }

            // Deduct Stock
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStockQuantity(Math.max(0, product.getStockQuantity() - item.getQuantity()));
                productRepository.save(product);
            }

            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setOrderStatus(Order.OrderStatus.CONFIRMED);
            order.setMpesaReceiptNumber(receiptNo);
            order.setPaidAt(LocalDateTime.now());
            orderRepository.save(order);

            log.info("Order {} confirmed successfully. M-Pesa Receipt: {}", order.getTrackingNumber(), receiptNo);
        } else {
            order.setPaymentStatus(Order.PaymentStatus.FAILED);
            order.setOrderStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(order);
            log.warn("M-Pesa payment failed for order {}. Reason: {}", order.getTrackingNumber(), stk.getResultDesc());
        }
    }

    @Transactional(readOnly = true)
    public OrderTrackingResponse getOrderStatus(String trackingNumber) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
            .orElseThrow(() -> new IllegalArgumentException("Tracking number not found: " + trackingNumber));

        List<OrderItemDto> itemDtos = order.getItems().stream()
            .map(i -> new OrderItemDto(
                i.getProduct().getId(),
                i.getProduct().getTitle(),
                i.getQuantity(),
                i.getUnitPrice(),
                i.getProduct().getImageUrl()
            )).toList();

        return new OrderTrackingResponse(
            order.getTrackingNumber(),
            order.getOrderStatus().name(),
            order.getPaymentStatus().name(),
            order.getMpesaReceiptNumber(),
            order.getTotalAmount(),
            order.getCustomerName(),
            order.getDeliveryAddress(),
            itemDtos
        );
    }

    private String generateTrackingNumber() {
        SecureRandom random = new SecureRandom();
        int num = 10000 + random.nextInt(90000);
        return "JNG-2026-" + num;
    }
}