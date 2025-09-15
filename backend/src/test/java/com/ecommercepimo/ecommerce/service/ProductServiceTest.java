package com.ecommercepimo.ecommerce.service;

import com.ecommercepimo.ecommerce.dto.*;
import com.ecommercepimo.ecommerce.entity.Product;
import com.ecommercepimo.ecommerce.mapper.ProductMapper;
import com.ecommercepimo.ecommerce.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para ProductService
 * Usando Mockito para mockear repositorios y mappers
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService Tests")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private ProductCreateRequest createRequest;
    private ProductUpdateRequest updateRequest;
    private ProductResponse productResponse;

    @BeforeEach
    void setUp() {
        // Producto de prueba
        testProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .description("Test Description")
                .price(BigDecimal.valueOf(99.99))
                .stock(100)
                .category("Electronics")
                .active(true)
                .build();

        // Request de creación
        createRequest = ProductCreateRequest.builder()
                .name("Test Product")
                .description("Test Description")
                .price(BigDecimal.valueOf(99.99))
                .stock(100)
                .category("Electronics")
                .build();

        // Request de actualización
        updateRequest = ProductUpdateRequest.builder()
                .name("Updated Product")
                .description("Updated Description")
                .price(BigDecimal.valueOf(89.99))
                .stock(150)
                .category("Electronics")
                .build();

        // Response DTO
        productResponse = ProductResponse.builder()
                .id(1L)
                .name("Test Product")
                .description("Test Description")
                .price(BigDecimal.valueOf(99.99))
                .stock(100)
                .category("Electronics")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Crear producto exitosamente")
    void createProduct_Success() {
        // Given
        Product newProduct = Product.builder()
                .name("Test Product")
                .description("Test Description")
                .price(BigDecimal.valueOf(99.99))
                .stock(100)
                .category("Electronics")
                .active(true)
                .build();

        when(productMapper.toEntity(createRequest)).thenReturn(newProduct);
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);
        when(productMapper.toProductResponse(testProduct)).thenReturn(productResponse);

        // When
        ProductResponse result = productService.createProduct(createRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Test Product");
        assertThat(result.getPrice()).isEqualTo(BigDecimal.valueOf(99.99));
        assertThat(result.isActive()).isTrue();

        verify(productMapper).toEntity(createRequest);
        verify(productRepository).save(any(Product.class));
        verify(productMapper).toProductResponse(testProduct);
    }

    @Test
    @DisplayName("Obtener producto por ID exitosamente")
    void getProductById_Success() {
        // Given
        Long productId = 1L;
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productMapper.toProductResponse(testProduct)).thenReturn(productResponse);

        // When
        ProductResponse result = productService.getProductById(productId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Test Product");

        verify(productRepository).findById(productId);
        verify(productMapper).toProductResponse(testProduct);
    }

    @Test
    @DisplayName("Obtener producto por ID - producto no encontrado")
    void getProductById_NotFound() {
        // Given
        Long nonExistentId = 999L;
        when(productRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.getProductById(nonExistentId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Producto no encontrado con ID: 999");

        verify(productRepository).findById(nonExistentId);
        verify(productMapper, never()).toProductResponse(any());
    }

    @Test
    @DisplayName("Actualizar producto exitosamente")
    void updateProduct_Success() {
        // Given
        Long productId = 1L;
        Product updatedProduct = Product.builder()
                .id(1L)
                .name("Updated Product")
                .description("Updated Description")
                .price(BigDecimal.valueOf(89.99))
                .stock(150)
                .category("Electronics")
                .active(true)
                .build();

        ProductResponse updatedResponse = ProductResponse.builder()
                .id(1L)
                .name("Updated Product")
                .description("Updated Description")
                .price(BigDecimal.valueOf(89.99))
                .stock(150)
                .category("Electronics")
                .active(true)
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(updatedProduct);
        when(productMapper.toProductResponse(updatedProduct)).thenReturn(updatedResponse);

        // When
        ProductResponse result = productService.updateProduct(productId, updateRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Updated Product");
        assertThat(result.getPrice()).isEqualTo(BigDecimal.valueOf(89.99));
        assertThat(result.getStock()).isEqualTo(150);

        verify(productRepository).findById(productId);
        verify(productRepository).save(any(Product.class));
        verify(productMapper).toProductResponse(updatedProduct);
    }

    @Test
    @DisplayName("Actualizar producto - producto no encontrado")
    void updateProduct_NotFound() {
        // Given
        Long nonExistentId = 999L;
        when(productRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.updateProduct(nonExistentId, updateRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Producto no encontrado con ID: 999");

        verify(productRepository).findById(nonExistentId);
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Eliminar producto (soft delete)")
    void deleteProduct_Success() {
        // Given
        Long productId = 1L;
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));

        // When
        productService.deleteProduct(productId);

        // Then
        verify(productRepository).findById(productId);
        verify(productRepository).save(argThat(product -> !product.isActive()));
    }

    @Test
    @DisplayName("Eliminar producto - producto no encontrado")
    void deleteProduct_NotFound() {
        // Given
        Long nonExistentId = 999L;
        when(productRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.deleteProduct(nonExistentId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Producto no encontrado con ID: 999");

        verify(productRepository).findById(nonExistentId);
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Obtener todos los productos con paginación")
    void getAllProducts_WithPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products, pageable, 1);
        List<ProductResponse> responses = Arrays.asList(productResponse);

        when(productRepository.findByActiveTrue(pageable)).thenReturn(productPage);
        when(productMapper.toProductResponseList(products)).thenReturn(responses);

        // When
        PagedResponse<ProductResponse> result = productService.getAllProducts(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getTotalPages()).isEqualTo(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Test Product");

        verify(productRepository).findByActiveTrue(pageable);
        verify(productMapper).toProductResponseList(products);
    }

    @Test
    @DisplayName("Buscar productos por categoría")
    void getProductsByCategory_Success() {
        // Given
        String category = "Electronics";
        Pageable pageable = PageRequest.of(0, 10);
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products, pageable, 1);
        List<ProductResponse> responses = Arrays.asList(productResponse);

        when(productRepository.findByCategoryAndActiveTrue(category, pageable)).thenReturn(productPage);
        when(productMapper.toProductResponseList(products)).thenReturn(responses);

        // When
        PagedResponse<ProductResponse> result = productService.getProductsByCategory(category, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCategory()).isEqualTo("Electronics");

        verify(productRepository).findByCategoryAndActiveTrue(category, pageable);
        verify(productMapper).toProductResponseList(products);
    }

    @Test
    @DisplayName("Buscar productos por nombre")
    void searchProducts_Success() {
        // Given
        String searchTerm = "Test";
        Pageable pageable = PageRequest.of(0, 10);
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products, pageable, 1);
        List<ProductResponse> responses = Arrays.asList(productResponse);

        when(productRepository.findByNameContainingIgnoreCaseAndActiveTrue(searchTerm, pageable))
                .thenReturn(productPage);
        when(productMapper.toProductResponseList(products)).thenReturn(responses);

        // When
        PagedResponse<ProductResponse> result = productService.searchProducts(searchTerm, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).contains("Test");

        verify(productRepository).findByNameContainingIgnoreCaseAndActiveTrue(searchTerm, pageable);
        verify(productMapper).toProductResponseList(products);
    }

    @Test
    @DisplayName("Actualizar stock de producto")
    void updateProductStock_Success() {
        // Given
        Long productId = 1L;
        Integer newStock = 200;
        Product updatedProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .description("Test Description")
                .price(BigDecimal.valueOf(99.99))
                .stock(200)
                .category("Electronics")
                .active(true)
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(updatedProduct);
        when(productMapper.toProductResponse(updatedProduct)).thenReturn(
                productResponse.toBuilder().stock(200).build()
        );

        // When
        ProductResponse result = productService.updateProductStock(productId, newStock);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStock()).isEqualTo(200);

        verify(productRepository).findById(productId);
        verify(productRepository).save(argThat(product -> product.getStock().equals(200)));
        verify(productMapper).toProductResponse(updatedProduct);
    }

    @Test
    @DisplayName("Actualizar stock - stock negativo")
    void updateProductStock_NegativeStock() {
        // Given
        Long productId = 1L;
        Integer negativeStock = -10;

        // When & Then
        assertThatThrownBy(() -> productService.updateProductStock(productId, negativeStock))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El stock no puede ser negativo");

        verify(productRepository, never()).findById(any());
        verify(productRepository, never()).save(any());
    }
}