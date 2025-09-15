package com.ecommercepimo.ecommerce.service;

import com.ecommercepimo.ecommerce.dto.*;
import com.ecommercepimo.ecommerce.entity.User;
import com.ecommercepimo.ecommerce.repository.UserRepository;
import com.ecommercepimo.ecommerce.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para AuthService
 * Usando Mockito para mockear dependencias
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private AuthRequest authRequest;
    private JwtUtil.TokenPair tokenPair;

    @BeforeEach
    void setUp() {
        // Usuario de prueba
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .password("encodedPassword")
                .role(User.Role.USER)
                .build();

        // Request de registro
        registerRequest = RegisterRequest.builder()
                .email("test@example.com")
                .name("Test User")
                .password("password123")
                .build();

        // Request de login
        authRequest = AuthRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        // Token pair mock
        tokenPair = new JwtUtil.TokenPair(
                "access-token-jwt",
                "refresh-token-jwt",
                900000L
        );
    }

    @Test
    @DisplayName("Registro exitoso de nuevo usuario")
    void register_Success() {
        // Given
        when(userRepository.findByEmail(registerRequest.getEmail()))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode(registerRequest.getPassword()))
                .thenReturn("encodedPassword");
        when(userRepository.save(any(User.class)))
                .thenReturn(testUser);
        when(jwtUtil.generateTokenPair(testUser))
                .thenReturn(tokenPair);

        // When
        AuthResponse response = authService.register(registerRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token-jwt");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token-jwt");
        assertThat(response.getType()).isEqualTo("Bearer");
        assertThat(response.getExpiresIn()).isEqualTo(900000L);
        assertThat(response.getUser().getEmail()).isEqualTo("test@example.com");

        verify(userRepository).findByEmail(registerRequest.getEmail());
        verify(passwordEncoder).encode(registerRequest.getPassword());
        verify(userRepository).save(any(User.class));
        verify(jwtUtil).generateTokenPair(testUser);
    }

    @Test
    @DisplayName("Registro falla cuando el email ya existe")
    void register_EmailAlreadyExists() {
        // Given
        when(userRepository.findByEmail(registerRequest.getEmail()))
                .thenReturn(Optional.of(testUser));

        // When & Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El email ya está registrado");

        verify(userRepository).findByEmail(registerRequest.getEmail());
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login exitoso con credenciales válidas")
    void login_Success() {
        // Given
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmail(authRequest.getEmail()))
                .thenReturn(Optional.of(testUser));
        when(jwtUtil.generateTokenPair(testUser))
                .thenReturn(tokenPair);

        // When
        AuthResponse response = authService.login(authRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token-jwt");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token-jwt");
        assertThat(response.getUser().getEmail()).isEqualTo("test@example.com");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail(authRequest.getEmail());
        verify(jwtUtil).generateTokenPair(testUser);
    }

    @Test
    @DisplayName("Login falla con credenciales inválidas")
    void login_InvalidCredentials() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Credenciales inválidas"));

        // When & Then
        assertThatThrownBy(() -> authService.login(authRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Credenciales inválidas");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, never()).findByEmail(any());
        verify(jwtUtil, never()).generateTokenPair(any());
    }

    @Test
    @DisplayName("Login falla cuando usuario no existe")
    void login_UserNotFound() {
        // Given
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmail(authRequest.getEmail()))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authService.login(authRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Usuario no encontrado");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail(authRequest.getEmail());
        verify(jwtUtil, never()).generateTokenPair(any());
    }

    @Test
    @DisplayName("Refresh token exitoso")
    void refreshToken_Success() {
        // Given
        String refreshToken = "valid-refresh-token";
        when(jwtUtil.validateRefreshToken(refreshToken)).thenReturn(true);
        when(jwtUtil.extractUsername(refreshToken)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(jwtUtil.generateTokenPair(testUser)).thenReturn(tokenPair);

        // When
        AuthResponse response = authService.refreshToken(refreshToken);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token-jwt");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token-jwt");
        assertThat(response.getUser().getEmail()).isEqualTo("test@example.com");

        verify(jwtUtil).validateRefreshToken(refreshToken);
        verify(jwtUtil).extractUsername(refreshToken);
        verify(userRepository).findByEmail("test@example.com");
        verify(jwtUtil).generateTokenPair(testUser);
    }

    @Test
    @DisplayName("Refresh token falla con token inválido")
    void refreshToken_InvalidToken() {
        // Given
        String invalidToken = "invalid-refresh-token";
        when(jwtUtil.validateRefreshToken(invalidToken)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> authService.refreshToken(invalidToken))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Refresh token inválido o expirado");

        verify(jwtUtil).validateRefreshToken(invalidToken);
        verify(jwtUtil, never()).extractUsername(any());
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    @DisplayName("Refresh token falla cuando usuario no existe")
    void refreshToken_UserNotFound() {
        // Given
        String refreshToken = "valid-refresh-token";
        when(jwtUtil.validateRefreshToken(refreshToken)).thenReturn(true);
        when(jwtUtil.extractUsername(refreshToken)).thenReturn("nonexistent@example.com");
        when(userRepository.findByEmail("nonexistent@example.com"))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authService.refreshToken(refreshToken))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Usuario no encontrado");

        verify(jwtUtil).validateRefreshToken(refreshToken);
        verify(jwtUtil).extractUsername(refreshToken);
        verify(userRepository).findByEmail("nonexistent@example.com");
        verify(jwtUtil, never()).generateTokenPair(any());
    }

    @Test
    @DisplayName("Logout exitoso invalida refresh token")
    void logout_Success() {
        // Given
        String refreshToken = "valid-refresh-token";
        when(jwtUtil.validateRefreshToken(refreshToken)).thenReturn(true);
        when(jwtUtil.invalidateRefreshToken(refreshToken)).thenReturn(true);

        // When
        boolean result = authService.logout(refreshToken);

        // Then
        assertThat(result).isTrue();
        verify(jwtUtil).validateRefreshToken(refreshToken);
        verify(jwtUtil).invalidateRefreshToken(refreshToken);
    }

    @Test
    @DisplayName("Logout con token inválido")
    void logout_InvalidToken() {
        // Given
        String invalidToken = "invalid-refresh-token";
        when(jwtUtil.validateRefreshToken(invalidToken)).thenReturn(false);

        // When
        boolean result = authService.logout(invalidToken);

        // Then
        assertThat(result).isFalse();
        verify(jwtUtil).validateRefreshToken(invalidToken);
        verify(jwtUtil, never()).invalidateRefreshToken(any());
    }
}