package com.ecommercepimo.ecommerce.mapper;

import com.ecommercepimo.ecommerce.dto.ProductCreateRequest;
import com.ecommercepimo.ecommerce.dto.ProductResponse;
import com.ecommercepimo.ecommerce.dto.ProductUpdateRequest;
import com.ecommercepimo.ecommerce.entity.Product;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper MapStruct para conversiones entre Product entity y DTOs
 * Incluye mapeos personalizados para campos calculados
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS
)
public interface ProductMapper {

    /**
     * Convierte Product entity a ProductResponse DTO
     * Incluye campos calculados como lowStock
     */
    @Mapping(target = "lowStock", expression = "java(product.getStock() != null && product.getStock() < 10)")
    @Mapping(target = "available", expression = "java(product.isActive() && product.getStock() > 0)")
    ProductResponse toProductResponse(Product product);

    /**
     * Convierte lista de Product entities a lista de ProductResponse DTOs
     */
    List<ProductResponse> toProductResponseList(List<Product> products);

    /**
     * Convierte ProductCreateRequest DTO a Product entity
     * Excluye campos auto-generados
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "orderItems", ignore = true)
    Product toEntity(ProductCreateRequest createRequest);

    /**
     * Actualiza Product entity existente con datos de ProductUpdateRequest
     * Solo actualiza campos no nulos del DTO
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "active", ignore = true) // Se maneja por endpoint separado
    @Mapping(target = "orderItems", ignore = true)
    void updateProductFromDto(ProductUpdateRequest updateRequest, @MappingTarget Product product);

    /**
     * Mapeo especializado para actualizaciones de stock
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "name", ignore = true)
    @Mapping(target = "description", ignore = true)
    @Mapping(target = "price", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    void updateStockOnly(Integer newStock, @MappingTarget Product product);

    /**
     * Mapeos personalizados después de la conversión
     */
    @AfterMapping
    default void setCalculatedFields(@MappingTarget ProductResponse productResponse, Product product) {
        // Calcular estado del stock
        if (product.getStock() != null) {
            if (product.getStock() == 0) {
                productResponse.setStockStatus("OUT_OF_STOCK");
            } else if (product.getStock() < 10) {
                productResponse.setStockStatus("LOW_STOCK");
            } else {
                productResponse.setStockStatus("IN_STOCK");
            }
        }
        
        // Formatear precio para display
        if (product.getPrice() != null) {
            productResponse.setFormattedPrice("$" + product.getPrice().toString());
        }
    }
}