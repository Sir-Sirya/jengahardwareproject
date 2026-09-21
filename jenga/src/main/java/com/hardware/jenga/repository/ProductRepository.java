package com.hardware.jenga.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hardware.jenga.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findBySellerId(Long sellerId);

    // Legacy direct match
    List<Product> findByCategoryId(Integer categoryId);

    /**
     * Retrieves products assigned directly to this category OR to any child subcategory.
     */
    @Query("""
        SELECT p FROM Product p 
        WHERE (p.category.id = :categoryId OR p.category.parent.id = :categoryId) 
          AND (p.isActive IS NULL OR p.isActive = true)
    """)
    List<Product> findByCategoryIdIncludingChildren(@Param("categoryId") Integer categoryId);

    /**
     * Today's Picks: Active products created or posted within the specified cutoff window.
     */
    @Query("""
        SELECT p FROM Product p 
        WHERE p.createdAt >= :cutoff 
          AND (p.isActive IS NULL OR p.isActive = true) 
        ORDER BY p.createdAt DESC
    """)
    List<Product> findRecentProducts(@Param("cutoff") LocalDateTime cutoff);

    /**
     * Fallback for Today's Picks when few items were added within 48h.
     */
    @Query("""
        SELECT p FROM Product p 
        WHERE (p.isActive IS NULL OR p.isActive = true) 
        ORDER BY p.createdAt DESC
    """)
    List<Product> findTopRecent(Pageable pageable);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.embedding IS NOT NULL")
    List<Product> findByEmbeddingIsNotNull();

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.embedding IS NULL")
    List<Product> findByEmbeddingIsNull();
}