package com.ecommerxo.api.service;

import com.ecommerxo.api.model.Inventory;
import com.ecommerxo.api.model.Product;
import com.ecommerxo.api.repository.InventoryRepository;
import com.ecommerxo.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Inventory> getInventoryHistory(UUID productId) {
        return inventoryRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public Page<Inventory> getInventoryMovements(int page, int size) {
        return inventoryRepository.findAll(PageRequest.of(page, size));
    }

    @Transactional
    public void recordInventoryMovement(UUID productId, int quantity, String type, String reason) {
        Inventory inventory = new Inventory();
        inventory.setProductId(productId);
        inventory.setQuantity(Math.abs(quantity));
        inventory.setType(type);
        inventory.setReason(reason);
        inventory.setCreatedAt(LocalDateTime.now());

        inventoryRepository.save(inventory);

        // Actualizar stock del producto
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        int newStock = type.equals("entrada") ? 
                product.getStockQuantity() + quantity : 
                product.getStockQuantity() - quantity;

        product.setStockQuantity(Math.max(0, newStock));
        productRepository.save(product);
    }

    public Map<String, Object> getInventoryAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        List<Product> products = productRepository.findAll();
        
        long totalProducts = products.size();
        long lowStockProducts = products.stream()
                .filter(p -> p.getStockQuantity() <= p.getMinStockLevel())
                .count();
        long outOfStockProducts = products.stream()
                .filter(p -> p.getStockQuantity() == 0)
                .count();
        
        double totalInventoryValue = products.stream()
                .mapToDouble(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getStockQuantity())).doubleValue())
                .sum();

        analytics.put("totalProducts", totalProducts);
        analytics.put("lowStockProducts", lowStockProducts);
        analytics.put("outOfStockProducts", outOfStockProducts);
        analytics.put("totalInventoryValue", totalInventoryValue);
        
        return analytics;
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findByStockQuantityLessThanEqual(0);
    }

    public List<Product> getProductsByStockLevel(int minStock, int maxStock) {
        return productRepository.findByStockQuantityBetween(minStock, maxStock);
    }

    @Transactional
    public void adjustInventory(UUID productId, int newQuantity, String reason) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        int currentQuantity = product.getStockQuantity();
        int adjustment = newQuantity - currentQuantity;

        if (adjustment != 0) {
            recordInventoryMovement(
                    productId, 
                    Math.abs(adjustment), 
                    adjustment > 0 ? "entrada" : "salida", 
                    reason != null ? reason : "Ajuste de inventario"
            );
        }
    }
}
