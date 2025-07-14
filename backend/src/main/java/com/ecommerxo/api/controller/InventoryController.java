package com.ecommerxo.api.controller;

import com.ecommerxo.api.model.Inventory;
import com.ecommerxo.api.model.Product;
import com.ecommerxo.api.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/history/{productId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Inventory>> getInventoryHistory(@PathVariable UUID productId) {
        List<Inventory> history = inventoryService.getInventoryHistory(productId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/movements")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Page<Inventory>> getInventoryMovements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Inventory> movements = inventoryService.getInventoryMovements(page, size);
        return ResponseEntity.ok(movements);
    }

    @PostMapping("/movement")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<String> recordMovement(
            @RequestParam UUID productId,
            @RequestParam int quantity,
            @RequestParam String type,
            @RequestParam(required = false) String reason) {
        inventoryService.recordInventoryMovement(productId, quantity, type, reason);
        return ResponseEntity.ok("Movimiento registrado exitosamente");
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> getInventoryAnalytics() {
        Map<String, Object> analytics = inventoryService.getInventoryAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Product>> getLowStockProducts() {
        List<Product> products = inventoryService.getLowStockProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/by-stock-level")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Product>> getProductsByStockLevel(
            @RequestParam int minStock,
            @RequestParam int maxStock) {
        List<Product> products = inventoryService.getProductsByStockLevel(minStock, maxStock);
        return ResponseEntity.ok(products);
    }

    @PutMapping("/adjust/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adjustInventory(
            @PathVariable UUID productId,
            @RequestParam int newQuantity,
            @RequestParam(required = false) String reason) {
        inventoryService.adjustInventory(productId, newQuantity, reason);
        return ResponseEntity.ok("Inventario ajustado exitosamente");
    }
}
