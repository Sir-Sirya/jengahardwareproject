package com.hardware.jenga.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hardware.jenga.config.JwtUtils;
import com.hardware.jenga.dto.SignupRequest;
import com.hardware.jenga.dto.UserResponse;
import com.hardware.jenga.entity.User;
import com.hardware.jenga.service.AuthService;

import jakarta.validation.Valid;

/**
 * Integrated AuthController for Jenga Marketplace.
 * Handles user onboarding and secure JWT issuance.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Endpoint for new vendor/buyer registration.
     * Returns { token, user } for immediate frontend login.
     */
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody SignupRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            User savedUser = authService.registerUser(request);
            String token = jwtUtils.generateToken(savedUser.getEmail());
            response.put("token", token);
            response.put("user", UserResponse.fromEntity(savedUser));
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Endpoint for user login.
     * Returns { token, user } for frontend auth context.
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");
            String token = authService.loginUser(email, password);
            User user = authService.findByEmail(email);
            response.put("token", token);
            response.put("user", UserResponse.fromEntity(user));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Invalid email or password");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }
}