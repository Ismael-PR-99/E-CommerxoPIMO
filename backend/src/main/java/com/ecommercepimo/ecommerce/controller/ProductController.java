package com.ecommercepimo.ecommerce.controller;

import com.ecommercepimo.ecommerce.dto.*;
import com.ecommercepimo.ecommerce.service.ProductService;
import com.ecommercepimo.ecommerce.service.MLIntegrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {

    private final ProductService productService;
    private final MLIntegrationService mlIntegrationService;

    /**
     * Obtener todos los productos activos
     * GET /api/products
     */
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @PageableDefault(size = 20) Pageable pageable) {

        log.debug("Getting all products with pagination");
        Page<ProductResponse> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Obtener producto por ID
     * GET /api/products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        log.debug("Getting product by ID: {}", id);
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    /**
     * Buscar productos por nombre
     * GET /api/products/search?q={query}
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam("q") String query,
            @PageableDefault(size = 20) Pageable pageable) {

        log.debug("Searching products with query: {}", query);
        Page<ProductResponse> products = productService.searchProductsByName(query, pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Obtener productos por categoría
     * GET /api/products/category/{category}
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
            @PathVariable String category,
            @PageableDefault(size = 20) Pageable pageable) {

        log.debug("Getting products by category: {}", category);
        Page<ProductResponse> products = productService.getProductsByCategory(category, pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Filtrar productos por rango de precios
     * GET /api/products/filter?minPrice={min}&maxPrice={max}
     */
    @GetMapping("/filter")
    public ResponseEntity<Page<ProductResponse>> filterProductsByPrice(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice,
            @PageableDefault(size = 20) Pageable pageable) {

        log.debug("Filtering products by price range: {} - {}", minPrice, maxPrice);
        Page<ProductResponse> products = productService.filterProductsByPrice(minPrice, maxPrice, pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Obtener productos destacados
     * GET /api/products/featured
     */
    @GetMapping("/featured")
    public ResponseEntity<List<ProductResponse>> getFeaturedProducts() {
        log.debug("Getting featured products");
        List<ProductResponse> products = productService.getFeaturedProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Obtener categorías disponibles
     * GET /api/products/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        log.debug("Getting available categories");
        List<String> categories = productService.getAvailableCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Crear nuevo producto (solo admins)
     * POST /api/products
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        log.info("Creating new product: {}", request.getName());
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    /**
     * Actualizar producto (solo admins)
     * PUT /api/products/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {

        log.info("Updating product: {}", id);
        ProductResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(product);
    }

    /**
     * Eliminar producto (solo admins)
     * DELETE /api/products/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("Deleting product: {}", id);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Actualizar stock de producto (solo admins)
     * PATCH /api/products/{id}/stock
     */
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateStock(
            @PathVariable Long id,
            @RequestBody UpdateStockRequest request) {

        log.info("Updating stock for product {}: {}", id, request.getNewStock());
        ProductResponse product = productService.updateStock(id, request.getNewStock());
        return ResponseEntity.ok(product);
    }

    /**
     * Predecir demanda de stock usando ML (solo admins)
     * POST /api/products/{id}/predict-stock
     */
    @PostMapping("/{id}/predict-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MLPredictionResponse> predictStock(
            @PathVariable Long id,
            @RequestParam(defaultValue = "30") Integer days) {

        log.info("Predicting stock for product {}: {} days", id, days);
        MLPredictionResponse prediction = mlIntegrationService.predictStockDemand(id, days);
        return ResponseEntity.ok(prediction);
    }

    // DTO para actualización de stock
    public static class UpdateStockRequest {
        private Integer newStock;

        public Integer getNewStock() { return newStock; }
        public void setNewStock(Integer newStock) { this.newStock = newStock; }
    }
}