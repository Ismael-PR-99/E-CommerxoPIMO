package com.ecommercepimo.ecommerce.cont    @Operation(
        summary = "Registrar nuevo usuario",
        description = "Crea una nueva cuenta de usuario en el sistema con validación completa",
        tags = {"🔐 Autenticación"}
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Usuario registrado exitosamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthResponse.class),
                examples = @ExampleObject(
                    name = "registro_exitoso",
                    value = """
                    {
                        "success": true,
                        "message": "Usuario registrado exitosamente",
                        "user": {
                            "id": 123,
                            "email": "usuario@ejemplo.com",
                            "firstName": "Juan",
                            "lastName": "Pérez",
                            "role": "USER"
                        },
                        "tokens": {
                            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "refreshToken": "def502001a8f...",
                            "tokenType": "Bearer",
                            "expiresIn": 3600
                        }
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Datos de registro inválidos",
            content = @Content(
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "timestamp": "2024-01-15T10:30:00Z",
                        "status": 400,
                        "error": "Bad Request",
                        "message": "Validation failed",
                        "path": "/api/auth/register",
                        "validationErrors": {
                            "email": "Email debe tener formato válido",
                            "password": "Password debe tener al menos 8 caracteres"
                        }
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Email ya registrado",
            content = @Content(
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = """
                    {
                        "timestamp": "2024-01-15T10:30:00Z",
                        "status": 409,
                        "error": "Conflict",
                        "message": "El email usuario@ejemplo.com ya está registrado",
                        "path": "/api/auth/register"
                    }
                    """
                )
            )
        )
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(
            @Parameter(
                description = "Datos del nuevo usuario a registrar",
                required = true,
                content = @Content(
                    schema = @Schema(implementation = RegisterRequest.class),
                    examples = @ExampleObject(
                        name = "registro_request",
                        value = """
                        {
                            "email": "usuario@ejemplo.com",
                            "password": "miPassword123!",
                            "firstName": "Juan",
                            "lastName": "Pérez",
                            "phone": "+1234567890",
                            "acceptTerms": true
                        }
                        """
                    )
                )
            )
            @Valid @RequestBody RegisterRequest request) {import com.ecommercepimo.ecommerce.dto.*;
import com.ecommercepimo.ecommerce.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador de autenticación con soporte para refresh tokens
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "${app.cors.allow-credentials}")
@Tag(name = "🔐 Autenticación", description = "Operaciones de autenticación: login, registro, refresh tokens")
public class AuthController {

    private final AuthService authService;

    /**
     * Registro de nuevo usuario
     * POST /api/auth/register
     */
    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario", 
               description = "Crea una nueva cuenta de usuario en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Datos de registro inválidos"),
        @ApiResponse(responseCode = "409", description = "El email ya está registrado")
    })
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody 
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Datos para registro de usuario",
                content = @Content(examples = @ExampleObject(value = """
                    {
                      "name": "Juan Pérez",
                      "email": "juan@example.com",
                      "password": "password123"
                    }
                    """))) 
            RegisterRequest request) {
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
    @Operation(summary = "Iniciar sesión", 
               description = "Autentica usuario y retorna tokens de acceso y refresh")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login exitoso",
                    content = @Content(mediaType = "application/json", 
                                     schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas"),
        @ApiResponse(responseCode = "400", description = "Datos de login inválidos")
    })
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody 
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Credenciales de usuario",
                content = @Content(examples = @ExampleObject(value = """
                    {
                      "email": "admin@example.com",
                      "password": "password123"
                    }
                    """))) 
            AuthRequest request) {
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
     * Renovar tokens usando refresh token
     * POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh request received");

        try {
            AuthResponse response = authService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid refresh token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "invalid_token", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "refresh_failed", "message", "Error renovando tokens"));
        }
    }

    /**
     * Logout del usuario (invalidar tokens)
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication, 
                                   @RequestBody(required = false) RefreshTokenRequest request) {
        String email = authentication.getName();
        log.info("Logout request for user: {}", email);

        try {
            // TODO: Implementar blacklist de tokens para invalidación real
            // Por ahora solo confirmamos el logout
            return ResponseEntity.ok(Map.of("message", "Logout exitoso"));
        } catch (Exception e) {
            log.error("Logout failed for user {}: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "logout_failed", "message", "Error durante logout"));
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