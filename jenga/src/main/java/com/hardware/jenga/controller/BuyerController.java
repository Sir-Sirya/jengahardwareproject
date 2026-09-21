package com.hardware.jenga.controller;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hardware.jenga.entity.Order;
import com.hardware.jenga.entity.User;
import com.hardware.jenga.entity.UserAddress;
import com.hardware.jenga.entity.UserLoyalty;
import com.hardware.jenga.entity.UserPreference;
import com.hardware.jenga.repository.OrderRepository;
import com.hardware.jenga.repository.UserAddressRepository;
import com.hardware.jenga.repository.UserLoyaltyRepository;
import com.hardware.jenga.repository.UserPreferenceRepository;
import com.hardware.jenga.repository.UserRepository;

@RestController
@RequestMapping("/api/buyer")
public class BuyerController {

    private final UserRepository userRepository;
    private final UserAddressRepository addressRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final UserLoyaltyRepository loyaltyRepository;
    private final OrderRepository orderRepository;

    public BuyerController(
            UserRepository userRepository,
            UserAddressRepository addressRepository,
            UserPreferenceRepository preferenceRepository,
            UserLoyaltyRepository loyaltyRepository,
            OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.preferenceRepository = preferenceRepository;
        this.loyaltyRepository = loyaltyRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Resolves the authenticated user from the SecurityContext principal.
     */
    private User getAuthenticatedUser(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return null;
        }
        return userRepository.findByEmail(principal.getName().trim().toLowerCase()).orElse(null);
    }

    // 1. Get User Profile Overview
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null || user.getId() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        final Long userId = user.getId();

        UserPreference defaultPrefs = UserPreference.builder()
                .userId(userId)
                .emailReceipts(true)
                .smsDeliveryAlerts(true)
                .priceDropAlerts(false)
                .marketingNewsletter(false)
                .build();

        UserPreference prefs = preferenceRepository.findById(userId)
                .orElseGet(() -> preferenceRepository.save(defaultPrefs));

        UserLoyalty defaultLoyalty = UserLoyalty.builder()
                .userId(userId)
                .pointsBalance(100)
                .membershipTier("BRONZE")
                .storeCreditKes(BigDecimal.ZERO)
                .build();

        UserLoyalty loyalty = loyaltyRepository.findById(userId)
                .orElseGet(() -> loyaltyRepository.save(defaultLoyalty));

        return ResponseEntity.ok(Map.of(
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "email", user.getEmail() != null ? user.getEmail() : "",
                "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                "preferences", prefs,
                "loyalty", loyalty
        ));
    }

    // 2. Update Personal Details
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null || user.getId() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        if (body.containsKey("fullName") && body.get("fullName") != null) {
            user.setFullName(body.get("fullName").trim());
        }
        if (body.containsKey("phoneNumber") && body.get("phoneNumber") != null) {
            user.setPhoneNumber(body.get("phoneNumber").trim());
        }
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile details updated successfully."));
    }

    // 3. Address Book Operations
    @GetMapping("/addresses")
    public ResponseEntity<?> getAddresses(Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null || user.getId() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        final Long userId = user.getId();
        return ResponseEntity.ok(addressRepository.findByUserId(userId));
    }

    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(@RequestBody UserAddress address, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null || user.getId() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        final Long userId = user.getId();
        address.setUserId(userId);
        UserAddress saved = addressRepository.save(address);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null || user.getId() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        final Long userId = user.getId();
        addressRepository.findById(id).ifPresent(addr -> {
            if (userId.equals(addr.getUserId())) {
                addressRepository.delete(addr);
            }
        });
        return ResponseEntity.ok(Map.of("message", "Address deleted"));
    }

    // 4. Update Preferences
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody UserPreference newPrefs, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null || user.getId() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        final Long userId = user.getId();
        newPrefs.setUserId(userId);
        UserPreference saved = preferenceRepository.save(newPrefs);
        return ResponseEntity.ok(saved);
    }

    // 5. Fetch Actual Customer Orders
    @GetMapping("/orders")
    public ResponseEntity<?> getCustomerOrders(Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null || user.getEmail() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        List<Order> userOrders = orderRepository.findByCustomerEmailIgnoreCase(user.getEmail().trim());
        return ResponseEntity.ok(userOrders);
    }
}