# 📖 API Playbook - E-CommerxoPIMO

[![Backend API](https://img.shields.io/badge/Backend-Spring%20Boot-brightgreen)](http://localhost:8080/swagger-ui.html)
[![ML API](https://img.shields.io/badge/ML%20Service-FastAPI-blue)](http://localhost:8001/docs)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange)]()

## 🎯 Descripción General

Este documento proporciona una guía completa para interactuar con las APIs del sistema E-CommerxoPIMO, incluyendo el backend Spring Boot y el microservicio ML FastAPI.

### 🌐 Servicios Disponibles

| Servicio | URL Base | Documentación | Descripción |
|----------|----------|---------------|-------------|
| **Backend API** | `http://localhost:8080/api` | [Swagger UI](http://localhost:8080/swagger-ui.html) | API REST principal para e-commerce |
| **ML Service** | `http://localhost:8001/api/v1` | [FastAPI Docs](http://localhost:8001/docs) | Microservicio de Machine Learning |

---

## 🔐 Autenticación

### JWT Bearer Token

Todos los endpoints protegidos requieren un token JWT en el header:

```http
Authorization: Bearer <your-jwt-token>
```

### 🚀 Obtener Token de Acceso

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "miPassword123!"
}
```

**Response exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
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
```

**Errores comunes:**
```json
// 401 - Credenciales incorrectas
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Credenciales inválidas",
  "path": "/api/auth/login"
}

// 423 - Cuenta bloqueada
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 423,
  "error": "Locked",
  "message": "Cuenta bloqueada por múltiples intentos fallidos",
  "path": "/api/auth/login"
}
```

---

## 🛍️ Gestión de Productos

### 📋 Listar Productos

**Endpoint:** `GET /api/products`

**Parámetros de consulta:**
- `page` (int): Número de página (default: 0)
- `size` (int): Elementos por página (default: 20, max: 100)
- `sort` (string): Campo de ordenamiento (ej: "name,asc", "price,desc")

**Request:**
```http
GET /api/products?page=0&size=10&sort=name,asc
```

**Response exitosa (200):**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Laptop Gaming ROG",
      "description": "Laptop para gaming de alta gama con RTX 4070",
      "price": 1299.99,
      "stock": 15,
      "category": "Electrónicos",
      "imageUrl": "/images/laptop-rog.jpg",
      "active": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pageable": {
    "page": 0,
    "size": 10,
    "sort": "name,asc"
  },
  "totalElements": 150,
  "totalPages": 15,
  "first": true,
  "last": false
}
```

### 🔍 Buscar Productos

**Endpoint:** `GET /api/products/search`

**Parámetros:**
- `q` (string, requerido): Término de búsqueda

**Request:**
```http
GET /api/products/search?q=laptop&page=0&size=5
```

### 🏷️ Productos por Categoría

**Endpoint:** `GET /api/products/category/{category}`

**Request:**
```http
GET /api/products/category/Electrónicos?page=0&size=20
```

### 💰 Filtrar por Precio

**Endpoint:** `GET /api/products/filter`

**Parámetros:**
- `minPrice` (decimal, requerido): Precio mínimo
- `maxPrice` (decimal, requerido): Precio máximo

**Request:**
```http
GET /api/products/filter?minPrice=100.00&maxPrice=2000.00
```

### 🆔 Obtener Producto por ID

**Endpoint:** `GET /api/products/{id}`

**Request:**
```http
GET /api/products/123
```

**Response exitosa (200):**
```json
{
  "id": 123,
  "name": "Laptop Gaming ROG",
  "description": "Laptop para gaming de alta gama con RTX 4070",
  "price": 1299.99,
  "stock": 15,
  "category": "Electrónicos",
  "imageUrl": "/images/laptop-rog.jpg",
  "active": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "specifications": {
    "processor": "Intel i7-12700H",
    "memory": "16GB DDR5",
    "storage": "1TB SSD NVMe"
  }
}
```

**Errores comunes:**
```json
// 404 - Producto no encontrado
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Producto con ID 999 no encontrado",
  "path": "/api/products/999"
}

// 400 - ID inválido
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "ID debe ser un número positivo",
  "path": "/api/products/abc"
}
```

---

## 🔮 Predicciones ML

### 📊 Generar Predicción

**Endpoint:** `POST /api/v1/predictions/generate`

**Request:**
```json
{
  "product_id": 123,
  "prediction_type": "stock",
  "horizon_days": 30,
  "include_confidence": true,
  "include_factors": false
}
```

**Tipos de predicción disponibles:**
- `stock`: Niveles de inventario futuro
- `demand`: Demanda esperada 
- `price`: Precios óptimos
- `sales`: Proyecciones de ventas

**Response exitosa (200):**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "product_id": 123,
  "prediction_type": "stock",
  "horizon_days": 30,
  "predictions": [
    {
      "date": "2024-01-16T00:00:00Z",
      "value": 85.5,
      "confidence_lower": 78.2,
      "confidence_upper": 92.8
    },
    {
      "date": "2024-01-17T00:00:00Z", 
      "value": 83.1,
      "confidence_lower": 75.8,
      "confidence_upper": 90.4
    }
  ],
  "model_used": "RandomForestRegressor",
  "accuracy_score": 0.89,
  "cache_hit": false,
  "processing_time_ms": 245
}
```

**Errores comunes:**
```json
// 404 - Producto no encontrado
{
  "success": false,
  "timestamp": "2024-01-15T10:30:00Z",
  "message": "Producto no encontrado",
  "error_code": "PRODUCT_NOT_FOUND",
  "error_details": {
    "product_id": 999,
    "reason": "Producto no existe o está inactivo"
  }
}

// 400 - Parámetros inválidos
{
  "success": false,
  "timestamp": "2024-01-15T10:30:00Z",
  "message": "Parámetros inválidos",
  "error_code": "INVALID_PARAMETERS",
  "error_details": {
    "horizon_days": "Debe estar entre 1 y 365"
  }
}
```

---

## 🎯 Recomendaciones ML

### 🤖 Generar Recomendaciones

**Endpoint:** `POST /api/v1/recommendations/generate`

**Request:**
```json
{
  "user_id": 123,
  "product_id": null,
  "recommendation_type": "hybrid",
  "max_results": 10,
  "min_score": 0.1,
  "exclude_owned": true,
  "include_metadata": true
}
```

**Tipos de recomendación:**
- `collaborative`: Filtrado colaborativo (usuarios similares)
- `content`: Basado en contenido del producto
- `hybrid`: Combinación de algoritmos (recomendado)
- `trending`: Productos populares

**Response exitosa (200):**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "user_id": 123,
  "recommendation_type": "hybrid",
  "recommendations": [
    {
      "product_id": 456,
      "score": 0.89,
      "rank": 1,
      "reasoning": "Algoritmo híbrido: Collaborative, Trending",
      "metadata": {
        "name": "Smartphone Galaxy S24",
        "price": 999.99,
        "category": "Electrónicos",
        "stock_level": 25,
        "avg_rating": 4.7
      }
    },
    {
      "product_id": 789,
      "score": 0.76,
      "rank": 2,
      "reasoning": "Usuarios similares también compraron",
      "metadata": {
        "name": "Auriculares Sony WH-1000XM5",
        "price": 299.99,
        "category": "Audio",
        "stock_level": 12,
        "avg_rating": 4.8
      }
    }
  ],
  "algorithm_used": "hybrid_algorithm",
  "total_considered": 1250,
  "cache_hit": false
}
```

### 👤 Recomendaciones por Usuario

**Endpoint:** `GET /api/v1/recommendations/user/{user_id}`

**Request:**
```http
GET /api/v1/recommendations/user/123?recommendation_type=hybrid&max_results=5
```

### 📱 Productos Similares

**Endpoint:** `GET /api/v1/recommendations/product/{product_id}/similar`

**Request:**
```http
GET /api/v1/recommendations/product/123/similar?max_results=10
```

### 📈 Productos Trending

**Endpoint:** `GET /api/v1/recommendations/trending`

**Request:**
```http
GET /api/v1/recommendations/trending?max_results=20&days=7
```

---

## 🛒 Gestión de Pedidos

### 📋 Crear Pedido

**Endpoint:** `POST /api/orders`
**Requiere autenticación**

**Request:**
```json
{
  "items": [
    {
      "productId": 123,
      "quantity": 2,
      "price": 1299.99
    },
    {
      "productId": 456,
      "quantity": 1,
      "price": 299.99
    }
  ],
  "shippingAddress": {
    "street": "Calle Principal 123",
    "city": "Madrid",
    "state": "Madrid",
    "zipCode": "28001",
    "country": "España"
  },
  "paymentMethod": "CREDIT_CARD"
}
```

**Response exitosa (201):**
```json
{
  "id": 789,
  "userId": 123,
  "status": "PENDING",
  "total": 2899.97,
  "createdAt": "2024-01-15T10:30:00Z",
  "items": [
    {
      "productId": 123,
      "productName": "Laptop Gaming ROG",
      "quantity": 2,
      "unitPrice": 1299.99,
      "totalPrice": 2599.98
    }
  ],
  "shippingAddress": {
    "street": "Calle Principal 123",
    "city": "Madrid",
    "state": "Madrid",
    "zipCode": "28001",
    "country": "España"
  }
}
```

### 📄 Obtener Pedidos del Usuario

**Endpoint:** `GET /api/orders/user/{userId}`
**Requiere autenticación**

**Request:**
```http
GET /api/orders/user/123?page=0&size=10
```

---

## 👥 Gestión de Usuarios

### 📝 Registro de Usuario

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "miPassword123!",
  "firstName": "Ana",
  "lastName": "García",
  "phone": "+34123456789",
  "acceptTerms": true
}
```

