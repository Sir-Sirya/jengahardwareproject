package com.hardware.jenga.dto;

import java.math.BigDecimal;
import java.util.List;

import com.hardware.jenga.entity.Order;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class CheckoutDtos {

    public record CheckoutRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email @NotBlank String email,
        @NotBlank String phone,
        @NotBlank String deliveryAddress,
        @NotNull Order.PaymentMethod paymentMethod,
        @NotEmpty List<CartItemDto> items,
        String recaptchaToken
    ) {}

    public record CartItemDto(
        @NotNull Long productId,
        @NotNull Integer quantity
    ) {}

    public record CheckoutResponse(
        String trackingNumber,
        String status,
        BigDecimal totalAmount,
        String checkoutRequestId,
        String paymentPromptMessage
    ) {}

    public record OrderTrackingResponse(
        String trackingNumber,
        String orderStatus,
        String paymentStatus,
        String mpesaReceiptNumber,
        BigDecimal totalAmount,
        String customerName,
        String deliveryAddress,
        List<OrderItemDto> items
    ) {}

    public record OrderItemDto(
        Long productId,
        String title,
        Integer quantity,
        BigDecimal unitPrice,
        String imageUrl
    ) {}
}