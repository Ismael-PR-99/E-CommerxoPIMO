package com.ecommercepimo.ecommerce.controller;

import com.ecommercepimo.ecommerce.dto.ml.PredictionResponse;
import com.ecommercepimo.ecommerce.dto.ml.RecommendationResponse;
import com.ecommercepimo.ecommerce.service.MLIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador para funcionalidades de Machine Learning
 */
@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class MLController {

    private final MLIntegrationService mlIntegrationService;

    /**
     * Generar predicciones de stock para un producto
     * POST /api/ml/predictions/generate
     */
    @PostMapping("/predictions/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> generatePredictions(
            @RequestParam Long productId,
            @RequestParam(defaultValue = "30") Integer daysAhead) {

        log.info("Generating ML predictions for product: {}, days: {}", productId, daysAhead);
        
        try {
            PredictionResponse prediction = mlIntegrationService.generateStockPredictions(productId, daysAhead);
            return ResponseEntity.ok(prediction);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for ML prediction: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "success", false,
                        "error", "INVALID_REQUEST",
                        "message", e.getMessage()
                    ));
        } catch (Exception e) {
            log.error("Error generating ML prediction for product {}", productId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                        "success", false,
                        "error", "INTERNAL_SERVER_ERROR",
                        "message", "Error generando predicciones ML"
                    ));
        }
    }

    /**
     * Obtener recomendaciones para el usuario actual
     * POST /api/ml/recommendations/user/{userId}
     */
    @PostMapping("/recommendations/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") Integer numRecommendations,
            @RequestParam(defaultValue = "hybrid") String algorithm,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Getting ML recommendations for user: {}, count: {}, algorithm: {}", 
                userId, numRecommendations, algorithm);
        
        try {
            // Verificar que el usuario puede acceder a sus propias recomendaciones
            // o es admin
            if (!userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
                // TODO: Implementar verificación de que userId coincide con el usuario actual
                log.debug("User accessing own recommendations: {}", userId);
            }

            RecommendationResponse recommendations = mlIntegrationService.getUserRecommendations(
                    userId, numRecommendations, algorithm);
            
            return ResponseEntity.ok(recommendations);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for ML recommendations: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "success", false,
                        "error", "INVALID_REQUEST", 
                        "message", e.getMessage()
                    ));
        } catch (Exception e) {
            log.error("Error getting ML recommendations for user {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                        "success", false,
                        "error", "INTERNAL_SERVER_ERROR",
                        "message", "Error obteniendo recomendaciones ML"
                    ));
        }
    }

    /**
     * Obtener recomendaciones basadas en un producto específico
     * GET /api/ml/recommendations/product/{productId}/similar
     */
    @GetMapping("/recommendations/product/{productId}/similar")
    public ResponseEntity<?> getSimilarProductRecommendations(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "5") Integer numSimilar) {

        log.info("Getting similar product recommendations for product: {}, count: {}", 
                productId, numSimilar);
        
        try {
            // Para productos similares, usamos las recomendaciones con un algoritmo específico
            // TODO: Implementar endpoint específico para productos similares en MLIntegrationService
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Endpoint de productos similares - Por implementar",
                "productId", productId,
                "numSimilar", numSimilar
            ));
            
        } catch (Exception e) {
            log.error("Error getting similar products for product {}", productId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                        "success", false,
                        "error", "INTERNAL_SERVER_ERROR",
                        "message", "Error obteniendo productos similares"
                    ));
        }
    }

    /**
     * Endpoint de salud para verificar conectividad con ML Service
     * GET /api/ml/health
     */
    @GetMapping("/health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        log.info("ML Service health check requested");
        
        try {
            // Intentar una operación simple para verificar conectividad
            // TODO: Implementar ping específico al ML Service
            return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "ML Integration",
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            log.error("ML Service health check failed", e);
            return ResponseEntity.status(503)
                    .body(Map.of(
                        "status", "DOWN",
                        "service", "ML Integration",
                        "error", e.getMessage(),
                        "timestamp", System.currentTimeMillis()
                    ));
        }
    }
}