package com.ecommerxo.api.service;

import com.ecommerxo.api.model.Order;
import com.ecommerxo.api.model.OrderItem;
import com.ecommerxo.api.model.Product;
import com.ecommerxo.api.repository.OrderRepository;
import com.ecommerxo.api.repository.ProductRepository;
import com.ecommerxo.api.dto.OrderDTO;
import com.ecommerxo.api.dto.OrderItemDTO;
import com.ecommerxo.api.exception.ResourceNotFoundException;
import com.ecommerxo.api.exception.UnauthorizedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional
    public OrderDTO createOrder(UUID userId, OrderDTO orderDTO) {
        Order order = new Order();
        order.setUserId(userId);
        order.setStatus("PENDING");
        
        // Calcular el total y validar el stock
        List<OrderItem> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        for (OrderItemDTO itemDTO : orderDTO.getItems()) {
            Product product = productService.findProductById(itemDTO.getProductId());
            
            if (product.getStockQuantity() < itemDTO.getQuantity()) {
                throw new IllegalStateException("Stock insuficiente para " + product.getName());
            }
            
            // Actualizar stock
            product.setStockQuantity(product.getStockQuantity() - itemDTO.getQuantity());
            productRepository.save(product);
            
            OrderItem item = new OrderItem();
            item.setProductId(product.getId());
            item.setQuantity(itemDTO.getQuantity());
            item.setPriceAtTime(product.getPrice());
            
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
            
            items.add(item);
        }
        
        order.setItems(items);
        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);
        
        return convertToDTO(order);
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByUser(UUID userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrder(UUID orderId, UUID userId) {
        Order order = findOrderById(orderId);
        if (!order.getUserId().equals(userId)) {
            throw new UnauthorizedException("No tiene permiso para ver esta orden");
        }
        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(UUID orderId, String status) {
        Order order = findOrderById(orderId);
        order.setStatus(status);
        order = orderRepository.save(order);
        return convertToDTO(order);
    }

    @Transactional
    public void deleteOrder(UUID orderId) {
        Order order = findOrderById(orderId);
        // Restaurar stock
        for (OrderItem item : order.getItems()) {
            Product product = productService.findProductById(item.getProductId());
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
        orderRepository.delete(order);
    }

    public Map<String, Object> getOrderStats(String period) {
        LocalDateTime startDate;
        LocalDateTime endDate = LocalDateTime.now();
        
        switch (period) {
            case "week":
                startDate = endDate.minusWeeks(1);
                break;
            case "month":
                startDate = endDate.minusMonths(1);
                break;
            case "year":
                startDate = endDate.minusYears(1);
                break;
            default:
                startDate = endDate.minusMonths(1);
        }
        
        List<Order> orders = orderRepository.findByCreatedAtBetween(startDate, endDate);
        
        double totalRevenue = orders.stream()
                .mapToDouble(order -> order.getTotalAmount().doubleValue())
                .sum();
                
        long totalOrders = orders.size();
        
        return Map.of(
            "totalRevenue", totalRevenue,
            "totalOrders", totalOrders,
            "averageOrderValue", totalOrders > 0 ? totalRevenue / totalOrders : 0
        );
    }

    private Order findOrderById(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada"));
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setItems(order.getItems().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList()));
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        return dto;
    }
    
    private OrderItemDTO convertItemToDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProductId());
        dto.setQuantity(item.getQuantity());
        dto.setPriceAtTime(item.getPriceAtTime());
        return dto;
    }
}
