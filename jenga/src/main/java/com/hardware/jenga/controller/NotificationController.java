package com.hardware.jenga.controller;

import com.hardware.jenga.entity.Notification;
import com.hardware.jenga.entity.User;
import com.hardware.jenga.repository.NotificationRepository;
import com.hardware.jenga.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Notification> getMyNotifications(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> notifications = notificationRepository.findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        for (Notification n : notifications) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
