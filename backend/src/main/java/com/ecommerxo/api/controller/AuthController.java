package com.ecommerxo.api.controller;

import com.ecommerxo.api.dto.LoginRequest;
import com.ecommerxo.api.dto.RegisterRequest;
import com.ecommerxo.api.dto.AuthResponse;
import com.ecommerxo.api.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        String token = authService.login(loginRequest.getEmail(), loginRequest.getPassword());
        return ResponseEntity.ok(new AuthResponse(token, "Login exitoso"));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        String token = authService.login(registerRequest.getEmail(), registerRequest.getPassword());
        return ResponseEntity.ok(new AuthResponse(token, "Registro exitoso"));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // En JWT stateless, el logout se maneja del lado del cliente
        return ResponseEntity.ok("Logout exitoso");
    }
}
