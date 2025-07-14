package com.ecommerxo.api.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class LoginRequest {
    @Email(message = "Email debe ser válido")
    @NotBlank(message = "Email es requerido")
    private String email;

    @NotBlank(message = "Password es requerido")
    private String password;
}
