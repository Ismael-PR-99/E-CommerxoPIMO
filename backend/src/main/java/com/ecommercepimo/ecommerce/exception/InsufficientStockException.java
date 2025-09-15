package com.ecommercepimo.ecommerce.exception;

/**
 * Excepción lanzada cuando no hay stock suficiente de un producto
 */
public class InsufficientStockException extends RuntimeException {
    
    private final Long productId;
    private final Integer requestedQuantity;
    private final Integer availableStock;
    
    public InsufficientStockException(String message) {
        super(message);
        this.productId = null;
        this.requestedQuantity = null;
        this.availableStock = null;
    }
    
    public InsufficientStockException(Long productId, Integer requestedQuantity, Integer availableStock) {
        super(String.format("Stock insuficiente para el producto ID %d. Solicitado: %d, Disponible: %d", 
                productId, requestedQuantity, availableStock));
        this.productId = productId;
        this.requestedQuantity = requestedQuantity;
        this.availableStock = availableStock;
    }
    
    public InsufficientStockException(String productName, Integer requestedQuantity, Integer availableStock) {
        super(String.format("Stock insuficiente para el producto '%s'. Solicitado: %d, Disponible: %d", 
                productName, requestedQuantity, availableStock));
        this.productId = null;
        this.requestedQuantity = requestedQuantity;
        this.availableStock = availableStock;
    }
    
    public InsufficientStockException(String message, Throwable cause) {
        super(message, cause);
        this.productId = null;
        this.requestedQuantity = null;
        this.availableStock = null;
    }
    
    public Long getProductId() {
        return productId;
    }
    
    public Integer getRequestedQuantity() {
        return requestedQuantity;
    }
    
    public Integer getAvailableStock() {
        return availableStock;
    }
}