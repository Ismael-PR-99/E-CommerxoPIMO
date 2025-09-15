package com.ecommercepimo.ecommerce.mapper;

import com.ecommercepimo.ecommerce.dto.OrderItemCreateRequest;
import com.ecommercepimo.ecommerce.dto.OrderItemResponse;
import com.ecommercepimo.ecommerce.entity.OrderItem;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Mapper MapStruct para conversiones entre OrderItem entity y DTOs
 * Incluye cálculos de subtotales y validaciones
 */
@Mapper(
    componentModel = "spring", 
    uses = {ProductMapper.class},
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS
)
public interface OrderItemMapper {

    /**
     * Convierte OrderItem entity a OrderItemResponse DTO
     * Incluye cálculos de subtotal y información del producto
     */
    @Mapping(target = "product", source = "product", qualifiedByName = "toProductSummary")
    @Mapping(target = "subtotal", expression = "java(calculateSubtotal(orderItem.getUnitPrice(), orderItem.getQuantity()))")
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    /**
     * Convierte lista de OrderItem entities a lista de OrderItemResponse DTOs
     */
    List<OrderItemResponse> toOrderItemResponseList(List<OrderItem> orderItems);

    /**
     * Convierte OrderItemCreateRequest DTO a OrderItem entity
     * Excluye campos auto-generados y relaciones
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "order", ignore = true) // Se asigna en el servicio
    @Mapping(target = "product", ignore = true) // Se busca por productId en el servicio
    @Mapping(target = "unitPrice", ignore = true) // Se toma del producto actual
    @Mapping(target = "productId", source = "productId") // Para búsqueda del producto
    OrderItem toEntity(OrderItemCreateRequest createRequest);

    /**
     * Mapeo simplificado de producto para respuestas de order item
     */
    @Named("toProductSummary")
    @Mapping(target = "lowStock", ignore = true) // No necesario en el item
    @Mapping(target = "available", ignore = true) // No necesario en el item
    @Mapping(target = "stockStatus", ignore = true) // No necesario en el item
    @Mapping(target = "formattedPrice", ignore = true) // No necesario en el item
    com.ecommercepimo.ecommerce.dto.ProductResponse toProductSummary(com.ecommercepimo.ecommerce.entity.Product product);

    /**
     * Mapeos personalizados después de la conversión
     */
    @AfterMapping
    default void setCalculatedFields(@MappingTarget OrderItemResponse orderItemResponse, OrderItem orderItem) {
        // Calcular precio unitario formateado
        if (orderItem.getUnitPrice() != null) {
            orderItemResponse.setFormattedUnitPrice("$" + orderItem.getUnitPrice().toString());
        }

        // Calcular subtotal formateado
        BigDecimal subtotal = calculateSubtotal(orderItem.getUnitPrice(), orderItem.getQuantity());
        if (subtotal != null) {
            orderItemResponse.setFormattedSubtotal("$" + subtotal.toString());
        }

        // Información adicional del producto en el momento de la compra
        if (orderItem.getProduct() != null) {
            orderItemResponse.setProductName(orderItem.getProduct().getName());
            orderItemResponse.setProductCategory(orderItem.getProduct().getCategory());
        }
    }

    /**
     * Helper method para calcular subtotal
     */
    default BigDecimal calculateSubtotal(BigDecimal unitPrice, Integer quantity) {
        if (unitPrice == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}