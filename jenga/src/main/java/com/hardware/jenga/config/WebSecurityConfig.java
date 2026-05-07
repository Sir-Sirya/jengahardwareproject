package com.hardware.jenga.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Objective: Confidentiality through password hashing.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Objective: Availability and Integration by allowing CORS from React[cite: 2, 3].
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173") // Your React Dev Server
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        // 1. Disable CSRF for REST APIs
        .csrf(csrf -> csrf.disable())
        
        // 2. Enable CORS with the configuration we defined above[cite: 2]
        .cors(cors -> {}) 
        
        // 3. Define access rules[cite: 2]
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/products/public/**").permitAll()
            // Permit public access to the category hierarchy for the dropdown[cite: 3, 4]
            .requestMatchers("/api/categories/hierarchy").permitAll()
            // Admin-only endpoints
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated()
        )
        
        // 4. Add the JWT filter for secure session management[cite: 2]
        .addFilterBefore(jwtAuthenticationFilter, 
                         org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
    
    return http.build();
}
}