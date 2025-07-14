package com.ecommerxo.api.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CategoryDTO {
    private UUID id;
    private String name;
    private String description;
    private UUID parentId;
    private LocalDateTime createdAt;
}
