package com.ecommercepimo.ecommerce.integration;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.*;

/**
 * Tests de integración para ML Service usando WireMock
 * Simula el comportamiento del microservicio de ML
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@TestPropertySource(properties = {
    "ml.service.enabled=true"
})
@DisplayName("ML Service Integration Tests with WireMock")
class MLServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true);

    private WireMockServer wireMockServer;

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @BeforeEach
    void setUp() {
        // Inicializar WireMock en puerto dinámico
        wireMockServer = new WireMockServer(0);
        wireMockServer.start();
        
        // Configurar la URL del ML service para apuntar a WireMock
        System.setProperty("ml.service.url", "http://localhost:" + wireMockServer.port());
        
        // Configurar WireMock
        WireMock.configureFor(wireMockServer.port());
    }

    @AfterEach
    void tearDown() {
        if (wireMockServer != null && wireMockServer.isRunning()) {
            wireMockServer.stop();
        }
        System.clearProperty("ml.service.url");
    }

    @Test
    @DisplayName("ML Service - Health Check exitoso")
    void mlService_HealthCheck_Success() {
        // Given - configurar mock para health check
        stubFor(get(urlEqualTo("/health"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                            {
                                "status": "healthy",
                                "service": "ml-service",
                                "timestamp": "2024-01-15T10:30:00Z"
                            }
                            """)));

        // When - llamar al endpoint que internamente consulta ML service
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/ml/health", String.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        
        // Verificar que se llamó al mock
        verify(getRequestedFor(urlEqualTo("/health")));
    }

    @Test
    @DisplayName("ML Service - Predicción de stock exitosa")
    void mlService_StockPrediction_Success() {
        // Given - configurar mock para predicción
        stubFor(post(urlEqualTo("/api/predictions/stock"))
                .withHeader("Content-Type", equalTo("application/json"))
                .withRequestBody(containing("productId"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                            {
                                "productId": 1,
                                "predictedDemand": 150,
                                "recommendedStock": 200,
                                "confidence": 0.85,
                                "predictionDate": "2024-01-15T10:30:00Z"
                            }
                            """)));

        // When - llamar al endpoint que solicita predicción
        String requestBody = """
            {
                "productId": 1,
                "historicalData": {
                    "salesHistory": [100, 120, 140],
                    "timeframe": "30days"
                }
            }
            """;

        ResponseEntity<String> response = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/ml/predict-stock",
                requestBody,
                String.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("\"predictedDemand\":150");
        assertThat(response.getBody()).contains("\"recommendedStock\":200");
        
        // Verificar llamada al mock
        verify(postRequestedFor(urlEqualTo("/api/predictions/stock"))
                .withHeader("Content-Type", equalTo("application/json"))
                .withRequestBody(containing("productId")));
    }

    @Test
    @DisplayName("ML Service - Recomendaciones de productos")
    void mlService_ProductRecommendations_Success() {
        // Given - configurar mock para recomendaciones
        stubFor(post(urlEqualTo("/api/recommendations/products"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                            {
                                "userId": 123,
                                "recommendations": [
                                    {
                                        "productId": 1,
                                        "score": 0.92,
                                        "reason": "Frequently bought together"
                                    },
                                    {
                                        "productId": 5,
                                        "score": 0.88,
                                        "reason": "Similar preferences"
                                    }
                                ],
                                "algorithmUsed": "collaborative_filtering"
                            }
                            """)));

        // When - solicitar recomendaciones
        String requestBody = """
            {
                "userId": 123,
                "productHistory": [2, 3, 4],
                "maxRecommendations": 5
            }
            """;

        ResponseEntity<String> response = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/ml/recommendations",
                requestBody,
                String.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("\"userId\":123");
        assertThat(response.getBody()).contains("\"algorithmUsed\":\"collaborative_filtering\"");
        
        verify(postRequestedFor(urlEqualTo("/api/recommendations/products")));
    }

    @Test
    @DisplayName("ML Service - Manejo de errores y circuit breaker")
    void mlService_ErrorHandling_CircuitBreaker() {
        // Given - configurar mock para devolver error 500
        stubFor(post(urlEqualTo("/api/predictions/stock"))
                .willReturn(aResponse()
                        .withStatus(500)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                            {
                                "error": "Internal server error",
                                "message": "ML model unavailable"
                            }
                            """)));

        // When - llamar al endpoint que debería activar circuit breaker
        String requestBody = """
            {
                "productId": 1,
                "historicalData": {
                    "salesHistory": [100, 120, 140],
                    "timeframe": "30days"
                }
            }
            """;

        ResponseEntity<String> response = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/ml/predict-stock",
                requestBody,
                String.class);

        // Then - debería devolver respuesta de fallback
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("fallback");
        
        verify(postRequestedFor(urlEqualTo("/api/predictions/stock")));
    }

    @Test
    @DisplayName("ML Service - Timeout y retry")
    void mlService_TimeoutAndRetry() {
        // Given - configurar mock con delay para simular timeout
        stubFor(post(urlEqualTo("/api/predictions/stock"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withFixedDelay(5000) // 5 segundos de delay
                        .withBody("""
                            {
                                "productId": 1,
                                "predictedDemand": 100,
                                "recommendedStock": 150
                            }
                            """)));

        // When - llamar al endpoint (debería hacer timeout y retry)
        String requestBody = """
            {
                "productId": 1,
                "historicalData": {
                    "salesHistory": [100, 120, 140],
                    "timeframe": "30days"
                }
            }
            """;

        long startTime = System.currentTimeMillis();
        ResponseEntity<String> response = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/ml/predict-stock",
                requestBody,
                String.class);
        long endTime = System.currentTimeMillis();

        // Then - debería devolver respuesta de fallback rápidamente
        assertThat(endTime - startTime).isLessThan(5000); // Menos de 5 segundos
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("ML Service - Validación de datos de entrada")
    void mlService_InputValidation() {
        // Given - configurar mock para validar datos
        stubFor(post(urlEqualTo("/api/predictions/stock"))
                .withRequestBody(containing("\"productId\":null"))
                .willReturn(aResponse()
                        .withStatus(400)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                            {
                                "error": "Validation error",
                                "message": "productId is required"
                            }
                            """)));

        // When - enviar datos inválidos
        String invalidRequestBody = """
            {
                "productId": null,
                "historicalData": {
                    "salesHistory": [100, 120, 140],
                    "timeframe": "30days"
                }
            }
            """;

        ResponseEntity<String> response = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/ml/predict-stock",
                invalidRequestBody,
                String.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        
        verify(postRequestedFor(urlEqualTo("/api/predictions/stock"))
                .withRequestBody(containing("\"productId\":null")));
    }

    @Test
    @DisplayName("ML Service - Análisis de tendencias")
    void mlService_TrendAnalysis_Success() {
        // Given - configurar mock para análisis de tendencias
        stubFor(get(urlMatching("/api/analytics/trends\\?category=.*"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("""
                            {
                                "category": "Electronics",
                                "trends": [
                                    {
                                        "period": "2024-01",
                                        "growth": 15.5,
                                        "topProducts": [1, 2, 3]
                                    }
                                ],
                                "forecast": {
                                    "nextMonth": {
                                        "expectedGrowth": 12.3,
                                        "confidence": 0.78
                                    }
                                }
                            }
                            """)));

        // When - solicitar análisis de tendencias
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/ml/trends?category=Electronics",
                String.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("\"category\":\"Electronics\"");
        assertThat(response.getBody()).contains("\"expectedGrowth\":12.3");
        
        verify(getRequestedFor(urlMatching("/api/analytics/trends\\?category=.*")));
    }
}