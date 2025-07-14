package com.ecommercepimo.ecommerce.dto;

import com.ecommercepimo.ecommerce.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private UserResponse user;
    private Order.OrderStatus status;
    private BigDecimal totalAmount;
    private List<OrderItemResponse> orderItems;
    private String shippingAddress;
    private String paymentMethod;
    private Order.PaymentStatus paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
}