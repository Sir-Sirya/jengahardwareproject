package com.hardware.jenga.dto;

import com.hardware.jenga.entity.Product;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductResponse {
    private Long id;
    private String title;
    private String description;
    private Double price;
    private Integer stockQuantity;
    private String imageUrl;
    private String whatsappLink;
    private LocalDateTime createdAt;
    private UserResponse seller;
    private CategoryResponse category;

    public static ProductResponse fromEntity(Product product) {
        if (product == null) return null;
        ProductResponse resp = new ProductResponse();
        resp.setId(product.getId());
        resp.setTitle(product.getTitle());
        resp.setDescription(product.getDescription());
        resp.setPrice(product.getPrice());
        resp.setStockQuantity(product.getStockQuantity());
        resp.setImageUrl(product.getImageUrl());
        resp.setWhatsappLink(product.getWhatsappLink());
        resp.setCreatedAt(product.getCreatedAt());
        resp.setSeller(UserResponse.fromEntity(product.getSeller()));
        resp.setCategory(CategoryResponse.fromEntity(product.getCategory()));
        return resp;
    }
}
