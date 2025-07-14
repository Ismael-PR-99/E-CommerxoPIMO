package com.ecommercepimo.ecommerce.mapper;

import com.ecommercepimo.ecommerce.dto.ProductCreateRequest;
import com.ecommercepimo.ecommerce.dto.ProductResponse;
import com.ecommercepimo.ecommerce.dto.ProductUpdateRequest;
import com.ecommercepimo.ecommerce.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductMapper {

    @Mapping(target = "lowStock", expression = "java(product.isLowStock())")
    ProductResponse toProductResponse(Product product);

    Product toEntity(ProductCreateRequest createRequest);

    void updateProductFromDto(ProductUpdateRequest updateRequest, @MappingTarget Product product);
}