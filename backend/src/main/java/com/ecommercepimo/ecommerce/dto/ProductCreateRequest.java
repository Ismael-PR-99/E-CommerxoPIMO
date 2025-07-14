package com.ecommercepimo.ecommerce.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductCreateRequest {

    @NotBlank(message = "Nombre del producto es obligatorio")
    @Size(max = 100)
    private String name;

    @Size(max = 1000, message = "Descripción no puede superar 1000 caracteres")
    private String description;

    @NotNull(message = "Precio es obligatorio")
    @DecimalMin(value = "0.01", message = "Precio debe ser mayor a 0")
    private BigDecimal price;

    @NotNull(message = "Stock es obligatorio")
    @Min(value = 0, message = "Stock no puede ser negativo")
    private Integer stock;

    @Min(value = 0, message = "Stock mínimo no puede ser negativo")
    private Integer minStock = 0;

    @NotBlank(message = "Categoría es obligatoria")
    @Size(max = 50)
    private String category;

    @Size(max = 500)
    private String imageUrl;

    private Boolean featured = false;
}