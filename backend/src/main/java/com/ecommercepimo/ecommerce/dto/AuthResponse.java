package com.ecommercepimo.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para respuesta de autenticación con soporte para refresh tokens
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String type = "Bearer";
    private Long expiresIn; // Tiempo de expiración del access token en milisegundos
    private UserResponse user;
    
    // Constructor para compatibilidad hacia atrás
    public AuthResponse(String token, UserResponse user) {
        this.accessToken = token;
        this.user = user;
        this.type = "Bearer";
    }
    
    // Getter para compatibilidad hacia atrás
    public String getToken() {
        return accessToken;
    }
    
    // Setter para compatibilidad hacia atrás
    public void setToken(String token) {
        this.accessToken = token;
    }
}