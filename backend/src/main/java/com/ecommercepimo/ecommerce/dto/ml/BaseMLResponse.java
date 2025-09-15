package com.ecommercepimo.ecommerce.dto.ml;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO para respuesta base de ML
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaseMLResponse {
    
    @Builder.Default
    private Boolean success = true;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    private String message;
}