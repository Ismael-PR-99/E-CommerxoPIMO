package com.ecommercepimo.ecommerce.mapper;

import com.ecommercepimo.ecommerce.dto.OrderItemResponse;
import com.ecommercepimo.ecommerce.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", 
        uses = {ProductMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderItemMapper {

    OrderItemResponse toOrderItemResponse(OrderItem orderItem);
}