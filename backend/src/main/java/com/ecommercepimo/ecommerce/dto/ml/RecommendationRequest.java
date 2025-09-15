package com.ecommercepimo.ecommerce.dto.ml;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para request de recomendaciones de usuario
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationRequest {
    
    @NotNull(message = "El ID del usuario es obligatorio")
    @Min(value = 1, message = "El ID del usuario debe ser positivo")
    private Long userId;
    
    @Min(value = 1, message = "Debe solicitar al menos 1 recomendación")
    @Max(value = 50, message = "No se pueden solicitar más de 50 recomendaciones")
    @Builder.Default
    private Integer numRecommendations = 10;
    
    @Builder.Default
    private String algorithm = "hybrid";
    
    @Builder.Default
    private Boolean includeExplanation = true;
    
    // Campos adicionales para contexto
    private String userProfile;
    private Double similarityThreshold;
}