**Response exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 124,
    "email": "nuevo@ejemplo.com",
    "firstName": "Ana",
    "lastName": "García",
    "role": "USER"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "def502001a8f...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

**Errores comunes:**
```json
// 409 - Email ya registrado
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "El email nuevo@ejemplo.com ya está registrado",
  "path": "/api/auth/register"
}

// 400 - Validación fallida
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "validationErrors": {
    "email": "Email debe tener formato válido",
    "password": "Password debe tener al menos 8 caracteres"
  }
}
```

---

## 📊 Códigos de Estado HTTP

### ✅ Códigos de Éxito

| Código | Significado | Uso |
|--------|-------------|-----|
| `200` | OK | Operación exitosa |
| `201` | Created | Recurso creado exitosamente |
| `204` | No Content | Operación exitosa sin contenido |

### ⚠️ Códigos de Error del Cliente

| Código | Significado | Descripción |
|--------|-------------|-------------|
| `400` | Bad Request | Datos inválidos o malformados |
| `401` | Unauthorized | Token ausente o inválido |
| `403` | Forbidden | Sin permisos para la operación |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto con el estado actual |
| `422` | Unprocessable Entity | Error de validación de datos |
| `429` | Too Many Requests | Límite de tasa excedido |

### 🔥 Códigos de Error del Servidor

