package com.ecommercepimo.ecommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {

    @Email(message = "Email debe tener formato válido")
    @NotBlank(message = "Email es obligatorio")
    private String email;

    @NotBlank(message = "Password es obligatorio")
    @Size(min = 8, message = "Password debe tener al menos 8 caracteres")
    private String password;
}