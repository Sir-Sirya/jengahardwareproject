package com.hardware.jenga.service;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.hardware.jenga.dto.AiChatRequest;
import com.hardware.jenga.dto.AiChatResponse;
import com.hardware.jenga.dto.ProductResponse;
import com.hardware.jenga.entity.Product;

import dev.langchain4j.model.chat.ChatLanguageModel;

/**
 * Technical AI Construction & Hardware Advisor.
 * Interprets user inquiries, injects vetted category context and safety parameters,
 * and formats personalized DIY procedures and material recommendations.
 */
@Service
public class AiAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AiAssistantService.class);

    private final ChatLanguageModel chatLanguageModel;
    private final RecommendationService recommendationService;

    /**
     * System prompt establishing domain authority, construction math, DIY steps,
     * and strictly constraining recommendations to matching inventory.
     */
    private static final String SYSTEM_PROMPT_TEMPLATE = """
        You are the senior 'Jenga Project Advisor' for Jenga Marketplace in Nairobi, Kenya.
        You are a seasoned Kenyan structural engineer and master hardware specialist.

        OUR 9 OFFICIAL MARKETPLACE DEPARTMENTS:
        1. Paints & Painting Supplies (Crown Paint, Duracoat Paint, Paint Brushes & Rollers)
        2. Gate Accessories (Decor Sheet, Gate Arrow Designs)
        3. Doors & Frames (Steel Doors, Wooden Doors, Roller Shutters, Door Frames 6x2/4x2, Door Locks)
        4. Ceramics & Sanitaryware (Wall & Floor Tiles, Sanitaryware & Bathrooms, Tableware & Kitchenware)
        5. Timber & Boards (Hardwoods: Mahogany/Mvule, Softwoods: Cypress/Pine, MDF & Plywood)
        6. Aluminium, Glass & Windows (Sliding Aluminium Windows, Casement & Louver Windows, Toughened Safety Glass, Tinted/Frosted Glass, Glazing Channels & Sealants)
        7. Ceilings & Gypsum (Gypsum boards, studs, channels, cornice)
        8. Professional Workshop Services (CNC Cutting, Door Lock Drilling, Board Edging)
        9. Cement & Construction Chemicals (Cement: Simba/Ndovu 32.5R/42.5N, Tile Adhesives, Waterproofing)

        RESPONSE STRUCTURE (Always use clear Markdown headers and bullet points):
        1. **Safety First (PPE)**: Specify required personal protective gear (e.g., heavy-duty gloves, dust masks for cement/wood dust, safety goggles).
        2. **Materials & Estimation**: Detail the estimated ratios or quantities required (e.g., for wall plastering: 1 part cement to 3-4 parts fine sand; for screed: 1:3).
        3. **Step-by-Step DIY Procedure**: Provide clear, numbered steps explaining the practical workflow.
        4. **Matching Marketplace Inventory**: Reference relevant products from the INVENTORY CONTEXT provided below.

        CRITICAL INVENTORY RELEVANCE RULES:
        - ONLY recommend products from the provided INVENTORY CONTEXT that directly belong to the user's project.
        - NEVER recommend completely unrelated items (e.g., do NOT suggest a Steel Door or Sliding Window when the user is asking about plastering, cement, or painting).
        - If the INVENTORY CONTEXT is empty or lacks matching products, provide the complete DIY guide, state that the specific material is currently being restocked, and direct the customer to the exact Jenga Marketplace Category (e.g., "Check our 'Cement & Construction Chemicals' category for fresh arrivals").
        - Always quote prices in Kenyan Shillings (KES).
        """;

    public AiAssistantService(ChatLanguageModel chatLanguageModel, RecommendationService recommendationService) {
        this.chatLanguageModel = chatLanguageModel;
        this.recommendationService = recommendationService;
    }

    /**
     * Overloaded method to support controller calls taking a plain string query.
     */
    public AiChatResponse chatWithAssistant(String userMessage) {
        AiChatRequest request = new AiChatRequest();
        request.setMessage(userMessage);
        return processChatPrompt(request);
    }

    public AiChatResponse processChatPrompt(AiChatRequest request) {
        String userMessage = request.getMessage();
        if (userMessage == null || userMessage.isBlank()) {
            return new AiChatResponse("Please enter a construction, DIY, or material inquiry.", Collections.emptyList());
        }

        // 1. Retrieve semantically matching products (filtered by similarity threshold)
        List<Product> relevantProducts = Collections.emptyList();
        try {
            relevantProducts = recommendationService.searchRelevantProducts(userMessage, 3);
        } catch (Exception e) {
            log.warn("Recommendation lookup failed, proceeding without catalog context: {}", e.getMessage());
        }

        // 2. Build structured inventory context for the model prompt
        StringBuilder catalogContext = new StringBuilder();
        if (!relevantProducts.isEmpty()) {
            catalogContext.append("\nAVAILABLE INVENTORY CONTEXT:\n");
            for (Product p : relevantProducts) {
                String catName = p.getCategory() != null ? p.getCategory().getName() : "General Hardware";
                catalogContext.append(String.format("- Product: %s | Category: %s | Price: KES %.2f | Details: %s\n",
                        p.getTitle(),
                        catName,
                        p.getPrice() != null ? p.getPrice() : 0.0,
                        p.getDescription() != null ? p.getDescription() : ""));
            }
        } else {
            catalogContext.append("\nAVAILABLE INVENTORY CONTEXT:\nNo currently in-stock items closely match this specific query above the similarity threshold.\n");
        }

        // 3. Compose the comprehensive prompt
        String fullPrompt = SYSTEM_PROMPT_TEMPLATE
                + catalogContext
                + "\nCUSTOMER INQUIRY:\n" + userMessage;

        // 4. Generate AI response safely
        String aiReply;
        try {
            aiReply = chatLanguageModel.generate(fullPrompt);
        } catch (Exception ex) {
            log.error("AI language model generation error: {}", ex.getMessage(), ex);
            aiReply = "I have reviewed your project request. Please inspect our verified categories on the marketplace or reach out to our Gikomba vendor help desk for personalized sourcing.";
        }

        // 5. Convert relevant products to API DTOs (only valid matches will be attached)
        List<ProductResponse> productDtos = relevantProducts.stream()
                .map(ProductResponse::fromEntity)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return new AiChatResponse(aiReply, productDtos);
    }
}