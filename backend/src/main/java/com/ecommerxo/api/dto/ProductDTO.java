package com.ecommerxo.api.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ProductDTO {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private UUID categoryId;
    private Integer stockQuantity;
    private Integer minStockLevel;
    private String sku;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
