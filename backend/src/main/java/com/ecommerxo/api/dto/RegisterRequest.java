package com.ecommerxo.api.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class RegisterRequest {
    @Email(message = "Email debe ser válido")
    @NotBlank(message = "Email es requerido")
    private String email;

    @NotBlank(message = "Password es requerido")
    @Size(min = 6, message = "Password debe tener al menos 6 caracteres")
    private String password;

    @NotBlank(message = "Nombre completo es requerido")
    private String fullName;
}
