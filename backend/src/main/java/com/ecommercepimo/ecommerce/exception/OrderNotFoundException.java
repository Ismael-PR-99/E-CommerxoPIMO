package com.ecommercepimo.ecommerce.exception;

/**
 * Excepción lanzada cuando no se encuentra un pedido
 */
public class OrderNotFoundException extends RuntimeException {
    
    public OrderNotFoundException(String message) {
        super(message);
    }
    
    public OrderNotFoundException(Long orderId) {
        super("Pedido no encontrado con ID: " + orderId);
    }
    
    public OrderNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}