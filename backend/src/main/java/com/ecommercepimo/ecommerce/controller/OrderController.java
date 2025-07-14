package com.ecommercepimo.ecommerce.controller;

import com.ecommercepimo.ecommerce.dto.*;
import com.ecommercepimo.ecommerce.entity.Order;
import com.ecommercepimo.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    private final OrderService orderService;

    /**
     * Crear nueva orden
     * POST /api/orders
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderCreateRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        log.info("Creating order for user: {}", userEmail);

        OrderResponse order = orderService.createOrder(userEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * Obtener órdenes del usuario autenticado
     * GET /api/orders/my-orders
     */
    @GetMapping("/my-orders")
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable) {

        String userEmail = authentication.getName();
        log.debug("Getting orders for user: {}", userEmail);

        Page<OrderResponse> orders = orderService.getUserOrders(userEmail, pageable);
        return ResponseEntity.ok(orders);
    }

    /**
     * Obtener orden específica por ID
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        log.debug("Getting order {} for user: {}", id, userEmail);

        OrderResponse order = orderService.getOrderById(id, userEmail);
        return ResponseEntity.ok(order);
    }

    /**
     * Cancelar orden
     * POST /api/orders/{id}/cancel
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        log.info("Cancelling order {} for user: {}", id, userEmail);

        OrderResponse order = orderService.cancelOrder(id, userEmail);
        return ResponseEntity.ok(order);
    }

    /**
     * Obtener todas las órdenes (solo admins)
     * GET /api/orders/admin/all
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @PageableDefault(size = 20) Pageable pageable) {

        log.debug("Getting all orders (admin)");
        Page<OrderResponse> orders = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(orders);
    }

    /**
     * Obtener órdenes por estado (solo admins)
     * GET /api/orders/admin/status/{status}
     */
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderResponse>> getOrdersByStatus(
            @PathVariable Order.OrderStatus status,
            @PageableDefault(size = 20) Pageable pageable) {

        log.debug("Getting orders by status: {}", status);
        Page<OrderResponse> orders = orderService.getOrdersByStatus(status, pageable);
        return ResponseEntity.ok(orders);
    }

    /**
     * Actualizar estado de orden (solo admins)
     * PATCH /api/orders/admin/{id}/status
     */
    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request) {

        log.info("Updating order {} status to: {}", id, request.getStatus());
        OrderResponse order = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(order);
    }

    /**
     * Obtener estadísticas mensuales (solo admins)
     * GET /api/orders/admin/stats/monthly
     */
    @GetMapping("/admin/stats/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderStatsResponse> getMonthlyStats() {
        log.debug("Getting monthly order statistics");

        Object[] stats = orderService.getMonthlyOrderStats();
        OrderStatsResponse response = new OrderStatsResponse();
        response.setTotalOrders(((Number) stats[0]).longValue());
        response.setTotalAmount((BigDecimal) stats[1]);

        return ResponseEntity.ok(response);
    }

    // DTOs internos
    public static class UpdateOrderStatusRequest {
        private Order.OrderStatus status;

        public Order.OrderStatus getStatus() { return status; }
        public void setStatus(Order.OrderStatus status) { this.status = status; }
    }

    public static class OrderStatsResponse {
        private Long totalOrders;
        private BigDecimal totalAmount;

        public Long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    }
}