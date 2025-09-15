package com.ecommercepimo.ecommerce.dto.ml;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para request de predicción de stock
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionRequest {
    
    @NotNull(message = "El ID del producto es obligatorio")
    @Min(value = 1, message = "El ID del producto debe ser positivo")
    private Long productId;
    
    @Min(value = 1, message = "Los días a predecir deben ser al menos 1")
    @Max(value = 365, message = "Los días a predecir no pueden exceder 365")
    @Builder.Default
    private Integer daysAhead = 30;
    
    @Builder.Default
    private Boolean includeConfidenceIntervals = true;
    
    // Campos adicionales para contexto
    private String productName;
    private String category;
    private Integer currentStock;
    private Double averageSales;
}