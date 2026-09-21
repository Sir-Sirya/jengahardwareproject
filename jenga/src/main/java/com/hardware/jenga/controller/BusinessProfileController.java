package com.hardware.jenga.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hardware.jenga.dto.BusinessProfileDTO;
import com.hardware.jenga.entity.BusinessProfile;
import com.hardware.jenga.entity.User;
import com.hardware.jenga.repository.BusinessProfileRepository;
import com.hardware.jenga.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/business-profiles")
public class BusinessProfileController {

    @Autowired
    private BusinessProfileRepository businessProfileRepository;

    @Autowired
    private UserRepository userRepository;

    // READ: Get authenticated seller's business profile
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<BusinessProfile> profile = businessProfileRepository.findByUserId(user.getId());
        return profile.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.noContent().build());
    }

    // READ: Public company story and contact details for customers/investors
    @GetMapping("/public/{userId}")
    public ResponseEntity<?> getPublicProfileByUserId(@PathVariable Long userId) {
        Optional<BusinessProfile> profile = businessProfileRepository.findByUserId(userId);
        return profile.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    // CREATE or UPDATE: Save company overview, socials, and Safaricom M-Pesa details
    @PostMapping("/me")
    public ResponseEntity<BusinessProfile> saveOrUpdateProfile(
            @Valid @RequestBody BusinessProfileDTO dto,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        BusinessProfile profile = businessProfileRepository.findByUserId(user.getId())
                .orElse(new BusinessProfile());

        profile.setUser(user);

        // 1. General Business Information
        profile.setBusinessName(dto.getBusinessName());
        profile.setHeadOfficeAddress(dto.getHeadOfficeAddress());
        profile.setPhoneNumber(dto.getPhoneNumber());
        profile.setEmailAddress(dto.getEmailAddress());
        profile.setRegistrationDate(dto.getRegistrationDate());
        profile.setCompanyStatus(dto.getCompanyStatus());

        // 2. Social Media Links & Direct Line
        profile.setInstagramUrl(dto.getInstagramUrl());
        profile.setTiktokUrl(dto.getTiktokUrl());
        profile.setWhatsappNumber(dto.getWhatsappNumber());
        profile.setContactNumber(dto.getContactNumber());

        // 3. Safaricom M-Pesa Payment Setup
        profile.setMpesaPaymentType(dto.getMpesaPaymentType() != null ? dto.getMpesaPaymentType() : "BUY_GOODS_TILL");
        profile.setMpesaTillNumber(dto.getMpesaTillNumber());
        profile.setMpesaPaybillNumber(dto.getMpesaPaybillNumber());
        profile.setMpesaAccountNumber(dto.getMpesaAccountNumber());
        profile.setMpesaNumber(dto.getMpesaNumber());

        // 4. Company Overview & Story
        profile.setCompanyOverview(dto.getCompanyOverview());

        // 5. Mission & Vision
        profile.setMission(dto.getMission());
        profile.setVision(dto.getVision());

        // 6. Products, Services, Management & Achievements
        profile.setProductsAndServices(dto.getProductsAndServices());
        profile.setKeyPersonnel(dto.getKeyPersonnel());
        profile.setMajorClientsAchievements(dto.getMajorClientsAchievements());

        // Digital Badges and Order Progress
        if (dto.getCompletedOrders() != null) {
            profile.setCompletedOrders(dto.getCompletedOrders());
        }
        if (dto.getIsVerified() != null) {
            profile.setIsVerified(dto.getIsVerified());
        }

        BusinessProfile savedProfile = businessProfileRepository.save(profile);
        return ResponseEntity.ok(savedProfile);
    }

    // PUT: Alias for profile updating
    @PutMapping("/me")
    public ResponseEntity<BusinessProfile> updateProfile(
            @Valid @RequestBody BusinessProfileDTO dto,
            Authentication authentication) {
        return saveOrUpdateProfile(dto, authentication);
    }
}