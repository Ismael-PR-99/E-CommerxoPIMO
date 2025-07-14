package com.ecommercepimo.ecommerce.controller;

import com.ecommercepimo.ecommerce.dto.*;
import com.ecommercepimo.ecommerce.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    /**
     * Registro de nuevo usuario
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());

        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Registration failed for {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    /**
     * Login de usuario
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed for {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    /**
     * Obtener perfil del usuario autenticado
     * GET /api/auth/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        log.debug("Getting profile for user: {}", email);

        UserResponse profile = authService.getProfile(email);
        return ResponseEntity.ok(profile);
    }

    /**
     * Actualizar perfil del usuario
     * PUT /api/auth/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UserUpdateRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        log.info("Updating profile for user: {}", email);

        UserResponse updatedProfile = authService.updateProfile(email, request);
        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * Cambiar contraseña
     * POST /api/auth/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        log.info("Password change request for user: {}", email);

        authService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    // DTO para cambio de contraseña
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;

        // getters y setters
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}