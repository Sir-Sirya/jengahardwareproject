package com.hardware.jenga.controller;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import com.hardware.jenga.entity.Product;
import com.hardware.jenga.entity.User;
import com.hardware.jenga.repository.CategoryRepository;
import com.hardware.jenga.repository.ProductRepository;
import com.hardware.jenga.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;

    private final UserRepository userRepository;

    private final CategoryRepository categoryRepository;

    // CREATE: Add a new product (authenticated seller) 
    @PostMapping
    public ResponseEntity<ProductResponse> addProduct(@Valid @RequestBody ProductRequest request, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = new Product();
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setWhatsappLink(request.getWhatsappLink());
        product.setCategory(category);
        product.setSeller(user);

        return ResponseEntity.ok(ProductResponse.fromEntity(productRepository.save(product)));
    }

    // READ: Get all products for public discovery
    @GetMapping("/public")
    public List<ProductResponse> getAllProducts(@RequestParam(required = false) String sort) {
        List<Product> products = productRepository.findAll();
        return sortAndMap(products, sort);
    }

    // READ: Get products by category
    @GetMapping("/public/category/{categoryId}")
    public List<ProductResponse> getProductsByCategory(@PathVariable Integer categoryId, @RequestParam(required = false) String sort) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        return sortAndMap(products, sort);
    }

    private List<ProductResponse> sortAndMap(List<Product> products, String sort) {
        if ("price-asc".equals(sort)) {
            products.sort(Comparator.comparing(Product::getPrice));
        } else if ("price-desc".equals(sort)) {
            products.sort(Comparator.comparing(Product::getPrice).reversed());
        } else if ("newest".equals(sort)) {
            products.sort(Comparator.comparing(Product::getCreatedAt).reversed());
        }
        return products.stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // READ: Get single product by ID (public)
    @GetMapping("/public/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ProductResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // READ: Get authenticated seller's products
    @GetMapping("/seller/my-products")
    public List<ProductResponse> getMyProducts(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return productRepository.findBySellerId(user.getId()).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // UPDATE: Update a product (seller must own it)
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request, Authentication authentication) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!product.getSeller().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setWhatsappLink(request.getWhatsappLink());
        product.setCategory(category);

        return ResponseEntity.ok(ProductResponse.fromEntity(productRepository.save(product)));
    }

    // DELETE: Remove a listing (seller must own it)
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

        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    // Inventory Monitoring: low stock for authenticated seller
    @GetMapping("/seller/my-products/low-stock")
    public List<ProductResponse> getMyLowStockProducts(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return productRepository.findBySellerId(user.getId()).stream()
                .filter(p -> p.getStockQuantity() <= p.getSeller().getBusinessProfile().getLowStockThreshold())
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }
}