package com.ecommercepimo.ecommerce.dto;

import com.ecommercepimo.ecommerce.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private User.Role role;
    private Boolean enabled;
    private LocalDateTime createdAt;
}