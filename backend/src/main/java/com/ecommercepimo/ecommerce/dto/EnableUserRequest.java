package com.ecommercepimo.ecommerce.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO para habilitar/deshabilitar usuario
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnableUserRequest {
    
    @NotNull(message = "El estado de habilitación es obligatorio")
    private Boolean enabled;
}