package com.ecommercepimo.ecommerce.service;

import com.ecommercepimo.ecommerce.dto.*;
import com.ecommercepimo.ecommerce.entity.Product;
import com.ecommercepimo.ecommerce.mapper.ProductMapper;
import com.ecommercepimo.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    /**
     * Crear nuevo producto
     */
    public ProductResponse createProduct(ProductCreateRequest request) {
        log.info("Creating new product: {}", request.getName());

        Product product = productMapper.toEntity(request);
        product.setActive(true);

        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}", savedProduct.getId());

        return productMapper.toProductResponse(savedProduct);
    }

    /**
     * Obtener producto por ID
     */
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        log.debug("Getting product by ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

        return productMapper.toProductResponse(product);
    }

    /**
     * Obtener todos los productos activos con paginación
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        log.debug("Getting all active products with pagination");

        Page<Product> products = productRepository.findByActiveTrue(pageable);
        return products.map(productMapper::toProductResponse);
    }

    /**
     * Buscar productos por nombre
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProductsByName(String name, Pageable pageable) {
        log.debug("Searching products by name: {}", name);

        Page<Product> products = productRepository.findByActiveTrueAndNameContaining(name, pageable);
        return products.map(productMapper::toProductResponse);
    }

    /**
     * Obtener productos por categoría
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(String category, Pageable pageable) {
        log.debug("Getting products by category: {}", category);

        Page<Product> products = productRepository.findByActiveTrueAndCategory(category, pageable);
        return products.map(productMapper::toProductResponse);
    }

    /**
     * Filtrar productos por rango de precios
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> filterProductsByPrice(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        log.debug("Filtering products by price range: {} - {}", minPrice, maxPrice);

        Page<Product> products = productRepository.findByActiveTrueAndPriceBetween(minPrice, maxPrice, pageable);
        return products.map(productMapper::toProductResponse);
    }

    /**
     * Obtener productos destacados
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        log.debug("Getting featured products");

        List<Product> products = productRepository.findByActiveTrueAndFeaturedTrueOrderByRatingDesc();
        return products.stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtener categorías disponibles
     */
    @Transactional(readOnly = true)
    public List<String> getAvailableCategories() {
        log.debug("Getting available categories");
        return productRepository.findDistinctCategories();
    }

    /**
     * Actualizar producto
     */
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        log.info("Updating product with ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

        productMapper.updateProductFromDto(request, product);
        Product updatedProduct = productRepository.save(product);

        log.info("Product updated successfully: {}", id);
        return productMapper.toProductResponse(updatedProduct);
    }

    /**
     * Eliminar producto (soft delete)
     */
    public void deleteProduct(Long id) {
        log.info("Deleting product with ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

        product.setActive(false);
        productRepository.save(product);

        log.info("Product deleted successfully: {}", id);
    }

    /**
     * Obtener productos con stock bajo
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        log.debug("Getting low stock products");

        List<Product> products = productRepository.findLowStockProducts();
        return products.stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());
    }

    /**
     * Actualizar stock de producto
     */
    public ProductResponse updateStock(Long id, Integer newStock) {
        log.info("Updating stock for product {}: {}", id, newStock);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

        product.setStock(newStock);
        Product updatedProduct = productRepository.save(product);

        log.info("Stock updated successfully for product: {}", id);
        return productMapper.toProductResponse(updatedProduct);
    }
}