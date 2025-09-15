# 🛒 E-CommerxoPIMO - Sistema E-commerce con ML

[![Backend CI](https://github.com/Ismael-PR-99/E-CommerxoPIMO/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Ismael-PR-99/E-CommerxoPIMO/actions/workflows/backend-ci.yml)
[![ML Service CI](https://github.com/Ismael-PR-99/E-CommerxoPIMO/actions/workflows/ml-service-ci.yml/badge.svg)](https://github.com/Ismael-PR-99/E-CommerxoPIMO/actions/workflows/ml-service-ci.yml)
[![codecov](https://codecov.io/gh/Ismael-PR-99/E-CommerxoPIMO/branch/main/graph/badge.svg)](https://codecov.io/gh/Ismael-PR-99/E-CommerxoPIMO)

## 📋 Descripción del Proyecto

**E-CommerxoPIMO** es un sistema completo de e-commerce empresarial con capacidades de Machine Learning que incluye:

- 🏪 **Tienda frontend** React + TypeScript + Tailwind CSS
- ⚙️ **Panel de administración** con analytics y gestión completa  
- 🚀 **Backend API REST** Spring Boot + PostgreSQL
- 🤖 **Microservicio ML** FastAPI con predicciones y recomendaciones
- � **Sistema de cache** Redis para optimización
- � **Containerización** Docker + Docker Compose
- 📈 **Monitoring** Prometheus + Grafana
- � **CI/CD** GitHub Actions + Pre-commit hooks

---

## 🏗️ Arquitectura del Proyecto

```
E-CommerxoPIMO/
├── frontend/                 # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas y rutas
│   │   ├── store/           # Estado global (Zustand)
│   │   └── services/        # APIs y servicios
│   └── package.json
├── backend/                  # Spring Boot + PostgreSQL
│   ├── src/main/java/       # Código fuente Java
│   ├── src/test/            # Tests unitarios e integración
│   └── pom.xml              # Dependencias Maven
├── ml-service/               # FastAPI + Scikit-learn + Redis
│   ├── app/                 # Código fuente Python
│   │   ├── api/             # Endpoints REST
│   │   ├── models/          # Modelos ML
│   │   └── db/              # Conexión base de datos
│   ├── tests/               # Tests pytest
│   └── requirements.txt
├── database/                 # Scripts SQL PostgreSQL
├── docker/                   # Configuración Docker
├── .github/workflows/        # CI/CD GitHub Actions
└── .pre-commit-config.yaml   # Hooks de calidad
```

---

## 🚀 Inicio Rápido

### 📋 Prerrequisitos

- **Node.js** 18+ & **npm**
- **Java** 17+ & **Maven** 3.8+
- **Python** 3.11+ & **pip**
- **Docker** & **Docker Compose**
- **Git**

### ⚡ Setup Automático

```bash
# 1. Clonar repositorio
git clone https://github.com/Ismael-PR-99/E-CommerxoPIMO.git
cd E-CommerxoPIMO

# 2. Setup completo de desarrollo (incluye BD, deps, migraciones)
make dev-setup

# 3. Ejecutar servicios en desarrollo
make dev-run
```

### 🌐 URLs de Servicios

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Aplicación React |
| Backend API | http://localhost:8080 | API REST Spring Boot |
| ML Service | http://localhost:8001 | Microservicio ML |
| Admin Panel | http://localhost:3000/admin | Panel administrativo |
| API Docs | http://localhost:8001/docs | Documentación FastAPI |
| Prometheus | http://localhost:9090 | Métricas |
| Grafana | http://localhost:3001 | Dashboards |

---

## �️ Desarrollo

### 🎨 Formateo y Linting

```bash
# Formatear todo el código
make format

# Ejecutar linting
make lint

# Instalar pre-commit hooks
make install-dev
```

### 🧪 Testing

```bash
# Tests unitarios
make test

# Tests con coverage
make test-cov

# Tests de integración  
make test-integration

# Tests de performance
make performance
```

### 🔒 Análisis de Seguridad

```bash
# Análisis de vulnerabilidades
make security

# OWASP dependency check (Java)
cd backend && mvn org.owasp:dependency-check-maven:check

# Bandit + Safety (Python)
cd ml-service && bandit -r app && safety check
```

---

## 🌍 Variables de Entorno

### Backend (.env)
```bash
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USERNAME=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400

# ML Service
ML_SERVICE_URL=http://localhost:8001
```

### ML Service (.env)
```bash
# Base de datos
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecommerce

# Redis
REDIS_URL=redis://localhost:6379/0

# ML Configuración
MODEL_CACHE_TTL=3600
PREDICTION_CACHE_TTL=1800
RECOMMENDATION_CACHE_TTL=900

# API Keys (opcional)
OPENAI_API_KEY=your_openai_key
```

### Frontend (.env)
```bash
# API URLs
VITE_API_URL=http://localhost:8080/api
VITE_ML_API_URL=http://localhost:8001/api/v1

# Environment
VITE_ENVIRONMENT=development
```

---

## 📚 Documentación Técnica

### 🔄 Pipeline CI/CD

#### GitHub Actions
- **Backend CI**: Maven build, tests, Spotless format check, security scan
- **ML Service CI**: pytest, black/isort format, mypy type check, safety scan
- **Triggers**: Push/PR a main/develop en rutas específicas
- **Artifacts**: Test reports, coverage, security reports

#### Pre-commit Hooks
```bash
# Instalar hooks
pre-commit install

# Ejecutar manualmente
pre-commit run --all-files

# Hooks configurados:
# - trailing-whitespace, end-of-file-fixer
# - Python: black, isort, flake8, mypy, bandit
# - Java: Spotless format check
# - Docker: hadolint
# - Secrets: detect-secrets
```

### 🧪 Testing Strategy

#### Backend (Java)
```bash
# Tests unitarios
mvn test

# Tests de integración
mvn failsafe:integration-test

# Coverage report
mvn jacoco:report

# Ubicación: target/site/jacoco/index.html
```

#### ML Service (Python)
```bash
# Tests con pytest
pytest -v

# Coverage
pytest --cov=app --cov-report=html

# Tests por categoría
pytest -m unit        # Solo unitarios
pytest -m integration # Solo integración
pytest -m ml          # Solo ML
```

### 📊 Monitoring y Observabilidad

#### Métricas Disponibles
- **Application metrics**: Spring Boot Actuator + FastAPI metrics
- **Infrastructure metrics**: Prometheus + Node Exporter
- **Custom metrics**: ML model performance, prediction accuracy
- **Dashboards**: Grafana con alertas configuradas

#### Logs Centralizados
```bash
# Ver logs en desarrollo
make docker-logs

# Logs estructurados con nivel configurable
# Backend: Logback (JSON format)
# ML Service: Python logging (structured)
```

---

## 🚀 Despliegue

### 🐳 Docker Production

```bash
# Build y deploy completo
docker-compose -f docker/docker-compose.yml up -d

# Solo servicios core
docker-compose -f docker/docker-compose.yml up -d postgres redis backend ml-service

# Con monitoring
docker-compose -f docker/docker-compose.optimized.yml up -d
```

### ⚙️ Variables de Producción

#### Obligatorias
```bash
# Security
JWT_SECRET=<strong-random-secret>
DB_PASSWORD=<secure-database-password>

# External services
REDIS_PASSWORD=<redis-password>
SMTP_PASSWORD=<email-service-password>

# ML Service
MODEL_API_KEY=<external-ml-api-key>
```

#### Opcionales
```bash
# Monitoring
PROMETHEUS_RETENTION=30d
GRAFANA_ADMIN_PASSWORD=<grafana-password>

# Performance
DB_POOL_SIZE=20
REDIS_POOL_SIZE=10
ML_WORKER_THREADS=4
```

---

## 🛠️ Comandos de Desarrollo

### 📋 Makefile Completo

```bash
# Setup inicial
make dev-setup          # Configuración completa de desarrollo
make install-dev         # Solo dependencias e hooks

# Desarrollo diario
make format             # Formatear código (Python + Java)
make lint               # Linting completo
make test               # Tests rápidos
make test-cov           # Tests con coverage

# CI/CD local
make ci-backend         # Pipeline backend completo
make ci-ml              # Pipeline ML service completo
make ci-full            # Pipeline completo + security

# Docker
make docker-build       # Construir imágenes
make docker-run         # Ejecutar stack completo
make docker-stop        # Parar servicios
make docker-logs        # Ver logs

# Utilidades
make clean              # Limpiar archivos temporales
make security           # Análisis de seguridad
make performance        # Tests de performance
make monitor            # Iniciar stack de monitoring
```

---

## 🤝 Contribución

### 📝 Convenciones

#### Commits (Conventional Commits)
```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización documentación
style: cambios de formato
refactor: refactorización sin cambios funcionales
test: agregar o modificar tests
chore: tareas de mantenimiento
```

#### Branches
```bash
main        # Producción
develop     # Desarrollo
feature/*   # Nuevas funcionalidades
hotfix/*    # Correcciones urgentes
release/*   # Preparación de releases
```

#### Pull Requests
1. **Pre-requisitos**: Todos los checks CI deben pasar
2. **Review**: Al menos 1 aprobación requerida
3. **Tests**: Coverage mínimo 80%
4. **Format**: Pre-commit hooks deben pasar

### 🔧 Setup de Contribuidor

```bash
# 1. Fork del repositorio
# 2. Clonar tu fork
git clone https://github.com/TU-USUARIO/E-CommerxoPIMO.git

# 3. Setup de desarrollo
make dev-setup

# 4. Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# 5. Desarrollar con commits convencionales
git commit -m "feat: agregar endpoint de recomendaciones ML"

# 6. Push y crear PR
git push origin feature/nueva-funcionalidad
```

---

## 📞 Soporte y Contacto

### 🐛 Reportar Issues
- **Bugs**: Usar template de bug report
- **Features**: Usar template de feature request
- **Security**: Enviar email privado a security@ecommercepimo.com

### 📖 Recursos Adicionales
- [Documentación API](http://localhost:8080/swagger-ui.html)
- [ML API Docs](http://localhost:8001/docs)
- [Wiki del Proyecto](https://github.com/Ismael-PR-99/E-CommerxoPIMO/wiki)
- [Roadmap](https://github.com/Ismael-PR-99/E-CommerxoPIMO/projects/1)

### 👥 Equipo de Desarrollo
- **Maintainer**: [@Ismael-PR-99](https://github.com/Ismael-PR-99)
- **Contributors**: Ver [CONTRIBUTORS.md](CONTRIBUTORS.md)

---

## 📄 Licencia

Este proyecto está licenciado bajo la [MIT License](LICENSE).

---

<div align="center">

**⭐ Si este proyecto te resultó útil, ¡considera darle una estrella! ⭐**

[🐛 Reportar Bug](https://github.com/Ismael-PR-99/E-CommerxoPIMO/issues/new?template=bug_report.md) • 
[💡 Solicitar Feature](https://github.com/Ismael-PR-99/E-CommerxoPIMO/issues/new?template=feature_request.md) • 
[📖 Documentación](https://github.com/Ismael-PR-99/E-CommerxoPIMO/wiki)

</div>
```

**¡LISTO! El sistema está funcionando.**

---

## 🖥️ Comandos de Terminal - GUÍA COMPLETA

### 📦 Comandos Principales del Frontend
```bash
# Navegar al directorio
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Ejecutar en desarrollo (COMANDO PRINCIPAL)
npm run dev

# Ejecutar con acceso desde red local
npm run dev -- --host 0.0.0.0

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Linter de código
npm run lint

# Ejecutar tests
npm run test
```

### 🔧 Comandos de Solución de Problemas
```bash
# Si hay problemas con dependencias
rm -rf node_modules package-lock.json
npm install

# Si el puerto está ocupado
npm run dev -- --port 3000

# Limpiar caché
npm run dev -- --force

# Ver logs detallados
npm run dev -- --debug
```

---

## 🗄️ Base de Datos - Estado Actual

El backend usará **PostgreSQL** como base de datos principal:
- ✅ Scripts y migraciones en `database/postgresql/`
- ✅ Integración con Spring Boot y JPA/Hibernate
- ✅ Docker para levantar la base de datos fácilmente

### 📋 Instalación rápida de PostgreSQL con Docker

```bash
# Desde el directorio docker/
docker-compose up -d
```

---

## 🎯 Funcionalidades DETALLADAS

### 🛒 **Tienda Externa** (`http://localhost:5173/store`)
```
✅ Catálogo de productos con imágenes
✅ Filtros por categoría (Electrónicos, Ropa, Hogar, etc.)
✅ Búsqueda en tiempo real
✅ Carrito de compras interactivo
✅ Sistema de checkout simulado
✅ Control de stock automático
✅ Productos agotados (❌ Agotado)
✅ Validación de stock antes de compra
✅ Persistencia del carrito
```

### ⚙️ **Panel de Administración** (`http://localhost:5173/admin/products`)
```
✅ Dashboard con estadísticas en tiempo real
✅ Gestión completa de productos (Crear, Editar, Eliminar)
✅ Alertas de stock bajo (≤10 unidades)
✅ Búsqueda y filtros avanzados
✅ Cálculo automático de valor de inventario
✅ Interfaz moderna tema blanco/negro
✅ Formularios validados
✅ Responsive design
```

### 🔄 **Sincronización en Tiempo Real**
```
✅ Estado compartido entre tienda y admin
✅ Actualizaciones instantáneas de stock
✅ Persistencia automática en localStorage
✅ Logs detallados para debugging
```

---

## 🧪 CÓMO PROBAR TODO - Guía Paso a Paso

### 1. 🚀 **Iniciar el Sistema**
```bash
cd frontend
npm run dev
```
Resultado: Servidor en http://localhost:5173

### 2. 🛒 **Probar la Tienda**
1. Ir a: **http://localhost:5173/store**
2. Navegar por productos
3. Usar filtros de categoría
4. Buscar productos por nombre
5. Agregar al carrito
6. Cambiar cantidades en el carrito
7. Hacer checkout
8. ✅ **Verificar que el stock baja**

### 3. ⚙️ **Probar el Admin**
1. Ir a: **http://localhost:5173/admin/products**
2. Ver estadísticas actualizadas
3. Crear un nuevo producto
4. Editar productos existentes
5. ✅ **Verificar stock en tiempo real**

### 4. 🔄 **Probar Sincronización**
1. **Abrir ambas páginas** en pestañas separadas:
   - Pestaña 1: Tienda
   - Pestaña 2: Admin
2. **Comprar en la tienda**
3. **Cambiar a la pestaña admin**
4. ✅ **Ver cómo se actualiza automáticamente**

---

## 🛠️ Herramientas de Debug INCLUIDAS

### 🔍 **Botones de Prueba Rápida**
- **Tienda**: Botón azul "🔍 Test Stock" - Reduce stock del primer producto
- **Admin**: Botón azul "🔍 Debug Stock" - Muestra estado actual

### 📊 **Logs en Consola** (Abrir F12)
```javascript
// Cuando actualizas stock:
🔄 Attempting to update stock for product ID: 1, reducing by: 2
📦 Product before update: {id: 1, name: "Laptop Dell XPS 13", stock: 15}
📦 Product after update: {id: 1, name: "Laptop Dell XPS 13", stock: 13}
✅ Stock update completed

// En la tienda:
🛒 Store - Products updated: 6 products

// En el admin:
🏪 Admin - Products updated: 6 products
```

---

## 🎨 Tecnologías y Dependencias

### 🖼️ **Frontend (Funcionando al 100%)**
```json
{
  "react": "^18.2.0",           // Framework principal
  "typescript": "^5.2.2",       // Tipado estático
  "vite": "^5.4.19",           // Build tool super rápido
  "react-router-dom": "^6.19.0", // Navegación
  "zustand": "^4.5.7",         // Estado global + persistencia
  "react-dom": "^18.2.0"       // Renderizado
}
```

### 🔧 **Herramientas de Desarrollo**
```json
{
  "@vitejs/plugin-react": "^4.2.1",  // Plugin React para Vite
  "@typescript-eslint/*": "^7.2.0",   // Linting TypeScript
  "eslint": "^8.57.0"                 // Linter de código
}
```

---

## 🚨 Solución de Problemas COMUNES

### ❌ **Puerto 5173 ocupado**
```bash
# Solución 1: Usar otro puerto
npm run dev -- --port 3000

# Solución 2: Matar procesos
# Windows:
taskkill /F /IM node.exe
# Linux/Mac:
killall node
```

### ❌ **"Cannot find module" o errores de dependencias**
```bash
# Limpiar todo y reinstalar
rm -rf node_modules
rm package-lock.json
npm install
```

### ❌ **Stock no se actualiza entre páginas**
```bash
# 1. Abrir DevTools (F12)
# 2. Ir a Application > Local Storage
# 3. Eliminar "ecommerce-storage"
# 4. Recargar páginas
```

### ❌ **Error de TypeScript**
```bash
# Verificar errores
npx tsc --noEmit

# Si persiste, reinstalar tipos
npm install @types/react @types/react-dom --save-dev
```

### ❌ **Página en blanco**
```bash
# 1. Verificar consola (F12)
# 2. Verificar que el servidor esté corriendo
# 3. Ir directamente a: http://localhost:5173
```

---

## 📁 Estructura de Archivos IMPORTANTE

### 🎯 **Archivos Clave que NO debes tocar**
```
frontend/
├── src/store/useStore.ts        # ⚠️ Estado global - CRÍTICO
├── src/App.tsx                  # ⚠️ Router principal
├── package.json                 # ⚠️ Dependencias
└── vite.config.ts              # ⚠️ Configuración servidor
```

### 🎨 **Archivos que SÍ puedes modificar**
```
frontend/src/
├── pages/Store.tsx              # ✅ Tienda externa
├── pages/admin/CleanProductManagement.tsx  # ✅ Admin
├── components/                  # ✅ Componentes
└── types/index.ts              # ✅ Tipos TypeScript
```

---

## 🌐 URLs del Sistema

| Página | URL | Descripción |
|--------|-----|-------------|
| 🏠 **Principal** | `http://localhost:5173` | Dashboard principal |
| 🛒 **Tienda** | `http://localhost:5173/store` | Tienda para clientes |
| ⚙️ **Admin Productos** | `http://localhost:5173/admin/products` | Gestión de productos |
| 🏢 **Dashboard Admin** | `http://localhost:5173/admin` | Panel de administración |

---

## 📞 Soporte y Contacto

### 👨‍💻 **Desarrollador Principal**
- **GitHub**: [@Ismael-PR-99](https://github.com/Ismael-PR-99)
- **Repositorio**: [E-CommerxoPIMO](https://github.com/Ismael-PR-99/E-CommerxoPIMO)

### 🆘 **Si tienes problemas:**
1. **Revisar esta guía** (90% de problemas están aquí)
2. **Abrir DevTools (F12)** y revisar errores en consola
3. **Verificar que el servidor esté corriendo** (`npm run dev`)
4. **Limpiar caché** del navegador (Ctrl+F5)

---

## 🔄 Estado del Proyecto (Julio 2025)

| Componente            | Estado         | Funcionalidad                       |
|-----------------------|---------------|-------------------------------------|
| 🖼️ Frontend React     | ✅ COMPLETO    | Tienda + Admin funcionando al 100%  |
| 💾 Persistencia       | ✅ COMPLETO    | Zustand + localStorage              |
| 🛒 Carrito de Compras | ✅ COMPLETO    | Funcional con validaciones          |
| 📦 Control de Stock   | ✅ COMPLETO    | Tiempo real + persistencia          |
| 🌐 Backend Spring Boot| 🚧 EN DESARROLLO| API REST + PostgreSQL (en progreso) |
| 🗄️ Base de Datos Real | ✅ EN USO      | PostgreSQL + migraciones            |
```