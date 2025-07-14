package com.ecommerxo.api.controller;

import com.ecommerxo.api.dto.OrderDTO;
import com.ecommerxo.api.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody OrderDTO orderDTO) {
        return ResponseEntity.ok(orderService.createOrder(UUID.fromString(userId), orderDTO));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders(
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(UUID.fromString(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrder(
            @AuthenticationPrincipal String userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrder(id, UUID.fromString(userId)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable UUID id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> getOrderStats(
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(orderService.getOrderStats(period));
    }
}
