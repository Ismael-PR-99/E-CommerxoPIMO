package com.ecommerxo.api.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class OrderDTO {
    private UUID id;
    private UUID userId;
    private String status;
    private BigDecimal totalAmount;
    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
