package com.ecommercepimo.ecommerce.exception;

/**
 * Excepción lanzada cuando no se encuentra un producto
 */
public class ProductNotFoundException extends RuntimeException {
    
    public ProductNotFoundException(String message) {
        super(message);
    }
    
    public ProductNotFoundException(Long productId) {
        super("Producto no encontrado con ID: " + productId);
    }
    
    public ProductNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}