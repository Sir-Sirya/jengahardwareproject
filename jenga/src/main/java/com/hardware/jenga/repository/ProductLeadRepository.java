package com.hardware.jenga.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.hardware.jenga.entity.ProductLead;

@Repository
public interface ProductLeadRepository extends JpaRepository<ProductLead, Long> {

    List<ProductLead> findByBuyerId(Long buyerId);

    /**
     * Identifies trending products by counting total buyer leads/orders per product.
     */
    /**
     * Identifies trending product IDs using direct native SQL table joins,
     * resolving attribute mapping mismatches on the ProductLead entity.
     */
    @Query(value = """
        SELECT pl.product_id 
        FROM product_leads pl 
        JOIN products p ON pl.product_id = p.id 
        WHERE p.is_active = 1 
        GROUP BY pl.product_id 
        ORDER BY COUNT(pl.id) DESC
    """, nativeQuery = true)
    List<Long> findTrendingProductIds(Pageable pageable);
}