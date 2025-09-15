package com.ecommercepimo.ecommerce.service;

import com.ecommercepimo.ecommerce.client.MLServiceClient;
import com.ecommercepimo.ecommerce.client.MLServiceException;
import com.ecommercepimo.ecommerce.dto.ml.*;
import com.ecommercepimo.ecommerce.entity.Product;
import com.ecommercepimo.ecommerce.entity.User;
import com.ecommercepimo.ecommerce.repository.OrderItemRepository;
import com.ecommercepimo.ecommerce.repository.ProductRepository;
import com.ecommercepimo.ecommerce.repository.UserRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

/**
 * Servicio de integración con ML Service
 * Orquesta las llamadas al microservicio de Machine Learning
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MLIntegrationService {

    private final MLServiceClient mlServiceClient;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    /**
     * Generar predicciones de stock para un producto
     */
    @CircuitBreaker(name = "ml-service", fallbackMethod = "generatePredictionsFallback")
    @Retry(name = "ml-service")
    public PredictionResponse generateStockPredictions(Long productId, Integer daysAhead) {
        String correlationId = generateCorrelationId();
        
        log.info("Generating stock predictions - ProductId: {}, DaysAhead: {}, CorrelationId: {}", 
                productId, daysAhead, correlationId);

        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + productId));

            // Calcular ventas promedio de los últimos 30 días
            Long totalSold = orderItemRepository.getTotalSoldQuantityByProduct(productId);
            double averageSales = totalSold != null ? totalSold.doubleValue() / 30.0 : 0.0;

            PredictionRequest request = PredictionRequest.builder()
                    .productId(productId)
                    .daysAhead(daysAhead != null ? daysAhead : 30)
                    .includeConfidenceIntervals(true)
                    .productName(product.getName())
                    .category(product.getCategory())
                    .currentStock(product.getStock())
                    .averageSales(averageSales)
                    .build();

            PredictionResponse response = mlServiceClient.generatePredictions(request, correlationId);
            
            log.info("Stock predictions generated successfully - ProductId: {}, CorrelationId: {}", 
                    productId, correlationId);
            
            return response;

        } catch (MLServiceException e) {
            log.error("ML Service error during prediction - ProductId: {}, CorrelationId: {}, Error: {}", 
                    productId, correlationId, e.getErrorResponse().getErrorCode());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during prediction - ProductId: {}, CorrelationId: {}", 
                    productId, correlationId, e);
            throw new RuntimeException("Error generando predicciones: " + e.getMessage(), e);
        }
    }

    /**
     * Obtener recomendaciones para un usuario
     */
    @CircuitBreaker(name = "ml-service", fallbackMethod = "getUserRecommendationsFallback")
    @Retry(name = "ml-service")
    public RecommendationResponse getUserRecommendations(Long userId, Integer numRecommendations, String algorithm) {
        String correlationId = generateCorrelationId();
        
        log.info("Getting user recommendations - UserId: {}, NumRecommendations: {}, Algorithm: {}, CorrelationId: {}", 
                userId, numRecommendations, algorithm, correlationId);

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + userId));

            RecommendationRequest request = RecommendationRequest.builder()
                    .userId(userId)
                    .numRecommendations(numRecommendations != null ? numRecommendations : 10)
                    .algorithm(algorithm != null ? algorithm : "hybrid")
                    .includeExplanation(true)
                    .userProfile(user.getRole().name())
                    .build();

            RecommendationResponse response = mlServiceClient.getUserRecommendations(userId, request, correlationId);
            
            log.info("User recommendations generated successfully - UserId: {}, Count: {}, CorrelationId: {}", 
                    userId, response.getRecommendations() != null ? response.getRecommendations().size() : 0, correlationId);
            
            return response;

        } catch (MLServiceException e) {
            log.error("ML Service error during recommendation - UserId: {}, CorrelationId: {}, Error: {}", 
                    userId, correlationId, e.getErrorResponse().getErrorCode());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during recommendation - UserId: {}, CorrelationId: {}", 
                    userId, correlationId, e);
            throw new RuntimeException("Error obteniendo recomendaciones: " + e.getMessage(), e);
        }
    }

    /**
     * Fallback para predicciones de stock
     */
    public PredictionResponse generatePredictionsFallback(Long productId, Integer daysAhead, Exception ex) {
        String correlationId = generateCorrelationId();
        
        log.warn("ML Service fallback activated for stock prediction - ProductId: {}, CorrelationId: {}, Error: {}", 
                productId, correlationId, ex.getMessage());

        Product product = productRepository.findById(productId).orElse(null);
        
        if (product == null) {
            throw new IllegalArgumentException("Producto no encontrado: " + productId);
        }

        return PredictionResponse.builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Predicción basada en fallback")
                .productId(productId)
                .predictedDemand((double) product.getStock() / 2)
                .recommendedStock(product.getStock())
                .confidence(0.3)
                .riskLevel("UNKNOWN")
                .recommendations("Servicio ML no disponible. Mantener stock actual.")
                .predictions(Collections.singletonList((double) product.getStock() / 2))
                .dates(Collections.singletonList(LocalDateTime.now().plusDays(daysAhead != null ? daysAhead : 30).toString()))
                .modelAccuracy(0.3)
                .riskFactors(Collections.singletonList("Predicción de fallback"))
                .build();
    }

    /**
     * Fallback para recomendaciones de usuario
     */
    public RecommendationResponse getUserRecommendationsFallback(Long userId, Integer numRecommendations, String algorithm, Exception ex) {
        String correlationId = generateCorrelationId();
        
        log.warn("ML Service fallback activated for user recommendations - UserId: {}, CorrelationId: {}, Error: {}", 
                userId, correlationId, ex.getMessage());

        return RecommendationResponse.builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .message("Recomendaciones basadas en fallback")
                .userId(userId)
                .recommendations(Collections.emptyList())
                .algorithmUsed("fallback")
                .diversificationScore(0.0)
                .explanation("Servicio ML no disponible. No se pueden generar recomendaciones.")
                .totalRecommendations(0)
                .correlationId(correlationId)
                .build();
    }

    /**
     * Analizar todos los productos con stock bajo (método legacy)
     */
    public void analyzeAllLowStockProducts() {
        log.info("Analyzing all low stock products");

        productRepository.findLowStockProducts().forEach(product -> {
            try {
                PredictionResponse prediction = generateStockPredictions(product.getId(), 30);
                log.info("Stock prediction for {}: recommended={}, confidence={}", 
                        product.getName(), prediction.getRecommendedStock(), prediction.getConfidence());
            } catch (Exception e) {
                log.error("Error predicting stock for product {}: {}", product.getId(), e.getMessage());
            }
        });
    }

    /**
     * Generar ID de correlación único
     */
    private String generateCorrelationId() {
        return UUID.randomUUID().toString();
    }
}