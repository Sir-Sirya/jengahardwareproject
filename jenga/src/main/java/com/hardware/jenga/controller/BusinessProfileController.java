package com.hardware.jenga.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hardware.jenga.dto.BusinessProfileResponse;
import com.hardware.jenga.entity.BusinessProfile;
import com.hardware.jenga.entity.User;
import com.hardware.jenga.repository.BusinessProfileRepository;
import com.hardware.jenga.repository.UserRepository;

@RestController
@RequestMapping("/api/business-profiles")
public class BusinessProfileController {

    @Autowired
    private BusinessProfileRepository businessProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BusinessProfile profile = businessProfileRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("Business profile not found"));

        return ResponseEntity.ok(toResponse(profile));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody Map<String, Object> request, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BusinessProfile profile = businessProfileRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("Business profile not found"));

        if (request.containsKey("businessName")) {
            profile.setBusinessName((String) request.get("businessName"));
        }
        if (request.containsKey("mpesaNumber")) {
            profile.setMpesaNumber((String) request.get("mpesaNumber"));
        }
        if (request.containsKey("lowStockThreshold")) {
            profile.setLowStockThreshold((Integer) request.get("lowStockThreshold"));
        }

        businessProfileRepository.save(profile);
        return ResponseEntity.ok(toResponse(profile));
    }

    private BusinessProfileResponse toResponse(BusinessProfile profile) {
        BusinessProfileResponse resp = new BusinessProfileResponse();
        resp.setId(profile.getId());
        resp.setUserId(profile.getUser().getId());
        resp.setBusinessName(profile.getBusinessName());
        resp.setLocation(profile.getLocation());
        resp.setBadge(profile.getBadge());
        resp.setMpesaNumber(profile.getMpesaNumber());
        resp.setMpesaTillNumber(profile.getMpesaTillNumber());
        resp.setLowStockThreshold(profile.getLowStockThreshold());
        return resp;
    }
}
