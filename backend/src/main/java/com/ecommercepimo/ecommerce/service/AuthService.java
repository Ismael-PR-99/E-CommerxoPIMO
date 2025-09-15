package com.ecommercepimo.ecommerce.service;

import com.ecommercepimo.ecommerce.dto.*;
import com.ecommercepimo.ecommerc    }

    /**
     * Renovar tokens usando refresh token
     */
    public AuthResponse refreshToken(String refreshToken) {
        log.info("Refreshing token");

        try {
            // Validar refresh token
            if (!jwtUtil.validateRefreshToken(refreshToken)) {
                throw new IllegalArgumentException("Refresh token inválido o expirado");
            }

            // Extraer username del refresh token
            String username = jwtUtil.extractUsername(refreshToken);
            
            // Buscar usuario
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            // Generar nuevo par de tokens
            JwtUtil.TokenPair tokenPair = jwtUtil.generateTokenPair(user);

            log.info("Tokens refreshed successfully for user: {}", username);

            return AuthResponse.builder()
                    .accessToken(tokenPair.getAccessToken())
                    .refreshToken(tokenPair.getRefreshToken())
                    .expiresIn(tokenPair.getAccessTokenExpiresIn())
                    .user(userMapper.toUserResponse(user))
                    .build();

        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw new IllegalArgumentException("Error renovando tokens: " + e.getMessage());
        }
    }

    /**
     * Cambiar contraseña del usuariotity.User;
import com.ecommercepimo.ecommerce.mapper.UserMapper;
import com.ecommercepimo.ecommerce.repository.UserRepository;
import com.ecommercepimo.ecommerce.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    /**
     * Registrar nuevo usuario
     */
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Verificar si el email ya existe
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email ya est� registrado: " + request.getEmail());
        }

        // Crear nuevo usuario
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        // Generar par de tokens JWT
        JwtUtil.TokenPair tokenPair = jwtUtil.generateTokenPair(savedUser);

        return AuthResponse.builder()
                .accessToken(tokenPair.getAccessToken())
                .refreshToken(tokenPair.getRefreshToken())
                .expiresIn(tokenPair.getAccessTokenExpiresIn())
                .user(userMapper.toUserResponse(savedUser))
                .build();
    }

    /**
     * Autenticar usuario
     */
    public AuthResponse login(AuthRequest request) {
        log.info("Authenticating user with email: {}", request.getEmail());

        try {
            // Autenticar credenciales
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = (User) userDetails;

            // Generar par de tokens JWT
            JwtUtil.TokenPair tokenPair = jwtUtil.generateTokenPair(userDetails);

            log.info("User authenticated successfully: {}", request.getEmail());

            return AuthResponse.builder()
                    .accessToken(tokenPair.getAccessToken())
                    .refreshToken(tokenPair.getRefreshToken())
                    .expiresIn(tokenPair.getAccessTokenExpiresIn())
                    .user(userMapper.toUserResponse(user))
                    .build();

        } catch (BadCredentialsException e) {
            log.error("Authentication failed for user: {}", request.getEmail());
            throw new RuntimeException("Credenciales inv�lidas");
        }
    }

    /**
     * Obtener perfil del usuario autenticado
     */
    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        log.debug("Getting profile for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return userMapper.toUserResponse(user);
    }

    /**
     * Actualizar perfil del usuario
     */
    public UserResponse updateProfile(String email, UserUpdateRequest request) {
        log.info("Updating profile for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        userMapper.updateUserFromDto(request, user);
        User updatedUser = userRepository.save(user);

        log.info("Profile updated successfully for user: {}", email);
        return userMapper.toUserResponse(updatedUser);
    }

    /**
     * Cambiar contrase�a del usuario
     */
    public void changePassword(String email, String currentPassword, String newPassword) {
        log.info("Changing password for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar contrase�a actual
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Contrase�a actual incorrecta");
        }

        // Actualizar contrase�a
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", email);
    }
}