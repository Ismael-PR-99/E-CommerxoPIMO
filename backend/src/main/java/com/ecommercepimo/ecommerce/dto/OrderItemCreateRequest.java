package com.ecommercepimo.ecommerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemCreateRequest {

    @NotNull(message = "ID del producto es obligatorio")
    private Long productId;

    @NotNull(message = "Cantidad es obligatoria")
    @Min(value = 1, message = "Cantidad debe ser al menos 1")
    private Integer quantity;
}