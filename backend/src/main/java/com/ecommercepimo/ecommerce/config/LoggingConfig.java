package com.ecommercepimo.ecommerce.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.logstash.logback.encoder.LogstashEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Configuración para logging estructurado JSON
 */
@Configuration
public class LoggingConfig {

    /**
     * Configurar ObjectMapper para logging JSON
     */
    @Bean("loggingObjectMapper")
    public ObjectMapper loggingObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        return mapper;
    }

    /**
     * Configurar encoder Logstash para producción
     */
    @Bean
    @Profile("prod")
    public LogstashEncoder logstashEncoder() {
        LogstashEncoder encoder = new LogstashEncoder();
        encoder.setIncludeContext(true);
        encoder.setIncludeMdc(true);
        encoder.setCustomFields("{\"service\":\"ecommerce-api\",\"version\":\"1.0.0\"}");
        return encoder;
    }
}