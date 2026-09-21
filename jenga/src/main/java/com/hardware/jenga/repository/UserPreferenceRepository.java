package com.hardware.jenga.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hardware.jenga.entity.UserPreference;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
}