| Código | Significado | Descripción |
|--------|-------------|-------------|
| `500` | Internal Server Error | Error interno del servidor |
| `502` | Bad Gateway | Error del gateway/proxy |
| `503` | Service Unavailable | Servicio temporalmente no disponible |
| `504` | Gateway Timeout | Timeout del gateway |

---

## 🚀 Rate Limiting

### 📊 Límites por Servicio

| Servicio | Límite | Ventana | Header |
|----------|--------|---------|--------|
| **Backend API** | 100 req/min | 60 segundos | `X-RateLimit-Remaining` |
| **ML Service** | 50 req/min | 60 segundos | `X-RateLimit-Remaining` |
| **Auth Endpoints** | 10 req/min | 60 segundos | `X-RateLimit-Remaining` |

### 📈 Headers de Rate Limiting

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642089600
Retry-After: 30
```

### 429 Response

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 30 seconds",
  "path": "/api/products",
  "retryAfter": 30
}
```

---

## 🔧 Cache y Performance

### ⚡ Cache Headers

Las respuestas incluyen headers de cache para optimización:

```http
Cache-Control: public, max-age=300
ETag: "abc123def456"
Last-Modified: Tue, 15 Jan 2024 10:30:00 GMT
```

### 🎯 Cache en ML Service

- **Predicciones**: TTL 30 minutos
- **Recomendaciones**: TTL 15 minutos  
- **Trending Products**: TTL 5 minutos

