package com.ecommercepimo.ecommerce.exception;

/**
 * Excepción lanzada cuando no se encuentra un usuario
 */
public class UserNotFoundException extends RuntimeException {
    
    public UserNotFoundException(String message) {
        super(message);
    }
    
    public UserNotFoundException(Long userId) {
        super("Usuario no encontrado con ID: " + userId);
    }
    
    public UserNotFoundException(String email) {
        super("Usuario no encontrado con email: " + email);
    }
    
    public UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}