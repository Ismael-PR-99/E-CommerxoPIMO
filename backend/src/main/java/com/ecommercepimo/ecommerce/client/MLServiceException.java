package com.ecommercepimo.ecommerce.client;

import com.ecommercepimo.ecommerce.dto.ml.ErrorResponse;
import lombok.Getter;

/**
 * Excepción personalizada para errores del ML Service
 */
@Getter
public class MLServiceException extends RuntimeException {
    
    private final ErrorResponse errorResponse;

    public MLServiceException(ErrorResponse errorResponse) {
        super(errorResponse.getMessage());
        this.errorResponse = errorResponse;
    }

    public MLServiceException(String message, ErrorResponse errorResponse) {
        super(message);
        this.errorResponse = errorResponse;
    }

    public MLServiceException(String message, Throwable cause, ErrorResponse errorResponse) {
        super(message, cause);
        this.errorResponse = errorResponse;
    }
}