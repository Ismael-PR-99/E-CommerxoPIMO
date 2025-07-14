package com.ecommercepimo.ecommerce.mapper;

import com.ecommercepimo.ecommerce.dto.OrderResponse;
import com.ecommercepimo.ecommerce.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", 
        uses = {UserMapper.class, OrderItemMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {

    OrderResponse toOrderResponse(Order order);
}