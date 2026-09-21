package com.hardware.jenga.service;

import com.hardware.jenga.entity.*;
import com.hardware.jenga.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // This method runs every hour to check for low stock
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void checkLowStockLevels() {
        List<Product> products = productRepository.findAll();
        
        for (Product product : products) {
            BusinessProfile profile = product.getSeller().getBusinessProfile(); // Ensure relationship exists
            
            if (product.getStockQuantity() <= profile.getLowStockThreshold()) {
                createLowStockNotification(product);
            }
        }
    }

    private void createLowStockNotification(Product product) {
        Notification notification = new Notification();
        notification.setUser(product.getSeller());
        notification.setType(Notification.NotificationType.LOW_STOCK);
        notification.setMessage("Alert: " + product.getTitle() + " is low on stock (" + product.getStockQuantity() + " left).");
        notificationRepository.save(notification);
    }
} 