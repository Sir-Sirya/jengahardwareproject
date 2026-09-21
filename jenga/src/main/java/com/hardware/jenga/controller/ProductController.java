package com.hardware.jenga.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hardware.jenga.dto.ProductRequest;
import com.hardware.jenga.dto.ProductResponse;
import com.hardware.jenga.entity.Category;
import com.hardware.jenga.entity.Notification;
import com.hardware.jenga.entity.Product;
import com.hardware.jenga.entity.User;
import com.hardware.jenga.repository.BusinessProfileRepository;
import com.hardware.jenga.repository.CategoryRepository;
import com.hardware.jenga.repository.NotificationRepository;
import com.hardware.jenga.repository.ProductLeadRepository;
import com.hardware.jenga.repository.ProductRepository;
import com.hardware.jenga.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BusinessProfileRepository businessProfileRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ProductLeadRepository productLeadRepository;

    private void createSellerNotification(User user, String message) {
        try {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setMessage(message);
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } catch (Exception ignored) {}
    }

    @PostMapping
    public ResponseEntity<?> addProduct(@Valid @RequestBody ProductRequest request, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!businessProfileRepository.existsByUserId(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "PROFILE_INCOMPLETE",
                    "message", "Please complete your business profile before posting products."
            ));
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = new Product();
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setVideoUrl(request.getVideoUrl());
        product.setWhatsappLink(request.getWhatsappLink());
        product.setIsActive(Boolean.TRUE.equals(request.getIsActive()));
        product.setCategory(category);
        product.setSeller(user);

        Product savedProduct = productRepository.save(product);
        createSellerNotification(user, "You have successfully added product: " + savedProduct.getTitle());

        return ResponseEntity.ok(ProductResponse.fromEntity(savedProduct));
    }

    @GetMapping("/public")
    public List<ProductResponse> getAllProducts(@RequestParam(required = false) String sort) {
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.getIsActive() == null || Boolean.TRUE.equals(p.getIsActive()))
                .collect(Collectors.toList());
        return sortAndMap(products, sort);
    }

    /**
     * Hierarchical Lookup: Returns products belonging directly to categoryId OR any child subcategory.
     */
    @GetMapping("/public/category/{categoryId}")
    public List<ProductResponse> getProductsByCategory(@PathVariable Integer categoryId, @RequestParam(required = false) String sort) {
        List<Product> products = productRepository.findByCategoryIdIncludingChildren(categoryId);
        return sortAndMap(products, sort);
    }

    /**
     * Today's Picks: Listings created in the last 48 hours.
     * Falls back to the latest 8 products if fewer than 4 items were added recently.
     */
    @GetMapping("/public/todays-picks")
    public List<ProductResponse> getTodaysPicks() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(48);
        List<Product> picks = productRepository.findRecentProducts(cutoff);

        if (picks.size() < 4) {
            picks = productRepository.findTopRecent(PageRequest.of(0, 8));
        }

        return picks.stream()
                .map(ProductResponse::fromEntity)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Trending: Products ranked by total buyer inquiries/leads generated.
     */
    @GetMapping("/public/trending")
    public List<ProductResponse> getTrendingProducts(@RequestParam(defaultValue = "8") int limit) {
        List<Long> trendingIds = productLeadRepository.findTrendingProductIds(PageRequest.of(0, limit));
        List<Product> trendingList = new ArrayList<>();

        if (!trendingIds.isEmpty()) {
            for (Long id : trendingIds) {
                productRepository.findById(id).ifPresent(trendingList::add);
            }
        }

        // Fallback: If no leads exist yet, return newest products
        if (trendingList.isEmpty()) {
            trendingList = productRepository.findTopRecent(PageRequest.of(0, limit));
        }

        return trendingList.stream()
                .map(ProductResponse::fromEntity)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private List<ProductResponse> sortAndMap(List<Product> products, String sort) {
        if ("price-asc".equals(sort)) {
            products.sort(Comparator.comparing(Product::getPrice));
        } else if ("price-desc".equals(sort)) {
            products.sort(Comparator.comparing(Product::getPrice).reversed());
        } else if ("newest".equals(sort)) {
            products.sort(Comparator.comparing(Product::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        }
        return products.stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ProductResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/seller/my-products")
    public List<ProductResponse> getMyProducts(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return productRepository.findBySellerId(user.getId()).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleProductStatus(@PathVariable Long id, Authentication authentication) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!product.getSeller().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not authorized"));
        }

        boolean newStatus = !(product.getIsActive() != null && product.getIsActive());
        product.setIsActive(newStatus);
        productRepository.save(product);

        String statusLabel = newStatus ? "Active" : "Inactive";
        createSellerNotification(user, "Product '" + product.getTitle() + "' marked as " + statusLabel);

        return ResponseEntity.ok(Map.of(
                "message", "Product status updated to " + statusLabel,
                "isActive", newStatus
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request, Authentication authentication) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!product.getSeller().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not authorized"));
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setVideoUrl(request.getVideoUrl());
        product.setWhatsappLink(request.getWhatsappLink());
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }
        product.setCategory(category);

        Product updatedProduct = productRepository.save(product);
        createSellerNotification(user, "You have successfully updated product: " + updatedProduct.getTitle());

        return ResponseEntity.ok(ProductResponse.fromEntity(updatedProduct));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id, Authentication authentication) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!product.getSeller().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not authorized"));
        }

        String productTitle = product.getTitle();
        productRepository.deleteById(id);
        createSellerNotification(user, "You have successfully deleted product: " + productTitle);

        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }
}