package com.ecommerxo.api.service;

import com.ecommerxo.api.model.Product;
import com.ecommerxo.api.repository.ProductRepository;
import com.ecommerxo.api.repository.InventoryRepository;
import com.ecommerxo.api.dto.ProductDTO;
import com.ecommerxo.api.model.Inventory;
import com.ecommerxo.api.exception.ResourceNotFoundException;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Cacheable(value = "products", key = "'all'")
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Método paginado optimizado
    public Page<ProductDTO> getAllProductsPaginated(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    @Cacheable(value = "products", key = "#id")
    public ProductDTO getProduct(UUID id) {
        return convertToDTO(findProductById(id));
    }

    @Transactional
    @CachePut(value = "products", key = "#result.id")
    @CacheEvict(value = "products", key = "'all'")
    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = convertToEntity(productDTO);
        product = productRepository.save(product);
        return convertToDTO(product);
    }

    @Transactional
    @CachePut(value = "products", key = "#id")
    @CacheEvict(value = "products", key = "'all'")
    public ProductDTO updateProduct(UUID id, ProductDTO productDTO) {
        Product product = findProductById(id);
        updateProductFromDTO(product, productDTO);
        product = productRepository.save(product);
        return convertToDTO(product);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(UUID id) {
        Product product = findProductById(id);
        productRepository.delete(product);
    }

    @Async
    public CompletableFuture<Void> updateProductStockAsync(UUID productId, int newStock) {
        Product product = findProductById(productId);
        // Actualizar el stock del producto de forma asíncrona
        // Esto podría incluir notificaciones, logs, etc.
        return CompletableFuture.completedFuture(null);
    }

    @Cacheable(value = "products", key = "'lowStock'")
    public List<ProductDTO> getLowStockProducts() {
        return productRepository.findByStockQuantityLessThanMinStockLevel().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getProductsByCategory(UUID categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO updateStock(UUID id, int quantity, String reason) {
        Product product = findProductById(id);
        
        Inventory inventory = new Inventory();
        inventory.setProductId(id);
        inventory.setQuantity(Math.abs(quantity));
        inventory.setReason(reason);
        inventory.setType(quantity > 0 ? "entrada" : "salida");
        
        inventoryRepository.save(inventory);
        
        product.setStockQuantity(product.getStockQuantity() + quantity);
        product = productRepository.save(product);
        
        return convertToDTO(product);
    }

    public long getTotalProducts() {
        return productRepository.count();
    }

    public List<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCase(query);
    }

    public Product findProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCategoryId(product.getCategoryId());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setMinStockLevel(product.getMinStockLevel());
        dto.setSku(product.getSku());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        return dto;
    }

    private Product convertToEntity(ProductDTO dto) {
        Product product = new Product();
        updateProductFromDTO(product, dto);
        return product;
    }

    private void updateProductFromDTO(Product product, ProductDTO dto) {
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategoryId(dto.getCategoryId());
        product.setMinStockLevel(dto.getMinStockLevel());
        product.setSku(dto.getSku());
    }
}
