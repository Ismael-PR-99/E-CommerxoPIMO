package com.ecommercepimo.ecommerce.service;

import com.ecommercepimo.ecommerce.client.MLServiceClient;
import com.ecommercepimo.ecommerce.dto.MLPredictionRequest;
import com.ecommercepimo.ecommerce.dto.MLPredictionResponse;
import com.ecommercepimo.ecommerce.entity.Product;
import com.ecommercepimo.ecommerce.repository.OrderItemRepository;
import com.ecommercepimo.ecommerce.repository.ProductRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class MLIntegrationService {

    private final MLServiceClient mlServiceClient;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    /**
     * Predecir demanda de stock para un producto
     */
    @CircuitBreaker(name = "ml-service", fallbackMethod = "predictStockFallback")
    @Retry(name = "ml-service")
    public MLPredictionResponse predictStockDemand(Long productId, Integer daysToPredict) {
        log.info("Requesting stock prediction for product: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Calcular ventas promedio (últimos 30 días)
        Long totalSold = orderItemRepository.getTotalSoldQuantityByProduct(productId);
        double averageSales = totalSold != null ? totalSold.doubleValue() / 30.0 : 0.0;

        MLPredictionRequest request = MLPredictionRequest.builder()
                .productId(productId)
                .productName(product.getName())
                .category(product.getCategory())
                .currentStock(product.getStock())
                .averageSales(averageSales)
                .daysToPredict(daysToPredict != null ? daysToPredict : 30)
                .build();

        return mlServiceClient.predictStock(request);
    }

    /**
     * Fallback method para predicción de stock
     */
    public MLPredictionResponse predictStockFallback(Long productId, Integer daysToPredict, Exception ex) {
        log.error("ML Service fallback activated for product {}: {}", productId, ex.getMessage());

        Product product = productRepository.findById(productId)
                .orElse(null);

        if (product == null) {
            throw new RuntimeException("Producto no encontrado");
        }

        return MLPredictionResponse.builder()
                .productId(productId)
                .predictedDemand(product.getStock() / 2)
                .recommendedStock(product.getStock())
                .confidence(0.3)
                .riskLevel("UNKNOWN")
                .recommendations("Predicción no disponible. Mantener stock actual.")
                .build();
    }

    /**
     * Obtener recomendaciones para todos los productos con stock bajo
     */
    public void analyzeAllLowStockProducts() {
        log.info("Analyzing all low stock products");

        productRepository.findLowStockProducts().forEach(product -> {
            try {
                MLPredictionResponse prediction = predictStockDemand(product.getId(), 30);
                log.info("Stock prediction for {}: recommended={}, confidence={}", 
                        product.getName(), prediction.getRecommendedStock(), prediction.getConfidence());
            } catch (Exception e) {
                log.error("Error predicting stock for product {}: {}", product.getId(), e.getMessage());
            }
        });
    }
}