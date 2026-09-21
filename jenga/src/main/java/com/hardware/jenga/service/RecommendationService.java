package com.hardware.jenga.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hardware.jenga.entity.Category;
import com.hardware.jenga.entity.Product;
import com.hardware.jenga.repository.ProductRepository;
import com.hardware.jenga.util.VectorUtils;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.model.embedding.EmbeddingModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service responsible for generating dense vector embeddings, computing vector cosine
 * similarity across catalog inventory, and retrieving semantically relevant products.
 */
@Service
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    /**
     * Minimum cosine similarity score required for an item to be considered a valid match.
     * Prevents recommending unrelated products (e.g. steel doors when asked for cement/plastering).
     */
    private static final double MIN_SIMILARITY_SCORE = 0.55;

    private final ProductRepository productRepository;
    private final EmbeddingModel embeddingModel;
    private final ObjectMapper objectMapper;

    public RecommendationService(ProductRepository productRepository, EmbeddingModel embeddingModel) {
        this.productRepository = productRepository;
        this.embeddingModel = embeddingModel;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Builds enriched contextual text for embedding generation.
     * Injects the product title, subcategory, parent department, description, and price.
     */
    public String buildProductTextForEmbedding(Product product) {
        StringBuilder sb = new StringBuilder();
        sb.append("Product: ").append(product.getTitle() != null ? product.getTitle() : "").append(". ");

        if (product.getCategory() != null) {
            Category subCategory = product.getCategory();
            sb.append("Category: ").append(subCategory.getName()).append(". ");
            if (subCategory.getParent() != null && subCategory.getParent().getName() != null) {
                sb.append("Department: ").append(subCategory.getParent().getName()).append(". ");
            }
        }

        if (product.getDescription() != null && !product.getDescription().isBlank()) {
            sb.append("Description: ").append(product.getDescription()).append(". ");
        }

        sb.append(String.format("Price: KES %.2f", product.getPrice() != null ? product.getPrice() : 0.0));
        return sb.toString().trim();
    }

    /**
     * Generates and persists the vector embedding for a single product by ID.
     */
    @Transactional
    public void generateProductEmbedding(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));

        String contentToEmbed = buildProductTextForEmbedding(product);

        try {
            Embedding embedding = embeddingModel.embed(contentToEmbed).content();
            product.setEmbedding(objectMapper.writeValueAsString(embedding.vector()));
            productRepository.save(product);
            log.info("Successfully generated and saved embedding for product ID: {} ({})", productId, product.getTitle());
        } catch (Exception e) {
            log.error("Failed to generate or persist embedding for product ID: {}. Error: {}", productId, e.getMessage());
            throw new RuntimeException("Failed to serialize embedding for product ID: " + productId, e);
        }
    }

    /**
     * Searches products using a natural-language query string (used by AiAssistantService).
     */
    @Transactional(readOnly = true)
    public List<Product> searchRelevantProducts(String query, int limit) {
        return searchBySemanticQuery(query, limit);
    }

    /**
     * Searches products using a semantic natural-language query string.
     * Filters out candidates below MIN_SIMILARITY_SCORE to eliminate hallucinated/unrelated items.
     * Automatically falls back to keyword matching if embedding quota limits or errors occur.
     */
    @Transactional(readOnly = true)
    public List<Product> searchBySemanticQuery(String queryText, int limit) {
        if (queryText == null || queryText.isBlank()) {
            return Collections.emptyList();
        }

        try {
            Embedding queryEmbedding = embeddingModel.embed(queryText).content();
            float[] queryVector = queryEmbedding.vector();

            List<Product> productsWithEmbeddings = productRepository.findByEmbeddingIsNotNull();

            List<Product> semanticMatches = productsWithEmbeddings.stream()
                    .filter(p -> p.getEmbedding() != null && !p.getEmbedding().isBlank())
                    .map(p -> new AbstractMap.SimpleEntry<>(p, calculateCosineSimilarity(queryVector, parseVector(p.getEmbedding()))))
                    .filter(entry -> entry.getValue() >= MIN_SIMILARITY_SCORE) // Filter out weak matches
                    .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                    .limit(limit)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());

            // If we found solid semantic matches above threshold, return them
            if (!semanticMatches.isEmpty()) {
                return semanticMatches;
            }

            log.info("No semantic matches found above similarity threshold ({}). Running keyword fallback.", MIN_SIMILARITY_SCORE);
        } catch (Exception ex) {
            log.warn("Semantic embedding search unavailable or rate-limited. Falling back to keyword search: {}", ex.getMessage());
        }

        return fallbackKeywordSearch(queryText, limit);
    }

    /**
     * Retrieves top similar products based on vector cosine similarity.
     */
    @Transactional(readOnly = true)
    public List<Product> getSimilarProducts(Long productId, int limit) {
        Product target = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));

        if (target.getEmbedding() == null || target.getEmbedding().isBlank()) {
            try {
                generateProductEmbedding(productId);
                target = productRepository.findById(productId).orElseThrow();
            } catch (Exception ex) {
                log.warn("Unable to generate embedding on-the-fly for product ID {}. Falling back to category matches.", productId);
                return fallbackCategoryMatches(target, limit);
            }
        }

        float[] targetVector = parseVector(target.getEmbedding());
        if (targetVector.length == 0) {
            return fallbackCategoryMatches(target, limit);
        }

        List<Product> productsWithEmbeddings = productRepository.findByEmbeddingIsNotNull();

        return productsWithEmbeddings.stream()
                .filter(p -> !p.getId().equals(productId) && p.getEmbedding() != null && !p.getEmbedding().isBlank())
                .map(p -> new AbstractMap.SimpleEntry<>(p, calculateCosineSimilarity(targetVector, parseVector(p.getEmbedding()))))
                .filter(entry -> entry.getValue() >= MIN_SIMILARITY_SCORE)
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Fallback keyword search across title, description, subcategory, and parent department.
     */
    private List<Product> fallbackKeywordSearch(String queryText, int limit) {
        String[] keywords = queryText.toLowerCase().split("\\s+");
        List<Product> allProducts = productRepository.findAll();

        return allProducts.stream()
                .filter(p -> {
                    String title = p.getTitle() != null ? p.getTitle().toLowerCase() : "";
                    String desc = p.getDescription() != null ? p.getDescription().toLowerCase() : "";
                    String cat = (p.getCategory() != null && p.getCategory().getName() != null)
                            ? p.getCategory().getName().toLowerCase()
                            : "";
                    String parentCat = (p.getCategory() != null && p.getCategory().getParent() != null && p.getCategory().getParent().getName() != null)
                            ? p.getCategory().getParent().getName().toLowerCase()
                            : "";

                    return Arrays.stream(keywords).anyMatch(k ->
                            !k.isBlank() && (title.contains(k) || desc.contains(k) || cat.contains(k) || parentCat.contains(k))
                    );
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Fallback matching by same category when embedding comparisons are unavailable.
     */
    private List<Product> fallbackCategoryMatches(Product target, int limit) {
        if (target.getCategory() == null) {
            return productRepository.findAll().stream()
                    .filter(p -> !p.getId().equals(target.getId()))
                    .limit(limit)
                    .collect(Collectors.toList());
        }

        return productRepository.findAll().stream()
                .filter(p -> !p.getId().equals(target.getId())
                        && p.getCategory() != null
                        && target.getCategory().getId().equals(p.getCategory().getId()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Computes cosine similarity with safety checks and arithmetic fallback.
     */
    private double calculateCosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null || vectorA.length == 0 || vectorB.length == 0 || vectorA.length != vectorB.length) {
            return 0.0;
        }

        try {
            return VectorUtils.cosineSimilarity(vectorA, vectorB);
        } catch (Throwable fallback) {
            double dotProduct = 0.0;
            double normA = 0.0;
            double normB = 0.0;

            for (int i = 0; i < vectorA.length; i++) {
                dotProduct += vectorA[i] * vectorB[i];
                normA += Math.pow(vectorA[i], 2);
                normB += Math.pow(vectorB[i], 2);
            }

            if (normA == 0.0 || normB == 0.0) {
                return 0.0;
            }

            return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        }
    }

    /**
     * Deserializes a JSON array string into a primitive float array.
     */
    private float[] parseVector(String json) {
        if (json == null || json.isBlank()) {
            return new float[0];
        }
        try {
            List<Float> list = objectMapper.readValue(json, new TypeReference<List<Float>>() {});
            float[] array = new float[list.size()];
            for (int i = 0; i < list.size(); i++) {
                array[i] = list.get(i);
            }
            return array;
        } catch (Exception e) {
            return new float[0];
        }
    }
}