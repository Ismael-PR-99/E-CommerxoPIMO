package com.ecommercepimo.ecommerce.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuración OpenAPI para documentación automática de APIs
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${spring.application.name:ecommerce-api}")
    private String applicationName;

    /**
     * Configuración principal de OpenAPI
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(createApiInfo())
                .servers(createServers())
                .addSecurityItem(createSecurityRequirement())
                .components(new io.swagger.v3.oas.models.Components()
                    .addSecuritySchemes("bearerAuth", createSecurityScheme())
                )
                .tags(createTags());
    }

    /**
     * Información de la API
     */
    private Info createApiInfo() {
        return new Info()
                .title("E-Commerce PIMO API")
                .description("""
                    API REST central para sistema e-commerce con integración ML
                    
                    ## Características:
                    - ✅ Autenticación JWT con refresh tokens
                    - ✅ CRUD completo de productos, usuarios y pedidos
                    - ✅ Integración con microservicio ML para predicciones
                    - ✅ Patrones de resiliencia (Circuit Breaker, Retry, Timeout)
                    - ✅ Logging correlacionado con requestId
                    - ✅ Monitoreo con Actuator y métricas Prometheus
                    
                    ## Seguridad:
                    Todas las APIs (excepto login/register) requieren token JWT en header:
                    `Authorization: Bearer <token>`
                    
                    ## Testing:
                    1. Login en `/api/auth/login` para obtener tokens
                    2. Usar accessToken en header Authorization
                    3. Renovar con refreshToken en `/api/auth/refresh`
                    """)
                .version("1.0.0")
                .contact(new Contact()
                    .name("E-Commerce PIMO Team")
                    .email("team@ecommercepimo.com")
                    .url("https://github.com/Ismael-PR-99/E-CommerxoPIMO"))
                .license(new License()
                    .name("MIT License")
                    .url("https://opensource.org/licenses/MIT"));
    }

    /**
     * Servidores disponibles
     */
    private List<Server> createServers() {
        return List.of(
            new Server()
                .url("http://localhost:" + serverPort)
                .description("Desarrollo Local"),
            new Server()
                .url("http://localhost:8080")
                .description("Docker Local"),
            new Server()
                .url("https://api.ecommercepimo.com")
                .description("Producción")
        );
    }

    /**
     * Requerimiento de seguridad JWT
     */
    private SecurityRequirement createSecurityRequirement() {
        return new SecurityRequirement().addList("bearerAuth");
    }

    /**
     * Esquema de seguridad Bearer JWT
     */
    private SecurityScheme createSecurityScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Token JWT obtenido del endpoint /api/auth/login");
    }

    /**
     * Tags para organizar endpoints
     */
    private List<Tag> createTags() {
        return List.of(
            new Tag().name("🔐 Autenticación").description("Login, registro, refresh tokens y logout"),
            new Tag().name("👤 Usuarios").description("Gestión de usuarios y perfiles"),
            new Tag().name("📦 Productos").description("CRUD de productos y categorías"),
            new Tag().name("🛒 Pedidos").description("Gestión de carritos, pedidos y facturación"),
            new Tag().name("🤖 ML Integration").description("Predicciones y recomendaciones con IA"),
            new Tag().name("📊 Analytics").description("Métricas, reportes y estadísticas"),
            new Tag().name("⚙️ Administración").description("Configuración y gestión del sistema")
        );
    }

    /**
     * Grupo de APIs públicas (sin autenticación)
     */
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("01-publicas")
                .displayName("🌐 APIs Públicas")
                .pathsToMatch("/api/auth/**", "/api/public/**")
                .build();
    }

    /**
     * Grupo de APIs de usuarios
     */
    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("02-usuarios")
                .displayName("👤 APIs de Usuarios")
                .pathsToMatch("/api/users/**", "/api/profile/**")
                .build();
    }

    /**
     * Grupo de APIs de productos
     */
    @Bean
    public GroupedOpenApi productApi() {
        return GroupedOpenApi.builder()
                .group("03-productos")
                .displayName("📦 APIs de Productos")
                .pathsToMatch("/api/products/**", "/api/categories/**")
                .build();
    }

    /**
     * Grupo de APIs de pedidos
     */
    @Bean
    public GroupedOpenApi orderApi() {
        return GroupedOpenApi.builder()
                .group("04-pedidos")
                .displayName("🛒 APIs de Pedidos")
                .pathsToMatch("/api/orders/**", "/api/cart/**")
                .build();
    }

    /**
     * Grupo de APIs de ML
     */
    @Bean
    public GroupedOpenApi mlApi() {
        return GroupedOpenApi.builder()
                .group("05-ml")
                .displayName("🤖 APIs de ML")
                .pathsToMatch("/api/ml/**")
                .build();
    }

    /**
     * Grupo de APIs de administración
     */
    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("06-admin")
                .displayName("⚙️ APIs de Admin")
                .pathsToMatch("/api/admin/**", "/actuator/**")
                .build();
    }
}