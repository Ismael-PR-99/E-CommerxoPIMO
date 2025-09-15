package com.ecommercepimo.ecommerce.client;

import com.ecommercepimo.ecommerce.dto.ml.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Configuración del cliente Feign para ML Service
 */
@Configuration
@Slf4j
public class MLServiceClientConfig {

    @Bean
    public ErrorDecoder errorDecoder() {
        return new MLServiceErrorDecoder();
    }

    /**
     * Decodificador de errores personalizado para ML Service
     */
    @RequiredArgsConstructor
    public static class MLServiceErrorDecoder implements ErrorDecoder {

        private final ObjectMapper objectMapper = new ObjectMapper();
        private final Default defaultErrorDecoder = new Default();

        @Override
        public Exception decode(String methodKey, Response response) {
            String correlationId = getCorrelationId(response);
            
            log.warn("ML Service error - Method: {}, Status: {}, CorrelationId: {}", 
                    methodKey, response.status(), correlationId);

            try {
                String responseBody = getResponseBody(response);
                
                ErrorResponse errorResponse = ErrorResponse.builder()
                        .success(false)
                        .timestamp(LocalDateTime.now())
                        .correlationId(correlationId)
                        .build();

                switch (response.status()) {
                    case 400:
                        errorResponse.setErrorCode("BAD_REQUEST");
                        errorResponse.setMessage("Datos de entrada inválidos");
                        break;
                    case 404:
                        errorResponse.setErrorCode("NOT_FOUND");
                        errorResponse.setMessage("Recurso no encontrado en ML Service");
                        break;
                    case 500:
                        errorResponse.setErrorCode("INTERNAL_SERVER_ERROR");
                        errorResponse.setMessage("Error interno en ML Service");
                        break;
                    case 503:
                        errorResponse.setErrorCode("SERVICE_UNAVAILABLE");
                        errorResponse.setMessage("ML Service temporalmente no disponible");
                        break;
                    default:
                        errorResponse.setErrorCode("UNKNOWN_ERROR");
                        errorResponse.setMessage("Error desconocido en ML Service");
                }

                // Intentar parsear el cuerpo de respuesta para más detalles
                if (responseBody != null && !responseBody.isEmpty()) {
                    try {
                        Map<String, Object> errorDetails = objectMapper.readValue(responseBody, Map.class);
                        errorResponse.setErrorDetails(errorDetails);
                    } catch (Exception e) {
                        Map<String, Object> errorDetails = new HashMap<>();
                        errorDetails.put("rawResponse", responseBody);
                        errorResponse.setErrorDetails(errorDetails);
                    }
                }

                return new MLServiceException(errorResponse);

            } catch (Exception e) {
                log.error("Error decoding ML Service response", e);
                return defaultErrorDecoder.decode(methodKey, response);
            }
        }

        private String getCorrelationId(Response response) {
            return response.headers().getOrDefault("X-Correlation-ID", 
                    response.headers().getOrDefault("x-correlation-id", 
                    java.util.List.of("unknown"))).iterator().next();
        }

        private String getResponseBody(Response response) {
            try {
                if (response.body() != null) {
                    byte[] bodyBytes = new byte[response.body().length()];
                    response.body().asInputStream().read(bodyBytes);
                    return new String(bodyBytes, StandardCharsets.UTF_8);
                }
            } catch (IOException e) {
                log.warn("Could not read response body", e);
            }
            return null;
        }
    }
}