package com.ecommercepimo.ecommerce.integration;

import com.ecommercepimo.ecommerce.dto.*;
import com.ecommercepimo.ecommerce.entity.Product;
import com.ecommercepimo.ecommerce.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests de integración para el sistema E-commerce
 * Usando Testcontainers para PostgreSQL y Redis
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@Transactional
@DisplayName("Product Integration Tests")
class ProductIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true);

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379)
            .withReuse(true);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", redis::getFirstMappedPort);
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String baseUrl;
    private HttpHeaders headers;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/products";
        headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Limpiar base de datos
        productRepository.deleteAll();
    }

    @Test
    @DisplayName("Crear producto - integración completa")
    void createProduct_IntegrationTest() throws Exception {
        // Given
        ProductCreateRequest request = ProductCreateRequest.builder()
                .name("Laptop Gaming")
                .description("Laptop para gaming de alta gama")
                .price(BigDecimal.valueOf(1299.99))
                .stock(50)
                .category("Electronics")
                .build();

        HttpEntity<ProductCreateRequest> entity = new HttpEntity<>(request, headers);

        // When
        ResponseEntity<ProductResponse> response = restTemplate.postForEntity(
                baseUrl, entity, ProductResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("Laptop Gaming");
        assertThat(response.getBody().getPrice()).isEqualTo(BigDecimal.valueOf(1299.99));
        assertThat(response.getBody().isActive()).isTrue();

        // Verificar en base de datos
        List<Product> productsInDb = productRepository.findAll();
        assertThat(productsInDb).hasSize(1);
        assertThat(productsInDb.get(0).getName()).isEqualTo("Laptop Gaming");
    }

    @Test
    @DisplayName("Obtener producto por ID - integración completa")
    void getProductById_IntegrationTest() {
        // Given - crear producto en DB
        Product product = Product.builder()
                .name("Smartphone")
                .description("Smartphone último modelo")
                .price(BigDecimal.valueOf(699.99))
                .stock(25)
                .category("Electronics")
                .active(true)
                .build();
        Product savedProduct = productRepository.save(product);

        // When
        ResponseEntity<ProductResponse> response = restTemplate.getForEntity(
                baseUrl + "/" + savedProduct.getId(), ProductResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isEqualTo(savedProduct.getId());
        assertThat(response.getBody().getName()).isEqualTo("Smartphone");
        assertThat(response.getBody().getPrice()).isEqualTo(BigDecimal.valueOf(699.99));
    }

    @Test
    @DisplayName("Obtener producto inexistente - 404")
    void getProductById_NotFound() {
        // When
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/999", String.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("Actualizar producto - integración completa")
    void updateProduct_IntegrationTest() {
        // Given - crear producto en DB
        Product product = Product.builder()
                .name("Tablet")
                .description("Tablet original")
                .price(BigDecimal.valueOf(399.99))
                .stock(30)
                .category("Electronics")
                .active(true)
                .build();
        Product savedProduct = productRepository.save(product);

        ProductUpdateRequest updateRequest = ProductUpdateRequest.builder()
                .name("Tablet Pro")
                .description("Tablet profesional actualizada")
                .price(BigDecimal.valueOf(499.99))
                .stock(40)
                .category("Electronics")
                .build();

        HttpEntity<ProductUpdateRequest> entity = new HttpEntity<>(updateRequest, headers);

        // When
        ResponseEntity<ProductResponse> response = restTemplate.exchange(
                baseUrl + "/" + savedProduct.getId(),
                HttpMethod.PUT,
                entity,
                ProductResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("Tablet Pro");
        assertThat(response.getBody().getPrice()).isEqualTo(BigDecimal.valueOf(499.99));
        assertThat(response.getBody().getStock()).isEqualTo(40);

        // Verificar en base de datos
        Product updatedInDb = productRepository.findById(savedProduct.getId()).orElse(null);
        assertThat(updatedInDb).isNotNull();
        assertThat(updatedInDb.getName()).isEqualTo("Tablet Pro");
        assertThat(updatedInDb.getPrice()).isEqualTo(BigDecimal.valueOf(499.99));
    }

    @Test
    @DisplayName("Eliminar producto (soft delete) - integración completa")
    void deleteProduct_IntegrationTest() {
        // Given - crear producto en DB
        Product product = Product.builder()
                .name("Smartwatch")
                .description("Reloj inteligente")
                .price(BigDecimal.valueOf(299.99))
                .stock(15)
                .category("Electronics")
                .active(true)
                .build();
        Product savedProduct = productRepository.save(product);

        // When
        ResponseEntity<Void> response = restTemplate.exchange(
                baseUrl + "/" + savedProduct.getId(),
                HttpMethod.DELETE,
                null,
                Void.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        // Verificar soft delete en base de datos
        Product deletedProduct = productRepository.findById(savedProduct.getId()).orElse(null);
        assertThat(deletedProduct).isNotNull();
        assertThat(deletedProduct.isActive()).isFalse();
    }

    @Test
    @DisplayName("Obtener productos con paginación - integración completa")
    void getAllProducts_WithPagination_IntegrationTest() {
        // Given - crear múltiples productos
        for (int i = 1; i <= 15; i++) {
            Product product = Product.builder()
                    .name("Product " + i)
                    .description("Description " + i)
                    .price(BigDecimal.valueOf(10.0 * i))
                    .stock(i * 5)
                    .category("Category" + (i % 3))
                    .active(true)
                    .build();
            productRepository.save(product);
        }

        // When - solicitar página 0 con tamaño 10
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "?page=0&size=10", String.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("\"totalElements\":15");
        assertThat(response.getBody()).contains("\"totalPages\":2");
        assertThat(response.getBody()).contains("\"size\":10");
    }

    @Test
    @DisplayName("Buscar productos por categoría - integración completa")
    void getProductsByCategory_IntegrationTest() {
        // Given - crear productos de diferentes categorías
        Product electronicsProduct = Product.builder()
                .name("iPhone")
                .description("Smartphone Apple")
                .price(BigDecimal.valueOf(999.99))
                .stock(20)
                .category("Electronics")
                .active(true)
                .build();

        Product clothingProduct = Product.builder()
                .name("Camiseta")
                .description("Camiseta de algodón")
                .price(BigDecimal.valueOf(29.99))
                .stock(50)
                .category("Clothing")
                .active(true)
                .build();

        productRepository.save(electronicsProduct);
        productRepository.save(clothingProduct);

        // When
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/category/Electronics?page=0&size=10", String.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("iPhone");
        assertThat(response.getBody()).doesNotContain("Camiseta");
        assertThat(response.getBody()).contains("\"totalElements\":1");
    }

    @Test
    @DisplayName("Buscar productos por término - integración completa")
    void searchProducts_IntegrationTest() {
        // Given - crear productos con nombres diferentes
        Product product1 = Product.builder()
                .name("Gaming Laptop")
                .description("Laptop para gaming")
                .price(BigDecimal.valueOf(1500.00))
                .stock(10)
                .category("Electronics")
                .active(true)
                .build();

        Product product2 = Product.builder()
                .name("Office Laptop")
                .description("Laptop para oficina")
                .price(BigDecimal.valueOf(800.00))
                .stock(20)
                .category("Electronics")
                .active(true)
                .build();

        Product product3 = Product.builder()
                .name("Gaming Mouse")
                .description("Mouse para gaming")
                .price(BigDecimal.valueOf(50.00))
                .stock(100)
                .category("Electronics")
                .active(true)
                .build();

        productRepository.save(product1);
        productRepository.save(product2);
        productRepository.save(product3);

        // When - buscar por "Laptop"
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/search?query=Laptop&page=0&size=10", String.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("Gaming Laptop");
        assertThat(response.getBody()).contains("Office Laptop");
        assertThat(response.getBody()).doesNotContain("Gaming Mouse");
        assertThat(response.getBody()).contains("\"totalElements\":2");
    }

    @Test
    @DisplayName("Actualizar stock - integración completa")
    void updateProductStock_IntegrationTest() {
        // Given - crear producto en DB
        Product product = Product.builder()
                .name("Headphones")
                .description("Auriculares inalámbricos")
                .price(BigDecimal.valueOf(149.99))
                .stock(75)
                .category("Electronics")
                .active(true)
                .build();
        Product savedProduct = productRepository.save(product);

        StockUpdateRequest stockRequest = new StockUpdateRequest(100);
        HttpEntity<StockUpdateRequest> entity = new HttpEntity<>(stockRequest, headers);

        // When
        ResponseEntity<ProductResponse> response = restTemplate.exchange(
                baseUrl + "/" + savedProduct.getId() + "/stock",
                HttpMethod.PATCH,
                entity,
                ProductResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStock()).isEqualTo(100);

        // Verificar en base de datos
        Product updatedProduct = productRepository.findById(savedProduct.getId()).orElse(null);
        assertThat(updatedProduct).isNotNull();
        assertThat(updatedProduct.getStock()).isEqualTo(100);
    }

    @Test
    @DisplayName("Validaciones de campos requeridos")
    void createProduct_ValidationErrors() {
        // Given - request con campos faltantes
        ProductCreateRequest invalidRequest = ProductCreateRequest.builder()
                .name("") // nombre vacío
                .price(BigDecimal.valueOf(-10)) // precio negativo
                .stock(-5) // stock negativo
                .build();

        HttpEntity<ProductCreateRequest> entity = new HttpEntity<>(invalidRequest, headers);

        // When
        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl, entity, String.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    /**
     * DTO para actualización de stock
     */
    public static class StockUpdateRequest {
        private Integer stock;

        public StockUpdateRequest() {}

        public StockUpdateRequest(Integer stock) {
            this.stock = stock;
        }

        public Integer getStock() { return stock; }
        public void setStock(Integer stock) { this.stock = stock; }
    }
}