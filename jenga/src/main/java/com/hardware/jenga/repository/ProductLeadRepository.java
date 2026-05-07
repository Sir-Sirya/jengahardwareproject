package com.hardware.jenga.repository;

import com.hardware.jenga.entity.ProductLead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductLeadRepository extends JpaRepository<ProductLead, Long> {
    List<ProductLead> findByBuyerId(Long buyerId);
}
