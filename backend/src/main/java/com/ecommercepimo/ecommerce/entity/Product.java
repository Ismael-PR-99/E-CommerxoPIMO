package com.ecommercepimo.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "orderItems")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Nombre del producto es obligatorio")
    @Size(max = 100)
    private String name;

    @Column(length = 1000)
    @Size(max = 1000, message = "Descripción no puede superar 1000 caracteres")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Precio es obligatorio")
    @DecimalMin(value = "0.01", message = "Precio debe ser mayor a 0")
    private BigDecimal price;

    @Column(nullable = false)
    @NotNull(message = "Stock es obligatorio")
    @Min(value = 0, message = "Stock no puede ser negativo")
    private Integer stock;

    @Column(name = "min_stock")
    @Min(value = 0, message = "Stock mínimo no puede ser negativo")
    private Integer minStock = 0;

    @Column(nullable = false)
    @NotBlank(message = "Categoría es obligatoria")
    @Size(max = 50)
    private String category;

    @Column(name = "image_url")
    @Size(max = 500)
    private String imageUrl;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(precision = 3, scale = 2)
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "5.0")
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "review_count")
    @Min(value = 0)
    private Integer reviewCount = 0;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<OrderItem> orderItems;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business methods
    public void decreaseStock(Integer quantity) {
        if (this.stock < quantity) {
            throw new IllegalStateException("Stock insuficiente");
        }
        this.stock -= quantity;
    }

    public void increaseStock(Integer quantity) {
        this.stock += quantity;
    }

    public boolean isLowStock() {
        return this.stock <= this.minStock;
    }
}