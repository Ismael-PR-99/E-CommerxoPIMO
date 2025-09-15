package com.ecommercepimo.ecommerce.controller;

import com.ecommercepimo.ecommerce.dto.*;
import com.ecommercepimo.ecommerce.service.ProductService;
import com.ecommercepimo.ecommerce.service.MLIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de productos
 * Proporciona endpoints CRUD completos con validación y paginación
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
@Validated
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Products", description = "API para gestión de productos del e-commerce")
public class ProductController {

    private final ProductService productService;
    private final MLIntegrationService mlIntegrationService;

    @Operation(
        summary = "Listar productos con paginación",
        description = "Obtiene una lista paginada de todos los productos activos del catálogo",
        tags = {"Products"}
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Lista de productos obtenida exitosamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Page.class),
                examples = @ExampleObject(
                    name = "productos_paginados",
                    value = """
                    {
                        "content": [
                            {
                                "id": 1,
                                "name": "Laptop Gaming ROG",
                                "description": "Laptop para gaming de alta gama",
                                "price": 1299.99,
                                "stock": 15,
                                "category": "Electrónicos",
                                "imageUrl": "/images/laptop-rog.jpg",
                                "active": true,
                                "createdAt": "2024-01-15T10:30:00Z"
                            }
                        ],
                        "pageable": {
                            "page": 0,
                            "size": 20,
                            "sort": "name,asc"
                        },
                        "totalElements": 150,
                        "totalPages": 8,
                        "first": true,
                        "last": false
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Error interno del servidor",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @Parameter(
                description = "Parámetros de paginación",
                example = "page=0&size=20&sort=name,asc"
            )
            @PageableDefault(size = 20) Pageable pageable) {

        log.debug("Getting all products with pagination");
        Page<ProductResponse> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @Operation(
        summary = "Obtener producto por ID",
        description = "Busca y retorna un producto específico usando su identificador único",
        tags = {"Products"}
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Producto encontrado exitosamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ProductResponse.class),
                examples = @ExampleObject(
                    name = "producto_detalle",
                    value = """
                    {
                        "id": 1,
                        "name": "Laptop Gaming ROG",
                        "description": "Laptop para gaming de alta gama con RTX 4070",
                        "price": 1299.99,
                        "stock": 15,
                        "category": "Electrónicos",
                        "imageUrl": "/images/laptop-rog.jpg",
                        "active": true,
                        "createdAt": "2024-01-15T10:30:00Z"
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Producto no encontrado",
            content = @Content(
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "timestamp": "2024-01-15T10:30:00Z",
                        "status": 404,
                        "error": "Not Found",
                        "message": "Producto con ID 999 no encontrado",
                        "path": "/api/products/999"
                    }
                    """
                )
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @Parameter(
                description = "ID único del producto a buscar",
                required = true,
                example = "1",
                schema = @Schema(type = "integer", minimum = "1")
            )
            @PathVariable @NotNull @Min(1) Long id) {
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
     * Obtener productos por categor�a
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
     * Obtener categor�as disponibles
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
            @PathVariable @NotNull @Min(1) Long id,
            @Valid @RequestBody UpdateStockRequest request) {

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

    /**
     * Generar predicciones avanzadas de stock usando nuevo ML API
     * POST /api/products/{id}/ml/predictions
     */
    @PostMapping("/{id}/ml/predictions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> generateStockPredictions(
            @PathVariable Long id,
            @RequestParam(defaultValue = "30") Integer daysAhead) {

        log.info("Generating ML stock predictions for product {}: {} days", id, daysAhead);
        
        try {
            var prediction = mlIntegrationService.generateStockPredictions(id, daysAhead);
            return ResponseEntity.ok(prediction);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for stock prediction: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid request", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error generating stock prediction for product {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error", "message", "Error generando predicciones"));
        }
    }

    // DTO para actualizaci�n de stock
    public static class UpdateStockRequest {
        private Integer newStock;

        public Integer getNewStock() { return newStock; }
        public void setNewStock(Integer newStock) { this.newStock = newStock; }
    }
}