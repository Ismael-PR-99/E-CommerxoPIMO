package com.ecommercepimo.ecommerce.client;

import com.ecommercepimo.ecommerce.dto.ml.PredictionRequest;
import com.ecommercepimo.ecommerce.dto.ml.PredictionResponse;
import com.ecommercepimo.ecommerce.dto.ml.RecommendationRequest;
import com.ecommercepimo.ecommerce.dto.ml.RecommendationResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timeout.annotation.TimeLimiter;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

/**
 * Cliente Feign para comunicación con el microservicio ML
 * Incluye patrones de resiliencia: Circuit Breaker, Retry y Timeout
 */
@FeignClient(
    name = "ml-service",
    url = "${app.ml-service.url:http://localhost:8001}",
    configuration = MLServiceClientConfig.class
)
public interface MLServiceClient {

    /**
     * Generar predicciones de stock con patrones de resiliencia
     */
    @PostMapping("/predictions/generate")
    @CircuitBreaker(name = "ml-service", fallbackMethod = "fallbackPredictions")
    @Retry(name = "ml-service")
    @TimeLimiter(name = "ml-service")
    PredictionResponse generatePredictions(@RequestBody PredictionRequest request,
                                         @RequestHeader("X-Correlation-ID") String correlationId);

    /**
     * Obtener recomendaciones para un usuario con patrones de resiliencia
     */
    @PostMapping("/recommendations/user/{userId}")
    @CircuitBreaker(name = "ml-service", fallbackMethod = "fallbackRecommendations")
    @Retry(name = "ml-service")
    @TimeLimiter(name = "ml-service")
    RecommendationResponse getUserRecommendations(@PathVariable("userId") Long userId,
                                                @RequestBody RecommendationRequest request,
                                                @RequestHeader("X-Correlation-ID") String correlationId);

    /**
     * Método fallback para predicciones
     */
    default PredictionResponse fallbackPredictions(PredictionRequest request, String correlationId, Exception ex) {
        return PredictionResponse.builder()
            .success(false)
            .message("Servicio ML temporalmente no disponible. Usando valores por defecto.")
            .correlationId(correlationId)
            .prediction(0.0)
            .confidence(0.0)
            .build();
    }

    /**
     * Método fallback para recomendaciones
     */
    default RecommendationResponse fallbackRecommendations(Long userId, RecommendationRequest request, String correlationId, Exception ex) {
        return RecommendationResponse.builder()
            .success(false)
            .message("Servicio ML temporalmente no disponible. Recomendaciones no disponibles.")
            .correlationId(correlationId)
            .build();
    }

    /**
     * Métodos legacy para compatibilidad hacia atrás
     */
    @PostMapping("/predict-stock")
    @Deprecated
    @CircuitBreaker(name = "ml-service")
    @Retry(name = "ml-service")
    Object predictStock(@RequestBody Object request);

    @PostMapping("/recommend-products")
    @Deprecated
    @CircuitBreaker(name = "ml-service")
    @Retry(name = "ml-service")
    Object getProductRecommendations(@RequestBody Object request);

    @PostMapping("/optimize-price")
    @Deprecated
    @CircuitBreaker(name = "ml-service")
    @Retry(name = "ml-service")
    Object optimizePrice(@RequestBody Object request);
}