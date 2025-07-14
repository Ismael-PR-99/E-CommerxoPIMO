package com.ecommercepimo.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "orderItems")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    @NotBlank(message = "Número de orden es obligatorio")
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "Usuario es obligatorio")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Total es obligatorio")
    @DecimalMin(value = "0.01", message = "Total debe ser mayor a 0")
    private BigDecimal totalAmount;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private Set<OrderItem> orderItems = new HashSet<>();

    @Column(name = "shipping_address", nullable = false)
    @NotBlank(message = "Dirección de envío es obligatoria")
    @Size(max = 500)
    private String shippingAddress;

    @Column(name = "payment_method")
    @Size(max = 50)
    private String paymentMethod;

    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business methods
    public void addOrderItem(OrderItem orderItem) {
        orderItems.add(orderItem);
        orderItem.setOrder(this);
        calculateTotalAmount();
    }

    public void removeOrderItem(OrderItem orderItem) {
        orderItems.remove(orderItem);
        orderItem.setOrder(null);
        calculateTotalAmount();
    }

    public void calculateTotalAmount() {
        this.totalAmount = orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void markAsShipped() {
        this.status = OrderStatus.SHIPPED;
        this.shippedAt = LocalDateTime.now();
    }

    public void markAsDelivered() {
        this.status = OrderStatus.DELIVERED;
        this.deliveredAt = LocalDateTime.now();
    }

    public enum OrderStatus {
        PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    }

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED
    }
}