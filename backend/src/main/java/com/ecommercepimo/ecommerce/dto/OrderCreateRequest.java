package com.ecommercepimo.ecommerce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderCreateRequest {

    @NotEmpty(message = "La orden debe tener al menos un item")
    @Valid
    private List<OrderItemCreateRequest> orderItems;

    @NotBlank(message = "Dirección de envío es obligatoria")
    @Size(max = 500)
    private String shippingAddress;

    @Size(max = 50)
    private String paymentMethod;
}