package com.ecommercepimo.ecommerce.dto;

import com.ecommercepimo.ecommerce.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO para actualizar el estado de un pedido
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {
    
    @NotNull(message = "El estado del pedido es obligatorio")
    private OrderStatus status;
}