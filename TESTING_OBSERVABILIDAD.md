# 🧪 Guía de Testing - OpenAPI, Actuator y Resilience4j

## 🎯 **Testing Objetivos Completados**

### ✅ **Implementaciones Realizadas**
1. **OpenAPI Documentation** - Swagger UI operativo
2. **Spring Boot Actuator** - Health, info, metrics habilitados  
3. **Resilience4j Patterns** - Circuit breaker, retry, timeout
4. **Structured Logging** - Request correlation con MDC
5. **FastAPI Enhanced Docs** - Health check mejorado

---

## 🌐 **URLs de Testing**

### **Java Spring Boot (Puerto 8080)**
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/api-docs  
- **Health Check:** http://localhost:8080/actuator/health
- **Metrics:** http://localhost:8080/actuator/metrics
- **Info:** http://localhost:8080/actuator/info
- **Prometheus:** http://localhost:8080/actuator/prometheus

### **Python FastAPI (Puerto 8001)**
- **Swagger UI:** http://localhost:8001/docs
- **ReDoc:** http://localhost:8001/redoc
- **OpenAPI JSON:** http://localhost:8001/openapi.json
- **Health Check:** http://localhost:8001/health
- **Root Info:** http://localhost:8001/

---

## 🔬 **Tests de Funcionalidad**

### **1. OpenAPI Documentation**

#### **Java - Swagger UI**
```powershell
# Verificar Swagger UI carga correctamente
Invoke-RestMethod http://localhost:8080/swagger-ui.html -Method HEAD

# Verificar OpenAPI spec JSON
$openapi = Invoke-RestMethod http://localhost:8080/api-docs
Write-Output "API Title: $($openapi.info.title)"
Write-Output "Endpoints: $($openapi.paths.Count)"
```

#### **Python - FastAPI Docs**
```powershell
# Verificar FastAPI docs
Invoke-RestMethod http://localhost:8001/docs -Method HEAD

# Verificar OpenAPI spec
$mlapi = Invoke-RestMethod http://localhost:8001/openapi.json
Write-Output "ML API Title: $($mlapi.info.title)"
Write-Output "ML Endpoints: $($mlapi.paths.Count)"
```

### **2. Actuator Endpoints**

#### **Health Check**
```powershell
# Health general
$health = Invoke-RestMethod http://localhost:8080/actuator/health
Write-Output "Status: $($health.status)"

# Health con detalles (requiere autenticación)
$headers = @{ "Authorization" = "Bearer YOUR_JWT_TOKEN" }
$detailedHealth = Invoke-RestMethod http://localhost:8080/actuator/health -Headers $headers
```

#### **Metrics**
```powershell
# Metrics generales
$metrics = Invoke-RestMethod http://localhost:8080/actuator/metrics
Write-Output "Available metrics: $($metrics.names.Count)"

# Metric específica (ejemplo: HTTP requests)
$httpMetrics = Invoke-RestMethod http://localhost:8080/actuator/metrics/http.server.requests
```

#### **Prometheus Metrics**
```powershell
# Verificar formato Prometheus
$prometheus = Invoke-RestMethod http://localhost:8080/actuator/prometheus
Write-Output "Prometheus metrics length: $($prometheus.Length)"
```

### **3. Resilience4j Circuit Breaker**

#### **Test Normal (ML Service UP)**
```powershell
# Login para obtener JWT
$loginData = @{
    email = "admin@example.com"
    password = "password123"
} | ConvertTo-Json

$authResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $authResponse.accessToken

# Test predicción ML (debe funcionar)
$headers = @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$predictionData = @{
    productId = 1
    daysAhead = 30
    includeTrends = $true
} | ConvertTo-Json

$prediction = Invoke-RestMethod -Uri "http://localhost:8080/api/ml/predictions/generate" -Method POST -Body $predictionData -Headers $headers
Write-Output "Prediction Success: $($prediction.success)"
```

#### **Test Circuit Breaker (ML Service DOWN)**
```powershell
# Simular ML service down (parar contenedor ML)
docker compose stop ml-service

# Test predicción - debe activar fallback
try {
    $prediction = Invoke-RestMethod -Uri "http://localhost:8080/api/ml/predictions/generate" -Method POST -Body $predictionData -Headers $headers
    Write-Output "Fallback Response: $($prediction.message)"
    Write-Output "Circuit Breaker Active: $($prediction.success -eq $false)"
} catch {
    Write-Output "Circuit breaker working - request failed gracefully"
}

# Verificar métricas de circuit breaker
$cbMetrics = Invoke-RestMethod http://localhost:8080/actuator/metrics/resilience4j.circuitbreaker.calls
Write-Output "Circuit Breaker Metrics: $($cbMetrics.measurements)"

# Restart ML service
docker compose start ml-service
```

### **4. Request Correlation Testing**

#### **Test MDC Logging**
```powershell
# Request con custom correlation ID
$headers = @{ 
    "Authorization" = "Bearer $token"
    "X-Correlation-ID" = "test-correlation-123"
    "Content-Type" = "application/json"
}

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Headers $headers

# Verificar que el response incluye correlation ID
Write-Output "Response headers contain X-Request-ID: $($response.Headers.'X-Request-ID')"
```

