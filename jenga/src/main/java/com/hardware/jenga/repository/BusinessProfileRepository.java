package com.hardware.jenga.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hardware.jenga.entity.BusinessProfile;

public interface BusinessProfileRepository extends JpaRepository<BusinessProfile, Long> {
   
    // Find business profile by the associated User entity's ID
    Optional<BusinessProfile> findByUserId(Long userId);

    // Check if business profile exists for user ID
    boolean existsByUserId(Long userId);
}