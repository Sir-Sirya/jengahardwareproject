package com.hardware.jenga.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hardware.jenga.entity.Product;

public record ProductResponse(
    Long id,
    String title,
    String description,
    Double price,
    Integer stockQuantity,
    String imageUrl,
    String categoryName,
    Integer categoryId,
    Long sellerId,
    String sellerName,
    String whatsappLink,
    String videoUrl,
    
    @JsonProperty("isActive")
    Boolean isActive
) {
    public static ProductResponse fromEntity(Product product) {
        if (product == null) return null;

        Integer categoryId = null;
        String categoryName = "";
        try {
            if (product.getCategory() != null) {
                categoryId = product.getCategory().getId();
                categoryName = product.getCategory().getName() != null 
                        ? product.getCategory().getName() 
                        : "";
            }
        } catch (Exception ignored) {
            categoryId = null;
            categoryName = "";
        }

        Long sellerId = null;
        String sellerName = "";
        try {
            if (product.getSeller() != null) {
                sellerId = product.getSeller().getId();
                sellerName = product.getSeller().getFullName() != null 
                        ? product.getSeller().getFullName() 
                        : "";
            }
        } catch (Exception ignored) {
            sellerId = null;
            sellerName = "";
        }

        // Resolves null active states to true by default
        Boolean resolvedActive = product.getIsActive() != null ? product.getIsActive() : true;

        return new ProductResponse(
            product.getId(),
            product.getTitle(),
            product.getDescription(),
            product.getPrice(),
            product.getStockQuantity() != null ? product.getStockQuantity() : 1,
            product.getImageUrl(),
            categoryName,
            categoryId,
            sellerId,
            sellerName,
            product.getWhatsappLink(),
            product.getVideoUrl(),
            resolvedActive
        );
    }
}