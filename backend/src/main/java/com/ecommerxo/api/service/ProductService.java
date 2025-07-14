package com.ecommerxo.api.service;

import com.ecommerxo.api.model.Product;
import com.ecommerxo.api.repository.ProductRepository;
import com.ecommerxo.api.repository.InventoryRepository;
import com.ecommerxo.api.dto.ProductDTO;
import com.ecommerxo.api.model.Inventory;
import com.ecommerxo.api.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProduct(UUID id) {
        return convertToDTO(findProductById(id));
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = convertToEntity(productDTO);
        product = productRepository.save(product);
        return convertToDTO(product);
    }

    @Transactional
    public ProductDTO updateProduct(UUID id, ProductDTO productDTO) {
        Product product = findProductById(id);
        updateProductFromDTO(product, productDTO);
        product = productRepository.save(product);
        return convertToDTO(product);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = findProductById(id);
        productRepository.delete(product);
    }

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