### 💨 Invalidación de Cache

**Endpoint:** `DELETE /api/v1/recommendations/cache/user/{user_id}`

```http
DELETE /api/v1/recommendations/cache/user/123
```

**Response:**
```json
{
  "success": true,
  "message": "Cache de recomendaciones invalidado para usuario 123",
  "deleted_entries": 5
}
```

---

## 🛠️ Testing con cURL

### 🔐 Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "miPassword123!"
  }'
```

### 📋 Listar Productos
```bash
curl -X GET "http://localhost:8080/api/products?page=0&size=5" \
  -H "Accept: application/json"
```

### 🔮 Predicción ML
```bash
curl -X POST http://localhost:8001/api/v1/predictions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 123,
    "prediction_type": "stock",
    "horizon_days": 30,
    "include_confidence": true
  }'
```

### 🎯 Recomendaciones
```bash
curl -X POST http://localhost:8001/api/v1/recommendations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123,
    "recommendation_type": "hybrid",
    "max_results": 5,
    "include_metadata": true
  }'
```

---

## 🔍 Troubleshooting

### 🐛 Errores Comunes

#### 1. **Token Expirado**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 401,
  "error": "Unauthorized", 
  "message": "JWT token has expired"
}
```
**Solución:** Usar el refresh token o hacer login nuevamente.

#### 2. **Producto Sin Datos ML**
```json
{
  "success": false,
  "error_code": "INSUFFICIENT_DATA",
  "message": "No hay suficientes datos históricos para predicción"
}
```
**Solución:** El producto necesita al menos 30 días de datos de ventas.

#### 3. **Cache Redis No Disponible**
```json
{
  "success": true,
  "message": "Predicción generada (cache offline)",
  "cache_hit": false
}
```
**Solución:** Verificar conectividad con Redis. El sistema funciona sin cache.

### 📊 Métricas de Salud

**Health Check Backend:** `GET /actuator/health`
**Health Check ML:** `GET /health`

---

## 📞 Soporte

### 🔗 Enlaces Útiles

- **Swagger Backend**: http://localhost:8080/swagger-ui.html
- **FastAPI Docs**: http://localhost:8001/docs
- **Redoc ML**: http://localhost:8001/redoc
- **Actuator Metrics**: http://localhost:8080/actuator
- **GitHub Repository**: https://github.com/Ismael-PR-99/E-CommerxoPIMO

### 📧 Contacto

- **Bugs/Issues**: [GitHub Issues](https://github.com/Ismael-PR-99/E-CommerxoPIMO/issues)
- **Documentación**: [Wiki](https://github.com/Ismael-PR-99/E-CommerxoPIMO/wiki)
- **Email**: dev@ecommercepimo.com

---

<div align="center">

**⭐ Si esta documentación te fue útil, ¡dale una estrella al repo! ⭐**

[🐛 Reportar Issue](https://github.com/Ismael-PR-99/E-CommerxoPIMO/issues/new) • 
[📖 Wiki](https://github.com/Ismael-PR-99/E-CommerxoPIMO/wiki) • 
[🤝 Contribuir](https://github.com/Ismael-PR-99/E-CommerxoPIMO/blob/main/CONTRIBUTING.md)

</div>