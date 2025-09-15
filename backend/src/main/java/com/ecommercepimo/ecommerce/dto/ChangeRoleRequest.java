package com.ecommercepimo.ecommerce.dto;

import com.ecommercepimo.ecommerce.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO para cambiar rol de usuario
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangeRoleRequest {
    
    @NotNull(message = "El rol es obligatorio")
    private Role role;
}