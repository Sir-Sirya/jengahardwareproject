package com.hardware.jenga.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hardware.jenga.entity.Notification;
import com.hardware.jenga.entity.Product;
import com.hardware.jenga.repository.NotificationRepository;
import com.hardware.jenga.repository.ProductRepository;

@Service
public class InventoryService {

    private static final int DEFAULT_DEPLETION_THRESHOLD = 0; // Out-of-stock threshold

    private final ProductRepository productRepository;
    private final NotificationRepository notificationRepository;

    public InventoryService(ProductRepository productRepository, NotificationRepository notificationRepository) {
        this.productRepository = productRepository;
        this.notificationRepository = notificationRepository;
    }

    // Runs periodically to automatically deactivate listings that hit zero stock
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void monitorInventoryLevels() {
        List<Product> products = productRepository.findAll();

        for (Product product : products) {
            if (product.getSeller() == null || product.getStockQuantity() == null) {
                continue;
            }

            // If an active listing has completely sold out, auto-deactivate and notify the seller
            if (Boolean.TRUE.equals(product.getIsActive()) && product.getStockQuantity() <= DEFAULT_DEPLETION_THRESHOLD) {
                product.setIsActive(false);
                productRepository.save(product);

                createStockDepletedNotification(product);
            }
        }
    }

    private void createStockDepletedNotification(Product product) {
        try {
            Notification notification = new Notification();
            notification.setUser(product.getSeller());
            notification.setMessage("Inventory Alert: '" + product.getTitle() + "' is out of stock (0 units remaining). Listing has been set to Inactive.");
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } catch (Exception ignored) {
            // Notification logging failure should not halt scheduled maintenance
        }
    }
}