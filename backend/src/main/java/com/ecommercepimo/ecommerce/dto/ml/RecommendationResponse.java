package com.ecommercepimo.ecommerce.dto.ml;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para respuesta de recomendaciones
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RecommendationResponse extends BaseMLResponse {
    
    private Long userId;
    
    private Long productId;
    
    private List<ProductRecommendation> recommendations;
    
    private String algorithmUsed;
    
    private Double diversificationScore;
    
    private String explanation;
    
    // Metadatos adicionales
    private Integer totalRecommendations;
    private String correlationId;
}