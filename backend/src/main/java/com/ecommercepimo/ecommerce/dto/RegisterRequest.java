package com.ecommercepimo.ecommerce.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @Email(message = "Email debe tener formato válido")
    @NotBlank(message = "Email es obligatorio")
    private String email;

    @NotBlank(message = "Password es obligatorio")
    @Size(min = 8, message = "Password debe tener al menos 8 caracteres")
    private String password;

    @NotBlank(message = "Nombre es obligatorio")
    @Size(max = 50)
    private String firstName;

    @NotBlank(message = "Apellido es obligatorio")
    @Size(max = 50)
    private String lastName;

    @NotBlank(message = "Teléfono es obligatorio")
    @Pattern(regexp = "^\+?[1-9]\d{1,14}$", message = "Teléfono inválido")
    private String phone;
}