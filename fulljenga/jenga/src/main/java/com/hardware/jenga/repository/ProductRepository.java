package com.hardware.jenga.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hardware.jenga.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Find all products belonging to a specific Gikomba vendor
    List<Product> findBySellerId(Long sellerId);
    
    // Find products by category for the discovery page
    List<Product> findByCategoryId(Integer categoryId);
}