package com.ecommercepimo.ecommerce.mapper;

import com.ecommercepimo.ecommerce.dto.OrderCreateRequest;
import com.ecommercepimo.ecommerce.dto.OrderResponse;
import com.ecommercepimo.ecommerce.entity.Order;
import com.ecommercepimo.ecommerce.entity.OrderStatus;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Mapper MapStruct para conversiones entre Order entity y DTOs
 * Utiliza otros mappers para relaciones complejas
 */
@Mapper(
    componentModel = "spring", 
    uses = {UserMapper.class, OrderItemMapper.class},
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS
)
public interface OrderMapper {

    /**
     * Convierte Order entity a OrderResponse DTO
     * Incluye mapeos de relaciones y campos calculados
     */
    @Mapping(target = "user", source = "user", qualifiedByName = "toUserSummary")
    @Mapping(target = "orderItems", source = "orderItems")
    @Mapping(target = "itemCount", expression = "java(order.getOrderItems() != null ? order.getOrderItems().size() : 0)")
    @Mapping(target = "statusDescription", expression = "java(getStatusDescription(order.getStatus()))")
    OrderResponse toOrderResponse(Order order);

    /**
     * Convierte lista de Order entities a lista de OrderResponse DTOs
     */
    List<OrderResponse> toOrderResponseList(List<Order> orders);

    /**
     * Convierte OrderCreateRequest DTO a Order entity
     * Excluye campos auto-generados y relaciones
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true) // Se asigna en el servicio
    @Mapping(target = "orderItems", ignore = true) // Se crean por separado
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "totalAmount", ignore = true) // Se calcula en el servicio
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Order toEntity(OrderCreateRequest createRequest);

    /**
     * Mapeo simplificado de usuario para respuestas de orden
     */
    @Named("toUserSummary")
    @Mapping(target = "fullName", expression = "java(user.getFirstName() + \" \" + user.getLastName())")
    @Mapping(target = "accountActive", source = "enabled")
    @Mapping(target = "totalOrders", ignore = true) // No necesario en resumen
    com.ecommercepimo.ecommerce.dto.UserResponse toUserSummary(com.ecommercepimo.ecommerce.entity.User user);

    /**
     * Mapeos personalizados después de la conversión
     */
    @AfterMapping
    default void setCalculatedFields(@MappingTarget OrderResponse orderResponse, Order order) {
        // Calcular total de items
        if (order.getOrderItems() != null) {
            int totalQuantity = order.getOrderItems().stream()
                    .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                    .sum();
            orderResponse.setTotalQuantity(totalQuantity);
        }

        // Establecer si la orden puede ser cancelada
        orderResponse.setCancellable(
            order.getStatus() == OrderStatus.PENDING || 
            order.getStatus() == OrderStatus.CONFIRMED
        );

        // Establecer si la orden puede ser modificada
        orderResponse.setModifiable(order.getStatus() == OrderStatus.PENDING);
    }

    /**
     * Helper method para descripción de estado
     */
    default String getStatusDescription(OrderStatus status) {
        if (status == null) return "Desconocido";
        
        return switch (status) {
            case PENDING -> "Pendiente de confirmación";
            case CONFIRMED -> "Confirmada";
            case SHIPPED -> "Enviada";
            case DELIVERED -> "Entregada";
            case CANCELLED -> "Cancelada";
            default -> status.toString();
        };
    }
}