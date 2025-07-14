package com.ecommercepimo.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private Integer minStock;
    private String category;
    private String imageUrl;
    private Boolean active;
    private Boolean featured;
    private BigDecimal rating;
    private Integer reviewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean lowStock;
}