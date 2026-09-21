package com.hardware.jenga.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hardware.jenga.entity.UserAddress;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findByUserId(Long userId);
}