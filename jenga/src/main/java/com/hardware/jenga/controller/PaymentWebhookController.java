package com.hardware.jenga.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hardware.jenga.dto.MpesaCallbackDto;
import com.hardware.jenga.service.CheckoutService;

@RestController
@RequestMapping("/api/payments")
public class PaymentWebhookController {

    private final CheckoutService checkoutService;

    public PaymentWebhookController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping("/mpesa/callback")
    public ResponseEntity<Map<String, String>> mpesaCallback(@RequestBody MpesaCallbackDto callback) {
        checkoutService.handleMpesaCallback(callback);
        // Safaricom requires standard acknowledgment
        return ResponseEntity.ok(Map.of("ResultCode", "0", "ResultDesc", "Accepted"));
    }
}