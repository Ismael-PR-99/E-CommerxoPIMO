package com.ecommercepimo.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"order", "product"})
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @NotNull(message = "Orden es obligatoria")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @NotNull(message = "Producto es obligatorio")
    private Product product;

    @Column(nullable = false)
    @NotNull(message = "Cantidad es obligatoria")
    @Min(value = 1, message = "Cantidad debe ser al menos 1")
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Precio unitario es obligatorio")
    @DecimalMin(value = "0.01", message = "Precio unitario debe ser mayor a 0")
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Subtotal es obligatorio")
    private BigDecimal subtotal;

    @PrePersist
    @PreUpdate
    public void calculateSubtotal() {
        if (quantity != null && unitPrice != null) {
            this.subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
}