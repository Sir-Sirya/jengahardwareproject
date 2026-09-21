package com.hardware.jenga.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record AiChatResponse(
    @JsonProperty("message") String message,
    @JsonProperty("recommendedProducts") List<ProductResponse> recommendedProducts
) {}