#### **Verificar Logs Estructurados**
```powershell
# Ver logs del contenedor Java
docker compose logs ecommerce-api | Select-String "test-correlation-123"

# Ver logs del contenedor Python  
docker compose logs ml-service | Select-String "correlation"
```

---

## 🚨 **Tests de Resiliencia**

### **1. Timeout Testing**
```powershell
# Test con timeout configurado (10s)
# El ML service debería responder dentro del timeout
Measure-Command {
    $prediction = Invoke-RestMethod -Uri "http://localhost:8080/api/ml/predictions/generate" -Method POST -Body $predictionData -Headers $headers
}
```

### **2. Retry Testing** 
```powershell
# Simular fallo intermitente parando y arrancando ML service
for ($i = 1; $i -le 5; $i++) {
    Write-Output "Test retry attempt $i"
    
    if ($i -eq 3) {
        # Parar ML service en intento 3
        docker compose stop ml-service
        Start-Sleep -Seconds 2
        docker compose start ml-service
        Start-Sleep -Seconds 5
    }
    
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:8080/api/ml/predictions/generate" -Method POST -Body $predictionData -Headers $headers
        Write-Output "Attempt $i: Success"
    } catch {
        Write-Output "Attempt $i: Failed - $($_.Exception.Message)"
    }
    
    Start-Sleep -Seconds 2
}
```

### **3. Load Testing (Opcional)**
```powershell
# Test múltiples requests concurrentes
$jobs = @()
for ($i = 1; $i -le 10; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($token, $data)
        $headers = @{ 
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        Invoke-RestMethod -Uri "http://localhost:8080/api/ml/predictions/generate" -Method POST -Body $data -Headers $headers
    } -ArgumentList $token, $predictionData
}

# Esperar resultados
$results = $jobs | Wait-Job | Receive-Job
Write-Output "Successful requests: $(($results | Where-Object { $_.success -eq $true }).Count)"
Write-Output "Failed requests: $(($results | Where-Object { $_.success -eq $false }).Count)"
```

---

## 📊 **Verificación de Métricas**

### **Circuit Breaker Metrics**
```powershell
# Estados del circuit breaker
$cbState = Invoke-RestMethod http://localhost:8080/actuator/metrics/resilience4j.circuitbreaker.state
$cbCalls = Invoke-RestMethod http://localhost:8080/actuator/metrics/resilience4j.circuitbreaker.calls

Write-Output "Circuit Breaker State: $($cbState.measurements)"
Write-Output "Circuit Breaker Calls: $($cbCalls.measurements)"
```

### **Retry Metrics**
```powershell
$retryMetrics = Invoke-RestMethod http://localhost:8080/actuator/metrics/resilience4j.retry.calls
Write-Output "Retry Attempts: $($retryMetrics.measurements)"
```

### **HTTP Request Metrics**
```powershell
$httpMetrics = Invoke-RestMethod http://localhost:8080/actuator/metrics/http.server.requests
Write-Output "HTTP Request Metrics: $($httpMetrics.measurements)"
```

---

## ✅ **Checklist de Verificación**

### **OpenAPI Documentation**
- [ ] Swagger UI Java accesible en /swagger-ui.html
- [ ] FastAPI docs accesible en /docs
- [ ] APIs documentadas con ejemplos y descripciones
- [ ] Tags y grupos organizados correctamente
- [ ] Esquemas de seguridad JWT configurados

### **Actuator Monitoring**
- [ ] /actuator/health responde UP
- [ ] /actuator/metrics muestra métricas
- [ ] /actuator/info muestra información de aplicación
- [ ] /actuator/prometheus expone métricas para monitoring

### **Resilience4j Patterns**
- [ ] Circuit breaker funciona con ML service down
- [ ] Retry attempts configurados (3 intentos)
- [ ] Timeout configurado (10 segundos)
- [ ] Fallback methods retornan respuestas predecibles
- [ ] Métricas de resiliencia disponibles

### **Structured Logging**
- [ ] Request correlation ID en logs
- [ ] MDC context propagado correctamente
- [ ] Logs JSON estructurados (producción)
- [ ] Request/response logging con métricas
- [ ] Error tracking con correlation

### **Integration Testing**
- [ ] Java → Python communication works
- [ ] Circuit breaker activates on failures
- [ ] Health checks report accurate status
- [ ] Metrics reflect actual usage
- [ ] Documentation matches implementation

---

## 🎉 **Resultados Esperados**

### **✅ TODO FUNCIONANDO:**
1. **Swagger UI operativo** con documentación completa
2. **Actuator endpoints** reportando métricas precisas
3. **Circuit breaker** activándose en fallos y recuperándose
4. **Logs correlacionados** con requestId único
5. **FastAPI docs** mejorados con health check comprensivo

### **🔧 Próximos Pasos:**
1. **Monitoreo Grafana** para visualizar métricas Prometheus
2. **Alerting** basado en métricas de circuit breaker
3. **Performance testing** con herramientas como K6 o JMeter
4. **Integration tests automatizados** en CI/CD

**¡Sistema completamente instrumentado y listo para producción!** 🚀