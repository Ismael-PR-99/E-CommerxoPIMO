package com.ecommercepimo.ecommerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO para actualizar el stock de un producto
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStockRequest {
    
    @NotNull(message = "El nuevo stock es obligatorio")
    @Min(value = 0, message = "El stock debe ser mayor o igual a 0")
    private Integer newStock;
}