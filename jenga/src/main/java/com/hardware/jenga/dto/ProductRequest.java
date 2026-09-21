package com.hardware.jenga.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class ProductRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    private String description;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be non-negative")
    private Double price;

    // Optional: Defaults to 1 if not sent by client (since tracking is binary: Available vs Out of Stock)
    @PositiveOrZero(message = "Stock quantity must be non-negative")
    private Integer stockQuantity = 1;

    @NotNull(message = "Category is required")
    private Integer categoryId;

    @Size(max = 255, message = "Image URL cannot exceed 255 characters")
    private String imageUrl;

    @Size(max = 500, message = "Video URL cannot exceed 500 characters")
    private String videoUrl;

    @Size(max = 255, message = "WhatsApp link cannot exceed 255 characters")
    private String whatsappLink;

    private Boolean isActive = true;

    public ProductRequest() {
    }

    public ProductRequest(String title, String description, Double price, Integer stockQuantity,
                          Integer categoryId, String imageUrl, String videoUrl, String whatsappLink, Boolean isActive) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity != null ? stockQuantity : 1;
        this.categoryId = categoryId;
        this.imageUrl = imageUrl;
        this.videoUrl = videoUrl;
        this.whatsappLink = whatsappLink;
        this.isActive = isActive != null ? isActive : true;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity != null ? stockQuantity : 1;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getWhatsappLink() {
        return whatsappLink;
    }

    public void setWhatsappLink(String whatsappLink) {
        this.whatsappLink = whatsappLink;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}