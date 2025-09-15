package com.ecommercepimo.ecommerce.dto.ml;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO para intervalo de confianza
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class ConfidenceInterval {
    private Double lowerBound;
    private Double upperBound;
    private Double confidenceLevel;
}

/**
 * DTO para respuesta de predicción de stock
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PredictionResponse extends BaseMLResponse {
    
    private Long productId;
    
    private List<Double> predictions;
    
    private List<String> dates;
    
    private List<ConfidenceInterval> confidenceIntervals;
    
    private Double modelAccuracy;
    
    private Map<String, Object> trendAnalysis;
    
    private List<String> riskFactors;
    
    // Campos adicionales para compatibilidad
    private Double predictedDemand;
    private Integer recommendedStock;
    private Double confidence;
    private String riskLevel;
    private String recommendations;
}