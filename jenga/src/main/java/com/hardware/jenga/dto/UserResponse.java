package com.hardware.jenga.dto;

import com.hardware.jenga.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private User.Role role;
    private String phoneNumber;
    private LocalDateTime createdAt;

    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        UserResponse resp = new UserResponse();
        resp.setId(user.getId());
        resp.setFullName(user.getFullName());
        resp.setEmail(user.getEmail());
        resp.setRole(user.getRole());
        resp.setPhoneNumber(user.getPhoneNumber());
        resp.setCreatedAt(user.getCreatedAt());
        return resp;
    }
}
