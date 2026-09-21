package com.hardware.jenga.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hardware.jenga.dto.CheckoutDtos.CheckoutRequest;
import com.hardware.jenga.dto.CheckoutDtos.CheckoutResponse;
import com.hardware.jenga.dto.CheckoutDtos.OrderTrackingResponse;
import com.hardware.jenga.service.CheckoutService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final CheckoutService checkoutService;

    public OrderController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(
        @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
        @Valid @RequestBody CheckoutRequest request,
        Principal principal
    ) {
        String key = (idempotencyKey != null && !idempotencyKey.isBlank())
            ? idempotencyKey 
            : java.util.UUID.randomUUID().toString();

        String userEmail = principal != null ? principal.getName() : null;
        CheckoutResponse response = checkoutService.processCheckout(request, key, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<OrderTrackingResponse> trackOrder(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(checkoutService.getOrderStatus(trackingNumber));
    }
}