# 📦 Instalación y Setup Docker - E-Commerce PIMO

## 🎯 **Prerequisitos**

### **1. Instalar Docker Desktop**
1. Descargar desde: https://www.docker.com/products/docker-desktop
2. Ejecutar el instalador y seguir las instrucciones
3. Reiniciar el sistema si es necesario
4. Verificar instalación: `docker --version`

### **2. Configurar Docker Desktop**
- **Memoria:** Mínimo 4GB, recomendado 8GB
- **CPU:** Mínimo 2 cores, recomendado 4 cores
- **Disk Space:** Mínimo 20GB libres

---

## 🚀 **Inicio Automático**

```powershell
# Ejecutar script automático
.\docker-start.ps1
```

---

## 🛠️ **Inicio Manual**

### **1. Configurar Variables de Entorno**
```powershell
# Copiar configuración
Copy-Item .env.docker .env

# IMPORTANTE: Editar .env y cambiar APP_JWT_SECRET
notepad .env
```

### **2. Levantar Servicios por Pasos**
```powershell
# Paso 1: Base de datos y cache
docker compose up postgres redis -d --build

# Paso 2: Esperar que postgres esté listo (30 segundos)
docker compose logs postgres

# Paso 3: Servicios de aplicación
docker compose up ml-service ecommerce-api -d --build

# Paso 4: Frontend (opcional para dev)
docker compose --profile dev up frontend-dev -d --build
```

### **3. Verificar Estado**
```powershell
# Ver todos los servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de servicio específico
docker compose logs -f ecommerce-api
docker compose logs -f ml-service
```

---

## 🏥 **Health Checks y Verificación**

### **URLs de Verificación**
```powershell
# Backend API Health
Invoke-RestMethod http://localhost:8080/actuator/health

# ML Service Health  
Invoke-RestMethod http://localhost:8001/health

# Frontend (si está levantado)
# http://localhost:3000
```

### **Verificar Conectividad Entre Servicios**
```powershell
# Java puede llamar a Python
docker compose exec ecommerce-api curl http://ml-service:8001/health

# Python puede conectar a Postgres
docker compose exec ml-service python -c "
import psycopg2
conn = psycopg2.connect('postgresql://postgres:password123@postgres:5432/ecommerce_db')
print('✅ Postgres OK')
"

# Redis funciona
docker compose exec redis redis-cli ping
```

---

## 🐛 **Troubleshooting**

### **Problemas Comunes**

#### **1. Puerto ya en uso**
```powershell
# Ver qué usa el puerto
netstat -ano | findstr :8080
netstat -ano | findstr :8001

# Cambiar puertos en .env si es necesario
BACKEND_PORT=8081
ML_SERVICE_PORT=8002
```

#### **2. Servicios no inician**
```powershell
# Ver logs de error
docker compose logs ecommerce-api
docker compose logs ml-service

# Verificar configuración
docker compose config

# Rebuild forzado
docker compose build --no-cache
docker compose up -d --force-recreate
```

#### **3. Base de datos no conecta**
```powershell
# Verificar postgres está corriendo
docker compose ps postgres

# Ver logs de postgres
docker compose logs postgres

# Conectar manualmente
docker compose exec postgres psql -U postgres -d ecommerce_db
```

#### **4. JWT Secret no configurado**
```powershell
# Verificar .env tiene APP_JWT_SECRET configurado
Get-Content .env | Select-String "APP_JWT_SECRET"

# Generar nuevo secret si es necesario
[System.Web.Security.Membership]::GeneratePassword(64, 0)
```

---

## 📊 **Comandos de Administración**

### **Gestión de Servicios**
```powershell
# Parar todos
docker compose down

# Parar y limpiar volúmenes (¡CUIDADO! Borra datos)
docker compose down -v

# Restart servicio específico  
docker compose restart ml-service

# Escalar servicios
docker compose up --scale ml-service=2 -d
```

### **Limpieza**
```powershell
# Limpiar imágenes no usadas
docker image prune -f

# Ver uso de espacio
docker system df

# Limpieza completa (¡CUIDADO!)
docker system prune -a --volumes
```

### **Debugging**
```powershell
# Conectar a contenedor
docker compose exec ecommerce-api bash
docker compose exec ml-service bash

# Ver procesos en contenedor
docker compose exec ecommerce-api ps aux

# Ver configuración efectiva
docker compose exec ecommerce-api env | grep JWT
docker compose exec ml-service env | grep DATABASE
```

---

## 🔒 **Seguridad y Producción**

### **Antes de Deploy en Producción**
1. **Cambiar APP_JWT_SECRET** por valor único y seguro
2. **Configurar CORS_ORIGINS** con dominios específicos
3. **Usar docker-compose.prod.yml** 
4. **Configurar SSL/HTTPS**
5. **Setup monitoreo y logs**

### **Generar JWT Secret Seguro**
```powershell
# Opción 1: PowerShell
[System.Web.Security.Membership]::GeneratePassword(64, 0)

# Opción 2: OpenSSL (si está instalado)
openssl rand -hex 32

# Opción 3: Python (si está instalado)
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## ✅ **Checklist Post-Instalación**

### **Verificaciones Básicas**
- [ ] Docker Desktop instalado y corriendo
- [ ] `docker --version` funciona
- [ ] `.env` configurado con valores apropiados
- [ ] `APP_JWT_SECRET` cambiado del valor por defecto
- [ ] `docker compose ps` muestra todos los servicios como "healthy"

### **Verificaciones Funcionales**
- [ ] http://localhost:8080/actuator/health responde OK
- [ ] http://localhost:8001/health responde OK
- [ ] http://localhost:8001/docs muestra Swagger
- [ ] Logs no muestran errores críticos
- [ ] Java puede llamar a Python (verificar con logs)

### **Verificaciones de Conectividad**
- [ ] Postgres accesible desde servicios
- [ ] Redis accesible desde ML service
- [ ] ecommerce-api puede llamar a ml-service
- [ ] Frontend puede llamar a backend (si está levantado)

**¡Tu entorno Docker está listo para desarrollo!** 🎉

---

## 📚 **Documentación Adicional**
- `DOCKER_SETUP.md` - Guía detallada de uso
- `CONFIGURACION_SEGURIDAD.md` - Configuración JWT y CORS
- `PRUEBAS_POSTMAN.md` - Testing de APIs
- `.env.docker` - Plantilla de variables de entorno