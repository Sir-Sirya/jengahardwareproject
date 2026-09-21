package com.hardware.jenga.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hardware.jenga.entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerEmailIgnoreCase(String customerEmail);
    Optional<Order> findByTrackingNumber(String trackingNumber);
    Optional<Order> findByIdempotencyKey(String idempotencyKey);
    Optional<Order> findByCheckoutRequestId(String checkoutRequestId);
}