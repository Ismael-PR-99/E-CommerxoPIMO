package com.ecommercepimo.ecommerce.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filtro para correlación de requests con MDC logging
 * Genera un requestId único para cada petición HTTP
 */
@Slf4j
@Component
@Order(1)
public class RequestCorrelationFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String REQUEST_ID_MDC_KEY = "requestId";
    private static final String USER_ID_MDC_KEY = "userId";
    private static final String METHOD_MDC_KEY = "method";
    private static final String URI_MDC_KEY = "uri";

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // Generar o usar requestId existente
            String requestId = getOrGenerateRequestId(request);
            
            // Configurar MDC
            setupMDC(request, requestId);
            
            // Agregar headers de respuesta
            response.setHeader(REQUEST_ID_HEADER, requestId);
            response.setHeader(CORRELATION_ID_HEADER, requestId);
            
            // Log inicio de request
            logRequestStart(request, requestId);
            
            long startTime = System.currentTimeMillis();
            
            // Continuar con la cadena de filtros
            filterChain.doFilter(request, response);
            
            // Log fin de request
            logRequestEnd(request, response, requestId, startTime);
            
        } finally {
            // Limpiar MDC al final
            MDC.clear();
        }
    }

    /**
     * Obtener requestId del header o generar uno nuevo
     */
    private String getOrGenerateRequestId(HttpServletRequest request) {
        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.trim().isEmpty()) {
            requestId = request.getHeader(CORRELATION_ID_HEADER);
        }
        if (requestId == null || requestId.trim().isEmpty()) {
            requestId = UUID.randomUUID().toString();
        }
        return requestId;
    }

    /**
     * Configurar MDC con información de contexto
     */
    private void setupMDC(HttpServletRequest request, String requestId) {
        MDC.put(REQUEST_ID_MDC_KEY, requestId);
        MDC.put(METHOD_MDC_KEY, request.getMethod());
        MDC.put(URI_MDC_KEY, request.getRequestURI());
        
        // Extraer userId si está disponible en headers o JWT
        String userId = extractUserId(request);
        if (userId != null) {
            MDC.put(USER_ID_MDC_KEY, userId);
        }
    }

    /**
     * Extraer userId del request (header o token JWT)
     */
    private String extractUserId(HttpServletRequest request) {
        // Intentar obtener del header primero
        String userId = request.getHeader("X-User-ID");
        if (userId != null && !userId.trim().isEmpty()) {
            return userId;
        }
        
        // TODO: Aquí se podría extraer del JWT token si está disponible
        // Por ahora retornamos null
        return null;
    }

    /**
     * Log inicio de request con información estructurada
     */
    private void logRequestStart(HttpServletRequest request, String requestId) {
        String clientIp = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");
        
        log.info("Request started - {} {} from {} - User-Agent: {}", 
                request.getMethod(), 
                request.getRequestURI(), 
                clientIp,
                userAgent);
    }

    /**
     * Log fin de request con métricas
     */
    private void logRequestEnd(HttpServletRequest request, 
                              HttpServletResponse response, 
                              String requestId, 
                              long startTime) {
        long duration = System.currentTimeMillis() - startTime;
        int status = response.getStatus();
        
        if (status >= 400) {
            log.warn("Request completed with error - {} {} - Status: {} - Duration: {}ms", 
                    request.getMethod(), 
                    request.getRequestURI(), 
                    status, 
                    duration);
        } else {
            log.info("Request completed successfully - {} {} - Status: {} - Duration: {}ms", 
                    request.getMethod(), 
                    request.getRequestURI(), 
                    status, 
                    duration);
        }
    }

    /**
     * Obtener IP real del cliente considerando proxies
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    /**
     * No aplicar filtro a endpoints estáticos y actuator
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        return path.startsWith("/actuator") || 
               path.startsWith("/static") || 
               path.startsWith("/webjars") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/api-docs");
    }
}