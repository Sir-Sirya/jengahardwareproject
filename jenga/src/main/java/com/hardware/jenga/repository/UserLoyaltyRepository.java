package com.hardware.jenga.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hardware.jenga.entity.UserLoyalty;

public interface UserLoyaltyRepository extends JpaRepository<UserLoyalty, Long> {
}