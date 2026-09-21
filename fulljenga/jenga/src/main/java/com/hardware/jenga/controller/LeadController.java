package com.hardware.jenga.controller;

import com.hardware.jenga.entity.ProductLead;
import com.hardware.jenga.entity.User;
import com.hardware.jenga.repository.ProductLeadRepository;
import com.hardware.jenga.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final ProductLeadRepository productLeadRepository;

    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createLead(@RequestBody Map<String, Long> request, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long productId = request.get("productId");
        if (productId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "productId is required"));
        }

        ProductLead lead = new ProductLead();
        lead.setBuyerId(user.getId());
        lead.setProductId(productId);
        productLeadRepository.save(lead);

        return ResponseEntity.ok(Map.of("message", "Lead created successfully"));
    }

    @GetMapping
    public List<ProductLead> getMyLeads(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return productLeadRepository.findByBuyerId(user.getId());
    }
}
