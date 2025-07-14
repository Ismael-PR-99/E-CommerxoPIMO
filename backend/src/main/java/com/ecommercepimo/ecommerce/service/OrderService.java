package com.ecommercepimo.ecommerce.service;

import com.ecommercepimo.ecommerce.dto.*;
import com.ecommercepimo.ecommerce.entity.*;
import com.ecommercepimo.ecommerce.mapper.OrderMapper;
import com.ecommercepimo.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    /**
     * Crear nueva orden
     */
    public OrderResponse createOrder(String userEmail, OrderCreateRequest request) {
        log.info("Creating new order for user: {}", userEmail);

        // Obtener usuario
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Crear orden
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .status(Order.OrderStatus.PENDING)
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(Order.PaymentStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        // Procesar items de la orden
        for (OrderItemCreateRequest itemRequest : request.getOrderItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + itemRequest.getProductId()));

            // Verificar stock disponible
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para producto: " + product.getName());
            }

            // Crear item de orden
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();

            order.addOrderItem(orderItem);

            // Actualizar stock del producto
            product.decreaseStock(itemRequest.getQuantity());
            productRepository.save(product);
        }

        Order savedOrder = orderRepository.save(order);
        log.info("Order created successfully with number: {}", savedOrder.getOrderNumber());

        return orderMapper.toOrderResponse(savedOrder);
    }

    /**
     * Obtener órdenes del usuario
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(String userEmail, Pageable pageable) {
        log.debug("Getting orders for user: {}", userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Page<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return orders.map(orderMapper::toOrderResponse);
    }

    /**
     * Obtener orden por ID
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, String userEmail) {
        log.debug("Getting order by ID: {} for user: {}", id, userEmail);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        // Verificar que la orden pertenezca al usuario (o sea admin)
        if (!order.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Acceso denegado a la orden");
        }

        return orderMapper.toOrderResponse(order);
    }

    /**
     * Obtener todas las órdenes (solo admins)
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        log.debug("Getting all orders");

        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(orderMapper::toOrderResponse);
    }

    /**
     * Obtener órdenes por estado
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
        log.debug("Getting orders by status: {}", status);

        Page<Order> orders = orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        return orders.map(orderMapper::toOrderResponse);
    }

    /**
     * Actualizar estado de orden
     */
    public OrderResponse updateOrderStatus(Long id, Order.OrderStatus newStatus) {
        log.info("Updating order {} status to: {}", id, newStatus);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        order.setStatus(newStatus);

        // Actualizar timestamps según el estado
        switch (newStatus) {
            case SHIPPED:
                order.markAsShipped();
                break;
            case DELIVERED:
                order.markAsDelivered();
                break;
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Order status updated successfully: {}", id);

        return orderMapper.toOrderResponse(updatedOrder);
    }

    /**
     * Cancelar orden
     */
    public OrderResponse cancelOrder(Long id, String userEmail) {
        log.info("Cancelling order {} for user: {}", id, userEmail);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        // Verificar que la orden pertenezca al usuario
        if (!order.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Acceso denegado a la orden");
        }

        // Solo se pueden cancelar órdenes pendientes o confirmadas
        if (order.getStatus() == Order.OrderStatus.SHIPPED || 
            order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("No se puede cancelar una orden ya enviada o entregada");
        }

        // Restaurar stock de productos
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.increaseStock(item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);

        log.info("Order cancelled successfully: {}", id);
        return orderMapper.toOrderResponse(cancelledOrder);
    }

    /**
     * Obtener estadísticas de órdenes
     */
    @Transactional(readOnly = true)
    public Object[] getMonthlyOrderStats() {
        log.debug("Getting monthly order statistics");
        return orderRepository.getCurrentMonthStats();
    }

    /**
     * Calcular total de ventas en un período
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalSalesBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        log.debug("Calculating total sales between {} and {}", startDate, endDate);
        return orderRepository.calculateTotalSalesBetweenDates(startDate, endDate);
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}