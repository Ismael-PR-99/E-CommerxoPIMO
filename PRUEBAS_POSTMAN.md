# 🧪 Pruebas Postman - JWT + CORS Seguro

## 📋 **Colección de Pruebas**

### **1. 🔐 Login con Refresh Tokens**

**Endpoint:** `POST http://localhost:8080/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Respuesta Esperada (200 OK):**
```json
{
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "expiresIn": 900000,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

### **2. 🔄 Refresh Token**

**Endpoint:** `POST http://localhost:8080/api/auth/refresh`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Respuesta Esperada (200 OK):**
```json
{
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "expiresIn": 900000,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

**Errores Esperados:**
- **401 Unauthorized** - Refresh token inválido o expirado

### **3. 🚪 Logout**

**Endpoint:** `POST http://localhost:8080/api/auth/logout`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Body (JSON - Opcional):**
```json
{
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Respuesta Esperada (200 OK):**
```json
{
  "message": "Logout exitoso"
}
```

### **4. 🛡️ Endpoint Protegido (ML)**

**Endpoint:** `POST http://localhost:8080/api/ml/predictions/generate`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Query Parameters:**
```
productId=1
daysAhead=30
```

**Respuesta Esperada:**
- **200 OK** - Con token válido y rol ADMIN
- **401 Unauthorized** - Sin token o token inválido
- **403 Forbidden** - Token válido pero sin rol ADMIN

### **5. 🌐 Prueba CORS - Navegador**

**JavaScript Console (localhost:5173):**
```javascript
// ✅ Origen Permitido
fetch('http://localhost:8080/api/products', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_token_here'
  }
})
.then(response => console.log('✅ CORS OK:', response.status))
.catch(error => console.log('❌ CORS Error:', error));
```

**JavaScript Console (origen no permitido):**
```javascript
// ❌ Origen Bloqueado (ej: localhost:4000)
fetch('http://localhost:8080/api/products', {
  method: 'GET',
  credentials: 'include'
})
.then(response => console.log('❌ No debería llegar aquí'))
.catch(error => console.log('✅ CORS bloqueado correctamente:', error));
```

---

## 🔍 **Validaciones por Realizar**

### **✅ JWT Funcionando**
1. Login retorna accessToken y refreshToken
2. Access token expira en tiempo configurado (15 min dev)
3. Refresh token funciona hasta expiración (7 días)
4. Refresh genera nuevos tokens (rotación)
5. Tokens inválidos son rechazados

### **✅ CORS Seguro**
1. Orígenes en lista blanca: **Permitidos** ✅
2. Orígenes fuera de lista: **Bloqueados** ❌
3. Credenciales funcionan con orígenes permitidos
4. Headers permitidos pasan, otros bloqueados
5. Métodos permitidos funcionan

### **✅ Seguridad**
1. Sin JWT secret hardcodeado en código
2. Variables de entorno requeridas
3. CORS no usa "*" en producción
4. Access tokens de corta duración
5. Refresh tokens rotan automáticamente

---

## 🚨 **Casos de Error a Probar**

### **JWT Errors**
```bash
# Token expirado
{"error": "invalid_token", "message": "Token expirado"}

# Token malformado  
{"error": "invalid_token", "message": "Token malformado"}

# Sin token
{"error": "unauthorized", "message": "Token requerido"}

# Refresh token inválido
{"error": "invalid_token", "message": "Refresh token inválido o expirado"}
```

### **CORS Errors (Browser Console)**
```
Access to fetch at 'http://localhost:8080/api/products' from origin 'http://localhost:4000' 
has been blocked by CORS policy: The request client is not a secure context and the resource 
requires a secure context.
```

### **Authorization Errors**
```bash
# Sin permisos suficientes
{"error": "forbidden", "message": "Acceso denegado"}

# Rol insuficiente
{"error": "insufficient_privileges", "message": "Requiere rol ADMIN"}
```

---

## ⚡ **Testing Automatizado**

### **cURL Scripts**

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  | jq '.accessToken'
```

**Test Endpoint Protegido:**
```bash
TOKEN="your_access_token_here"
curl -X POST "http://localhost:8080/api/ml/predictions/generate?productId=1&daysAhead=30" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Refresh Token:**
```bash
REFRESH_TOKEN="your_refresh_token_here"
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

---

## 📊 **Checklist Final**

### **Funcionalidad**
- [ ] Login genera access + refresh tokens
- [ ] Refresh rota ambos tokens
- [ ] Logout invalida tokens
- [ ] Endpoints protegidos validan JWT
- [ ] Tiempos de expiración correctos

### **Seguridad**
- [ ] CORS bloquea orígenes no permitidos
- [ ] No hay secrets hardcodeados
- [ ] Variables de entorno configuradas
- [ ] Headers de seguridad presentes
- [ ] Tokens seguros (no predecibles)

### **Configuración**
- [ ] .env.example documentado
- [ ] Configuración dev vs prod
- [ ] CORS lista blanca específica
- [ ] JWT secret desde variable entorno
- [ ] Logs de seguridad apropiados

**¡Todas las pruebas completadas indican configuración segura lista para producción!** ✅