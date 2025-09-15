package com.ecommercepimo.ecommerce.dto.ml;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO para recomendación individual de producto
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRecommendation {
    
    @NotNull
    private Long productId;
    
    @DecimalMin(value = "0.0", message = "El score debe ser mayor o igual a 0")
    @DecimalMax(value = "1.0", message = "El score debe ser menor o igual a 1")
    private Double score;
    
    @NotBlank(message = "La razón no puede estar vacía")
    private String reason;
    
    private String category;
    
    @DecimalMin(value = "0.0", message = "El precio debe ser positivo")
    private Double price;
    
    @DecimalMin(value = "0.0", message = "La confianza debe ser mayor o igual a 0")
    @DecimalMax(value = "1.0", message = "La confianza debe ser menor o igual a 1")
    private Double confidence;
    
    // Campos adicionales para contexto
    private String productName;
    private String imageUrl;
    private Integer stock;
}