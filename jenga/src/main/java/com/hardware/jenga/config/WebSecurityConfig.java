package com.hardware.jenga.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Central Web Security Configuration for Jenga Marketplace.
 * Configures:
 * 1. Stateless JWT authentication architecture.
 * 2. Cross-Origin Resource Sharing (CORS) rules supporting local development,
 *    Microsoft Dev Tunnels, and ngrok endpoints.
 * 3. Static resource resolution for uploaded product assets.
 * 4. Granular URL authorization rules (protecting Admin and Buyer endpoints while
 *    leaving Safaricom webhooks and catalog discovery public).
 */
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Injects the custom Stateless JWT filter into the Spring Security pipeline.
     */
    public WebSecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * BCrypt password encoder bean used for hashing and validating user credentials.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Defines the CORS policy for incoming browser requests:
     * - Whitelists local Vite development servers (ports 5173, 3000, etc.).
     * - Authorizes wildcard patterns for Microsoft Dev Tunnels (*.devtunnels.ms)
     *   and ngrok tunnels (*.ngrok-free.app, *.ngrok-free.dev) to ensure remote advisors
     *   and Safaricom gateways are not blocked by browser CORS checks.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://*.devtunnels.ms",
            "https://*.ngrok-free.app",
            "https://*.ngrok-free.dev"
        ));
        
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Idempotency-Key"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Static media resource handler.
     * Serves images, datasheets, and hardware photos uploaded to the local 
     * 'uploads/' directory directly under the public '/uploads/**' URL path.
     */
    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:uploads/");
            }
        };
    }

    /**
     * Primary HTTP Security Filter Chain:
     * Configures the defense perimeter and route accessibility.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF since REST clients communicate statelessly via Bearer JWTs
            .csrf(csrf -> csrf.disable())

            // 2. Attach the permissive CORS policy configured above
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Stateless session strategy: prevents the creation of server-side HTTP sessions
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 4. Endpoint Access Restrictions
            .authorizeHttpRequests(auth -> auth
                // Allow unauthenticated preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public Safaricom Daraja Webhook Route:
                // Safaricom servers make automated POST requests here without user tokens
                .requestMatchers("/api/payments/**").permitAll()

                // Public Checkout & Real-Time Polling:
                // Allows initial transaction creation and checkout polling before authentication is verified
                .requestMatchers("/api/orders/checkout").permitAll()
                .requestMatchers("/api/orders/track/**").permitAll()

                // Public Browsing & AI Discovery Features:
                // Public catalog endpoints, category taxonomies, and Gemini LLM assistant queries
                .requestMatchers("/api/ai/**").permitAll()
                .requestMatchers("/api/products/public/**").permitAll()
                .requestMatchers("/api/products/search/**").permitAll()
                .requestMatchers("/api/categories/**").permitAll()

                // User Authentication: registration and token generation
                .requestMatchers("/api/auth/**").permitAll()

                // Public Static Assets: uploaded images and product icons
                .requestMatchers("/uploads/**").permitAll()

                // Restricted Administrative Endpoints:
                // Requires authenticated user with the 'ADMIN' role authority
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Restricted Buyer & Seller Account Actions:
                // All other operations (/api/buyer/**, /api/seller/**, etc.) require an authenticated JWT
                .anyRequest().authenticated()
            )

            // 5. Inject the stateless JWT validation filter before standard Spring authentication
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}