package com.ecommercepimo.ecommerce.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para actualizar información de producto
 * Incluye validaciones específicas para e-commerce
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductUpdateRequest {

    @NotBlank(message = "Nombre del producto es obligatorio")
    @Size(min = 3, max = 100, message = "Nombre debe tener entre 3 y 100 caracteres")
    private String name;

    @Size(max = 1000, message = "Descripción no puede superar 1000 caracteres")
    private String description;

    @NotNull(message = "Precio es obligatorio")
    @DecimalMin(value = "0.01", message = "Precio debe ser mayor a 0")
    @DecimalMax(value = "999999.99", message = "Precio no puede superar $999,999.99")
    @Digits(integer = 6, fraction = 2, message = "Precio debe tener máximo 6 dígitos enteros y 2 decimales")
    private BigDecimal price;

    @NotNull(message = "Stock es obligatorio")
    @Min(value = 0, message = "Stock no puede ser negativo")
    @Max(value = 999999, message = "Stock no puede superar 999,999 unidades")
    private Integer stock;

    @Min(value = 0, message = "Stock mínimo no puede ser negativo")
    @Max(value = 1000, message = "Stock mínimo no puede superar 1,000 unidades")
    private Integer minStock;

    @NotBlank(message = "Categoría es obligatoria")
    @Size(min = 3, max = 50, message = "Categoría debe tener entre 3 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s&-]+$", message = "Categoría solo puede contener letras, espacios, guiones y &")
    private String category;

    @Size(max = 500, message = "URL de imagen no puede superar 500 caracteres")
    @Pattern(regexp = "^(https?://).*\\.(jpg|jpeg|png|gif|webp)$|^$", 
             message = "URL de imagen debe ser válida y terminar en .jpg, .jpeg, .png, .gif o .webp")
    private String imageUrl;

    private Boolean featured;
    
    private Boolean active;

    @Size(max = 20, message = "SKU no puede superar 20 caracteres")
    @Pattern(regexp = "^[A-Z0-9-]*$", message = "SKU solo puede contener letras mayúsculas, números y guiones")
    private String sku;

    @DecimalMin(value = "0.0", message = "Peso no puede ser negativo")
    @DecimalMax(value = "1000.0", message = "Peso no puede superar 1000 kg")
    private BigDecimal weight;

    @Size(max = 200, message = "Dimensiones no pueden superar 200 caracteres")
    private String dimensions;
}
}