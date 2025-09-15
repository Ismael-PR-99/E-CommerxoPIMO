# 🐳 Docker Setup - E-Commerce PIMO

## 🚀 **Inicio Rápido**

### **1. Configurar Variables de Entorno**
```bash
# Copiar archivo de configuración
cp .env.docker .env

# Editar variables críticas
nano .env  # Cambiar APP_JWT_SECRET especialmente
```

### **2. Levantar Servicios - Desarrollo**
```bash
# Levantar todos los servicios en modo desarrollo
docker compose --profile dev up --build -d

# Ver logs en tiempo real
docker compose logs -f

# Solo servicios backend (sin frontend)
docker compose up postgres redis ml-service ecommerce-api --build -d
```

### **3. Levantar Servicios - Producción**
```bash
# Usar configuración de producción
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up --build -d
```

---

## 🎯 **Servicios y Puertos**

| Servicio | Puerto Host | Puerto Container | Descripción |
|----------|-------------|------------------|-------------|
| **PostgreSQL** | 5432 | 5432 | Base de datos principal |
| **Redis** | 6379 | 6379 | Cache y sesiones |
| **ML Service** | 8001 | 8001 | FastAPI - Predicciones ML |
| **ecommerce-api** | 8080 | 8080 | Spring Boot - API Principal |
| **Frontend** | 3000 | 80 | React/Vite (dev only) |

---

## 🔗 **URLs de Acceso**

### **Desarrollo**
- **Frontend:** http://localhost:3000
- **API Backend:** http://localhost:8080/api
- **ML Service:** http://localhost:8001
- **Swagger ML:** http://localhost:8001/docs
- **Health Backend:** http://localhost:8080/actuator/health

### **Comunicación Interna** (nombres de servicios)
- **ecommerce-api → ml-service:** `http://ml-service:8001`
- **ml-service → postgres:** `postgresql://postgres:5432/ecommerce_db`
- **Servicios → redis:** `redis://redis:6379`

---

## ⚙️ **Configuración Personalizada**

### **Variables de Entorno Clave**
```bash
# JWT Secret (CRÍTICO - cambiar en producción)
APP_JWT_SECRET=your-super-secret-jwt-key-change-in-production-256-bits-long

# Base de datos
POSTGRES_DB=ecommerce_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password123

# Puertos
ML_SERVICE_PORT=8001
BACKEND_PORT=8080

# CORS orígenes permitidos
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
```

### **Profiles Disponibles**
- **dev:** Servicios de desarrollo con hot reload
- **prod:** Configuración optimizada para producción

---

## 🏥 **Health Checks**

Todos los servicios tienen health checks configurados:

```bash
# Verificar estado de todos los servicios
docker compose ps

# Ver health check específico
docker inspect ecommerce-postgres --format='{{.State.Health.Status}}'
docker inspect ecommerce-ml-service --format='{{.State.Health.Status}}'
docker inspect ecommerce-api --format='{{.State.Health.Status}}'
```

---

## 🐛 **Debugging y Troubleshooting**

### **Ver Logs por Servicio**
```bash
# Logs del backend Java
docker compose logs -f ecommerce-api

# Logs del ML service Python
docker compose logs -f ml-service

# Logs de la base de datos
docker compose logs -f postgres

# Todos los logs
docker compose logs -f
```

### **Conectar a Contenedores**
```bash
# Conectar a postgres
docker compose exec postgres psql -U postgres -d ecommerce_db

# Conectar a redis
docker compose exec redis redis-cli

# Shell en ml-service
docker compose exec ml-service bash

# Shell en ecommerce-api
docker compose exec ecommerce-api bash
```

### **Verificar Conectividad Entre Servicios**
```bash
# Desde ecommerce-api verificar ml-service
docker compose exec ecommerce-api curl http://ml-service:8001/health

# Desde ml-service verificar postgres
docker compose exec ml-service python -c "
import psycopg2
conn = psycopg2.connect('postgresql://postgres:password123@postgres:5432/ecommerce_db')
print('✅ Postgres conectado')
"

# Verificar Redis desde cualquier servicio
docker compose exec ml-service python -c "
import redis
r = redis.Redis(host='redis', port=6379)
r.ping()
print('✅ Redis conectado')
"
```

---

## 🛠️ **Comandos Útiles**

### **Administración de Contenedores**
```bash
# Parar todos los servicios
docker compose down

# Parar y limpiar volúmenes
docker compose down -v

# Rebuild forzado
docker compose build --no-cache

# Restart servicio específico
docker compose restart ml-service

# Escalar servicios (solo en prod)
docker compose up --scale ml-service=2 -d
```

### **Limpieza**
```bash
# Limpiar imágenes no usadas
docker image prune -f

# Limpiar todo (¡CUIDADO!)
docker system prune -a --volumes

# Ver uso de espacio
docker system df
```

---

## 📊 **Verificación de Funcionamiento**

### **Test de Conectividad**
```bash
# 1. Verificar que todos los servicios están up
docker compose ps

# 2. Test health endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:8001/health

# 3. Test comunicación Java → Python
curl -X POST "http://localhost:8080/api/ml/predictions/generate?productId=1&daysAhead=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Test Base de Datos**
```bash
# Conectar y verificar tablas
docker compose exec postgres psql -U postgres -d ecommerce_db -c "\dt"
```

### **Test Redis**
```bash
# Verificar Redis funcionando
docker compose exec redis redis-cli ping
```

---

## 🔒 **Consideraciones de Seguridad**

### **Para Producción**
1. **Cambiar APP_JWT_SECRET** a valor seguro generado
2. **Configurar CORS_ORIGINS** con dominios específicos
3. **Usar docker-compose.prod.yml** para configuración optimizada
4. **NO exponer puertos de postgres/redis** al host en producción
5. **Configurar SSL/TLS** para endpoints públicos

### **Generar JWT Secret Seguro**
```bash
# Opción 1: OpenSSL
openssl rand -hex 32

# Opción 2: Python
python -c "import secrets; print(secrets.token_hex(32))"

# Opción 3: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ **Checklist de Deployment**

### **Desarrollo**
- [ ] `.env` configurado con valores de desarrollo
- [ ] `docker compose --profile dev up --build -d` ejecutado sin errores
- [ ] Todos los health checks pasan (verde en `docker compose ps`)
- [ ] Frontend accesible en http://localhost:3000
- [ ] API accesible en http://localhost:8080/api
- [ ] ML service accesible en http://localhost:8001

### **Producción**
- [ ] Variables de entorno de producción configuradas
- [ ] JWT secret único y seguro
- [ ] CORS configurado con dominios específicos
- [ ] SSL certificates configurados
- [ ] Recursos limitados apropiadamente
- [ ] Backup y monitoreo configurados

**¡Tu stack completo Docker está listo para funcionar!** 🎉