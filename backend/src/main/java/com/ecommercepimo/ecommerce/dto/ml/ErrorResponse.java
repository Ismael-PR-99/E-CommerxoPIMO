package com.ecommercepimo.ecommerce.dto.ml;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO para respuesta de error de ML
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ErrorResponse extends BaseMLResponse {
    
    @Builder.Default
    private Boolean success = false;
    
    private String errorCode;
    
    private Map<String, Object> errorDetails;
    
    private String correlationId;
}