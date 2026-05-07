package com.hardware.jenga.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hardware.jenga.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Fetch unread alerts for a specific vendor's dashboard
    List<Notification> findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
}