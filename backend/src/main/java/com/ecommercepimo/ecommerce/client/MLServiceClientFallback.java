package com.ecommercepimo.ecommerce.client;

import com.ecommercepimo.ecommerce.dto.MLPredictionRequest;
import com.ecommercepimo.ecommerce.dto.MLPredictionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class MLServiceClientFallback implements MLServiceClient {

    @Override
    public MLPredictionResponse predictStock(MLPredictionRequest request) {
        log.warn("ML Service unavailable, using fallback for stock prediction");

        return MLPredictionResponse.builder()
                .productId(request.getProductId())
                .predictedDemand(request.getCurrentStock() / 2) // Estimación simple
                .recommendedStock(request.getCurrentStock())
                .confidence(0.5)
                .riskLevel("UNKNOWN")
                .recommendations("ML Service no disponible. Mantener stock actual.")
                .build();
    }

    @Override
    public Object getProductRecommendations(Object request) {
        log.warn("ML Service unavailable, using fallback for product recommendations");
        return "Recomendaciones no disponibles temporalmente";
    }

    @Override
    public Object optimizePrice(Object request) {
        log.warn("ML Service unavailable, using fallback for price optimization");
        return "Optimización de precios no disponible temporalmente";
    }
}