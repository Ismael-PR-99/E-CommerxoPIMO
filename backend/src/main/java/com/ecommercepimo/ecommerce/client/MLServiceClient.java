package com.ecommercepimo.ecommerce.client;

import com.ecommercepimo.ecommerce.dto.MLPredictionRequest;
import com.ecommercepimo.ecommerce.dto.MLPredictionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
    name = "ml-service",
    url = "${app.ml-service.url:http://localhost:8001}",
    fallback = MLServiceClientFallback.class
)
public interface MLServiceClient {

    @PostMapping("/predict-stock")
    MLPredictionResponse predictStock(@RequestBody MLPredictionRequest request);

    @PostMapping("/recommend-products")
    Object getProductRecommendations(@RequestBody Object request);

    @PostMapping("/optimize-price")
    Object optimizePrice(@RequestBody Object request);
}