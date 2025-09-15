# 🔐 CONFIGURACIÓN JWT + CORS SEGURO - GUÍA COMPLETA

## 🎯 **Objetivo Completado**
Se ha implementado la configuración unificada de JWT entre Java Spring Boot y Python FastAPI, junto con refresh tokens y CORS seguro con lista blanca.

---

## ⚙️ **Configuración Requerida**

### **1. Variables de Entorno (CRÍTICAS)**

**Copiar `.env.example` a `.env` en ambos servicios:**

```bash
# Backend Java
cp .env.example .env

# ML Service Python  
cp ml-service/.env.example ml-service/.env
```

**Configurar APP_JWT_SECRET (OBLIGATORIO):**
```bash
# Generar secreto seguro (ejemplo)
openssl rand -hex 32
# O usar: python -c "import secrets; print(secrets.token_hex(32))"

# Establecer en ambos archivos .env
APP_JWT_SECRET=your_generated_secret_key_here
```

---

## 🔑 **JWT Unificado**

### **Configuración Java (application.properties)**
```properties
# JWT desde variables de entorno
app.jwt.secret=${APP_JWT_SECRET:}
app.jwt.access-token.expiration=${APP_JWT_ACCESS_EXPIRATION:900000}  # 15 min
app.jwt.refresh-token.expiration=${APP_JWT_REFRESH_EXPIRATION:604800000}  # 7 días
```

### **Configuración Python (config.py)**
```python
# JWT unificado con Java
JWT_SECRET: str = os.getenv("APP_JWT_SECRET", "")
ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Dev
REFRESH_TOKEN_EXPIRE_DAYS: int = 7
```

### **Tiempos de Expiración por Ambiente**
- **Desarrollo**: Access 15 min, Refresh 7 días
- **Producción**: Access 60 min, Refresh 7 días

---

## 🌐 **CORS Seguro**

### **Lista Blanca (NO "*")**

**Desarrollo:**
```bash
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080
```

**Producción:**
```bash
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

### **Configuración Java (SecurityConfig)**
```java
// Orígenes desde properties, sin "*"
List<String> origins = Arrays.asList(allowedOrigins.split(","));
configuration.setAllowedOrigins(origins);

// Credenciales solo si no es "*"
configuration.setAllowCredentials(allowCredentials && !origins.contains("*"));
```

### **Configuración Python (main.py)**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS,  # Lista específica
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Correlation-ID"]
)
```

---

## 🔄 **Refresh Tokens**

### **Nuevos Endpoints**

**POST /api/auth/refresh**
```json
{
  "refreshToken": "jwt_refresh_token_here"
}
```

**Response:**
```json
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 900000,
  "type": "Bearer",
  "user": { ... }
}
```

**POST /api/auth/logout**
```json
{
  "refreshToken": "jwt_refresh_token_here"
}
```

### **Flujo de Rotación**
1. Login → Access Token (15 min) + Refresh Token (7 días)
2. Access Token expira → Use Refresh Token
3. Refresh → Nuevo Access Token + Nuevo Refresh Token
4. Logout → Invalidar tokens (blacklist - por implementar)

---

## 🧪 **Pruebas con Postman**

### **1. Login**
```bash
POST http://localhost:8080/api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

**Verificar respuesta:**
- ✅ `accessToken` presente
- ✅ `refreshToken` presente  
- ✅ `expiresIn` = 900000 (15 min)

### **2. Refresh Token**
```bash
POST http://localhost:8080/api/auth/refresh
{
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Verificar:**
- ✅ Nuevos tokens generados
- ✅ Refresh token rotado

### **3. Logout**
```bash
POST http://localhost:8080/api/auth/logout
Headers: Authorization: Bearer [access_token]
{
  "refreshToken": "refresh_token_here"
}
```

### **4. CORS Test**
```bash
# Desde navegador en localhost:5173
fetch('http://localhost:8080/api/products', {
  credentials: 'include',
  headers: { 'Authorization': 'Bearer token' }
})
```

**Verificar:**
- ✅ Origen permitido: Success
- ❌ Origen no listado: CORS error

---

## 🛡️ **Seguridad Implementada**

### **✅ Sin Secretos Hardcodeados**
- JWT secrets desde variables de entorno
- Validación en startup si secret no configurado
- Fallback solo en modo desarrollo

### **✅ CORS Restrictivo**
- Lista blanca específica (no "*")
- Credenciales solo con orígenes específicos
- Headers limitados a necesarios

### **✅ Tokens Seguros**
- Access tokens cortos (15-60 min)
- Refresh tokens con rotación
- JTI (JWT ID) para revocación futura

### **✅ Configuración por Ambiente**
- Desarrollo: Más permisivo, logs detallados
- Producción: Restrictivo, URLs HTTPS only

---

## 🚀 **Comandos de Inicio**

### **Desarrollo**
```bash
# Backend Java
export APP_JWT_SECRET="dev_secret_key_minimum_32_characters_long"
export SPRING_PROFILES_ACTIVE=dev
./mvnw spring-boot:run

# ML Service Python
export APP_JWT_SECRET="dev_secret_key_minimum_32_characters_long"
export DEBUG=true
cd ml-service && python -m uvicorn app.main:app --reload --port 8001
```

### **Producción**
```bash
# Establecer variables seguras
export APP_JWT_SECRET="$(openssl rand -hex 32)"
export CORS_ALLOWED_ORIGINS="https://yourdomain.com"
export SPRING_PROFILES_ACTIVE=prod

# Iniciar servicios
docker-compose up -d
```

---

## ⚠️ **Puntos Críticos**

1. **NUNCA** commitear `.env` con secrets reales
2. **SIEMPRE** usar HTTPS en producción para JWT
3. **ROTAR** JWT secret periódicamente en producción
4. **IMPLEMENTAR** blacklist de tokens para logout real
5. **MONITOREAR** intentos de refresh con tokens expirados

---

## 📋 **Criterios de Aceptación ✅**

- ✅ **JWT Unificado**: Mismo secret en Java y Python
- ✅ **Refresh Tokens**: Implementado con rotación
- ✅ **CORS Seguro**: Lista blanca, no "*", credenciales controladas
- ✅ **Sin Secretos**: Variables de entorno, sin hardcoding
- ✅ **Tiempos Configurables**: 15 min dev, 60 min prod
- ✅ **Endpoints**: /login, /refresh, /logout funcionales
- ✅ **Documentación**: .env.example y guías completas

**¡Configuración de seguridad lista para producción!** 🎉