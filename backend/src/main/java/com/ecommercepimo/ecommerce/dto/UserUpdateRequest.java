package com.ecommercepimo.ecommerce.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar información de usuario
 * Incluye validaciones robustas para todos los campos
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateRequest {

    @NotBlank(message = "Nombre es obligatorio")
    @Size(min = 2, max = 50, message = "Nombre debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "Nombre solo puede contener letras y espacios")
    private String firstName;

    @NotBlank(message = "Apellido es obligatorio")
    @Size(min = 2, max = 50, message = "Apellido debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "Apellido solo puede contener letras y espacios")
    private String lastName;

    @NotBlank(message = "Teléfono es obligatorio")
    @Pattern(
        regexp = "^\\+?[1-9]\\d{1,14}$", 
        message = "Teléfono debe tener formato válido (ej: +1234567890 o 1234567890)"
    )
    private String phone;

    @Size(max = 500, message = "Dirección no puede superar 500 caracteres")
    private String address;

    @Size(max = 100, message = "Ciudad no puede superar 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]*$", message = "Ciudad solo puede contener letras y espacios")
    private String city;

    @Size(max = 100, message = "País no puede superar 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]*$", message = "País solo puede contener letras y espacios")
    private String country;

    @Pattern(
        regexp = "^\\d{5}(-\\d{4})?$|^$", 
        message = "Código postal debe tener formato válido (ej: 12345 o 12345-6789)"
    )
    private String postalCode;
}
}