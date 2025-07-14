package com.ecommerxo.api.repository;

import com.ecommerxo.api.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByCategoryId(UUID categoryId);
    
    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= p.minStockLevel")
    List<Product> findByStockQuantityLessThanMinStockLevel();
    
    List<Product> findByNameContainingIgnoreCase(String name);
    
    boolean existsBySku(String sku);

    List<Product> findByStockQuantityLessThanEqual(int quantity);
    List<Product> findByStockQuantityBetween(int minStock, int maxStock);
    
    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= p.minStockLevel")
    List<Product> findLowStockProducts();
}
