package com.hardware.jenga.controller;

import com.hardware.jenga.dto.AiChatRequest;
import com.hardware.jenga.dto.AiChatResponse;
import com.hardware.jenga.dto.ProductResponse;
import com.hardware.jenga.service.AiAssistantService;
import com.hardware.jenga.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final AiAssistantService aiAssistantService;

    public RecommendationController(RecommendationService recommendationService, AiAssistantService aiAssistantService) {
        this.recommendationService = recommendationService;
        this.aiAssistantService = aiAssistantService;
    }

    /**
     * Retrieves similar products based on vector cosine similarity.
     */
    @GetMapping("/products/{id}/similar")
    public ResponseEntity<List<ProductResponse>> getSimilarProducts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "4") int limit) {

        List<ProductResponse> similarProducts = recommendationService.getSimilarProducts(id, limit)
                .stream()
                .map(ProductResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(similarProducts);
    }

    /**
     * Interacts with the AI hardware advisor using Google Gemini and RAG context.
     * Supports both standard class getter (getMessage()) and record accessor (message()).
     */
    @PostMapping("/ai/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody(required = false) AiChatRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().body(
                    new AiChatResponse("Please provide a valid question or describe your project.", Collections.emptyList())
            );
        }

        String userPrompt = request.getMessage();
        if (userPrompt == null || userPrompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    new AiChatResponse("Please provide a valid question or describe your project.", Collections.emptyList())
            );
        }

        AiChatResponse response = aiAssistantService.chatWithAssistant(userPrompt.trim());
        return ResponseEntity.ok(response);
    }
}