package com.ecommercepimo.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemResponse {

    private Long id;
    private ProductResponse product;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}