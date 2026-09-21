package com.hardware.jenga.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hardware.jenga.config.JwtUtils;
import com.hardware.jenga.dto.SignupRequest;
import com.hardware.jenga.entity.BusinessProfile;
import com.hardware.jenga.entity.User;
import com.hardware.jenga.repository.BusinessProfileRepository;
import com.hardware.jenga.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessProfileRepository businessProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public User registerUser(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(request.getRole());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        // Create business profile for sellers
        if (savedUser.getRole() == User.Role.SELLER) {
            BusinessProfile profile = new BusinessProfile();
            profile.setUser(savedUser);
            profile.setBusinessName(request.getBusinessName() != null ? request.getBusinessName() : savedUser.getFullName());
            profile.setMpesaNumber(request.getMpesaNumber() != null ? request.getMpesaNumber() : savedUser.getPhoneNumber());
            profile.setLowStockThreshold(5);
            businessProfileRepository.save(profile);
        }

        return savedUser;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public String loginUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPasswordHash())) {
            return jwtUtils.generateToken(email);
        }
        
        throw new RuntimeException("Error: Invalid email or password!");
    }
}