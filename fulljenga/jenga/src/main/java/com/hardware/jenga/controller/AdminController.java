package com.hardware.jenga.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hardware.jenga.dto.ProductResponse;
import com.hardware.jenga.dto.UserResponse;
import com.hardware.jenga.entity.ProductLead;
import com.hardware.jenga.repository.BusinessProfileRepository;
import com.hardware.jenga.repository.CategoryRepository;
import com.hardware.jenga.repository.NotificationRepository;
import com.hardware.jenga.repository.ProductLeadRepository;
import com.hardware.jenga.repository.ProductRepository;
import com.hardware.jenga.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    private final ProductRepository productRepository;

    private final ProductLeadRepository productLeadRepository;

    private final CategoryRepository categoryRepository;

    private final BusinessProfileRepository businessProfileRepository;

    private final NotificationRepository notificationRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalLeads", productLeadRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("totalBusinessProfiles", businessProfileRepository.count());
        stats.put("totalNotifications", notificationRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productRepository.findAll().stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/leads")
    public ResponseEntity<List<ProductLead>> getAllLeads() {
        return ResponseEntity.ok(productLeadRepository.findAll());
    }
}
