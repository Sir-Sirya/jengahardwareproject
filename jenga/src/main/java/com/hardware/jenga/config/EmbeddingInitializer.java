package com.hardware.jenga.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.hardware.jenga.entity.Product;
import com.hardware.jenga.repository.ProductRepository;
import com.hardware.jenga.service.RecommendationService;

/**
 * Startup component that scans the database and generates vector embeddings
 * for any product lacking embeddings or whose category relationship was modified.
 */
@Configuration
public class EmbeddingInitializer {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingInitializer.class);

    @Bean
    CommandLineRunner backfillProductEmbeddings(ProductRepository productRepository, RecommendationService recommendationService) {
        return args -> {
            try {
                // Find all products where embedding has not yet been computed
                List<Product> missingEmbeddings = productRepository.findByEmbeddingIsNull();

                if (!missingEmbeddings.isEmpty()) {
                    log.info("Generating vector embeddings for {} products lacking vectors...", missingEmbeddings.size());
                    int successCount = 0;

                    for (Product product : missingEmbeddings) {
                        try {
                            recommendationService.generateProductEmbedding(product.getId());
                            successCount++;
                        } catch (Exception itemEx) {
                            log.error("Failed to generate embedding for product ID {}: {}", product.getId(), itemEx.getMessage());
                        }
                    }

                    log.info("Product embeddings backfill complete: {}/{} successful.", successCount, missingEmbeddings.size());
                } else {
                    log.info("All catalog products have valid embeddings. Backfill skipped.");
                }
            } catch (Exception e) {
                log.warn("Notice: Skipping startup embedding backfill: {}", e.getMessage());
            }
        };
    }
}