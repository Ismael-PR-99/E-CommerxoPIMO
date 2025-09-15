package com.ecommercepimo.ecommerce.exception;

import feign.FeignException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para GlobalExceptionHandler
 */
@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    @Mock
    private WebRequest webRequest;

    @Mock
    private BindingResult bindingResult;

    @BeforeEach
    void setUp() {
        when(webRequest.getDescription(false)).thenReturn("uri=/api/test");
    }

    @Test
    void shouldHandleMethodArgumentNotValidException() {
        // Given
        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        FieldError fieldError = new FieldError("objectName", "fieldName", "Error message");
        
        when(exception.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError));

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleValidationExceptions(exception, webRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getStatus()).isEqualTo(400);
        assertThat(errorResponse.getError()).isEqualTo("Bad Request");
        assertThat(errorResponse.getPath()).isEqualTo("/api/test");
        assertThat(errorResponse.getValidationErrors()).containsKey("fieldName");
        assertThat(errorResponse.getValidationErrors().get("fieldName")).isEqualTo("Error message");
    }

    @Test
    void shouldHandleConstraintViolationException() {
        // Given
        ConstraintViolationException exception = mock(ConstraintViolationException.class);
        ConstraintViolation<?> violation = mock(ConstraintViolation.class);
        
        when(exception.getConstraintViolations()).thenReturn(Set.of(violation));
        when(violation.getPropertyPath()).thenReturn(mock(jakarta.validation.Path.class));
        when(violation.getPropertyPath().toString()).thenReturn("parameterName");
        when(violation.getMessage()).thenReturn("Parameter error");

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleConstraintViolation(exception, webRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getStatus()).isEqualTo(400);
        assertThat(errorResponse.getError()).isEqualTo("Bad Request");
        assertThat(errorResponse.getPath()).isEqualTo("/api/test");
        assertThat(errorResponse.getValidationErrors()).containsKey("parameterName");
    }

    @Test
    void shouldHandleDataIntegrityViolationException() {
        // Given
        DataIntegrityViolationException exception = new DataIntegrityViolationException(
                "Duplicate entry 'test@example.com' for key 'UK_email'");

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleDataIntegrityViolation(exception, webRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getStatus()).isEqualTo(409);
        assertThat(errorResponse.getError()).isEqualTo("Conflict");
        assertThat(errorResponse.getMessage()).isEqualTo("El registro ya existe en el sistema");
        assertThat(errorResponse.getPath()).isEqualTo("/api/test");
    }

    @Test
    void shouldHandleFeignExceptionNotFound() {
        // Given
        FeignException exception = FeignException.errorStatus("test", 
                feign.Response.builder()
                        .status(404)
                        .reason("Not Found")
                        .request(mock(feign.Request.class))
                        .headers(java.util.Collections.emptyMap())
                        .build());

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleFeignException(exception, webRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getStatus()).isEqualTo(404);
        assertThat(errorResponse.getError()).isEqualTo("Not Found");
        assertThat(errorResponse.getMessage()).isEqualTo("Recurso no encontrado en servicio externo");
        assertThat(errorResponse.getPath()).isEqualTo("/api/test");
    }

    @Test
    void shouldHandleMethodArgumentTypeMismatchException() {
        // Given
        MethodArgumentTypeMismatchException exception = mock(MethodArgumentTypeMismatchException.class);
        when(exception.getName()).thenReturn("id");
        when(exception.getRequiredType()).thenReturn((Class) Long.class);

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleTypeMismatch(exception, webRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getStatus()).isEqualTo(400);
        assertThat(errorResponse.getError()).isEqualTo("Bad Request");
        assertThat(errorResponse.getMessage()).contains("El parámetro 'id' debe ser de tipo Long");
        assertThat(errorResponse.getPath()).isEqualTo("/api/test");
    }

    @Test
    void shouldHandleBadCredentialsException() {
        // Given
        BadCredentialsException exception = new BadCredentialsException("Invalid credentials");

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleBadCredentials(exception, webRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getStatus()).isEqualTo(401);
        assertThat(errorResponse.getError()).isEqualTo("Unauthorized");
        assertThat(errorResponse.getMessage()).isEqualTo("Credenciales inválidas");
        assertThat(errorResponse.getPath()).isEqualTo("/api/test");
    }

    @Test
    void shouldHandleAccessDeniedException() {
        // Given
        AccessDeniedException exception = new AccessDeniedException("Access is denied");

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleAccessDenied(exception, webRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getStatus()).isEqualTo(403);
        assertThat(errorResponse.getError()).isEqualTo("Forbidden");
        assertThat(errorResponse.getMessage()).isEqualTo("No tienes permisos para acceder a este recurso");
        assertThat(errorResponse.getPath()).isEqualTo("/api/test");
    }

    @Test
    void shouldHandleProductNotFoundException() {
        // Given
        ProductNotFoundException exception = new ProductNotFoundException("Product not found with ID: 123");

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleProductNotFound(exception, webRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getStatus()).isEqualTo(404);
        assertThat(errorResponse.getError()).isEqualTo("Not Found");
        assertThat(errorResponse.getMessage()).isEqualTo("Product not found with ID: 123");
        assertThat(errorResponse.getPath()).isEqualTo("/api/test");
    }

    @Test
    void shouldHandleInsufficientStockException() {
        // Given
        InsufficientStockException exception = new InsufficientStockException(1L, 5, 3);

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleInsufficientStock(exception, webRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getStatus()).isEqualTo(409);
        assertThat(errorResponse.getError()).isEqualTo("Conflict");
        assertThat(errorResponse.getMessage()).contains("Stock insuficiente");
        assertThat(errorResponse.getPath()).isEqualTo("/api/test");
    }

    @Test
    void shouldHandleGenericException() {
        // Given
        Exception exception = new Exception("Unexpected error");

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleGenericException(exception, webRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getStatus()).isEqualTo(500);
        assertThat(errorResponse.getError()).isEqualTo("Internal Server Error");
        assertThat(errorResponse.getMessage()).isEqualTo("Ha ocurrido un error interno del servidor");
        assertThat(errorResponse.getPath()).isEqualTo("/api/test");
    }

    @Test
    void shouldExtractPathCorrectly() {
        // Given
        when(webRequest.getDescription(false)).thenReturn("uri=/api/products/123");

        // When
        Exception exception = new RuntimeException("Test error");
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleRuntimeException(exception, webRequest);

        // Then
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getPath()).isEqualTo("/api/products/123");
    }

    @Test
    void shouldHandlePathWithoutUriPrefix() {
        // Given
        when(webRequest.getDescription(false)).thenReturn("some-other-format");

        // When
        Exception exception = new RuntimeException("Test error");
        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleRuntimeException(exception, webRequest);

        // Then
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getPath()).isEqualTo("some-other-format");
    }
}