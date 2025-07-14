package com.ecommercepimo.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MLPredictionResponse {

    private Long productId;
    private Integer predictedDemand;
    private Integer recommendedStock;
    private Double confidence;
    private String riskLevel;
    private String recommendations;
}