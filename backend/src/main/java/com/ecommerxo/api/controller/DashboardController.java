package com.ecommerxo.api.controller;

import com.ecommerxo.api.service.InventoryService;
import com.ecommerxo.api.service.OrderService;
import com.ecommerxo.api.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // Métricas de productos
        long totalProducts = productService.getTotalProducts();
        metrics.put("totalProducts", totalProducts);
        
        // Métricas de inventario
        Map<String, Object> inventoryMetrics = inventoryService.getInventoryAnalytics();
        metrics.putAll(inventoryMetrics);
        
        // Métricas de órdenes (simuladas por ahora)
        metrics.put("totalOrders", 0);
        metrics.put("pendingOrders", 0);
        metrics.put("totalRevenue", 0.0);
        
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/sales-chart")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> getSalesChart() {
        Map<String, Object> salesData = new HashMap<>();
        
        // Datos simulados para el gráfico de ventas
        salesData.put("labels", new String[]{"Ene", "Feb", "Mar", "Abr", "May", "Jun"});
        salesData.put("sales", new double[]{1200, 1900, 800, 1500, 2000, 2400});
        salesData.put("revenue", new double[]{12000, 19000, 8000, 15000, 20000, 24000});
        
        return ResponseEntity.ok(salesData);
    }

    @GetMapping("/top-products")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> getTopProducts() {
        Map<String, Object> topProducts = new HashMap<>();
        
        // Datos simulados de productos más vendidos
        topProducts.put("products", new String[]{"Laptop", "Mouse", "Teclado", "Monitor", "Auriculares"});
        topProducts.put("sales", new int[]{45, 38, 32, 28, 25});
        
        return ResponseEntity.ok(topProducts);
    }

    @GetMapping("/inventory-status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> getInventoryStatus() {
        Map<String, Object> status = inventoryService.getInventoryAnalytics();
        return ResponseEntity.ok(status);
    }
}
