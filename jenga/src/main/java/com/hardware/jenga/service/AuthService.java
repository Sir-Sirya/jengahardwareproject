package com.hardware.jenga.service;

import com.hardware.jenga.config.JwtUtils;
import com.hardware.jenga.entity.User;
import com.hardware.jenga.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Hash the password before saving (Security Best Practice)
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        return userRepository.save(user);
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