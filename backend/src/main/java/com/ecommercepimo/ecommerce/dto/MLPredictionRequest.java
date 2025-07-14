package com.ecommercepimo.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MLPredictionRequest {

    private Long productId;
    private String productName;
    private String category;
    private Integer currentStock;
    private Double averageSales;
    private Integer daysToPredict;
}