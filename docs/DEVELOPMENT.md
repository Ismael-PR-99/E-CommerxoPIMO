# 🔧 Guía de Desarrollo - E-CommerxoPIMO

## 🚀 Quick Start

### Prerrequisitos

- **Java 17+** ☕
- **Node.js 18+** 📦
- **Python 3.11+** 🐍
- **Docker & Docker Compose** 🐳
- **Git** 📚

### Configuración Inicial

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/E-CommerxoPIMO.git
cd E-CommerxoPIMO

# Configurar hooks de pre-commit
pip install pre-commit
pre-commit install

# Copiar variables de entorno
cp backend/.env.example backend/.env
cp ml-service/.env.example ml-service/.env
cp frontend/.env.example frontend/.env

# Editar archivos .env con tus configuraciones
```

### Levantar el entorno completo

```bash
# Opción 1: Con Docker Compose (Recomendado)
docker-compose up -d

# Opción 2: Desarrollo local
./start.ps1
```

## 🏗️ Arquitectura del Proyecto

```
E-CommerxoPIMO/
├── backend/           # 🏛️ API REST (Spring Boot)
├── frontend/          # 💻 SPA (React + TypeScript)
├── ml-service/        # 🤖 ML API (FastAPI)
├── database/          # 🗄️ Scripts SQL
├── docker/            # 🐳 Configuración Docker
├── .github/workflows/ # ⚙️ CI/CD
└── docs/              # 📚 Documentación
```

## 🛠️ Herramientas de Desarrollo

### Pre-commit Hooks

Los hooks se ejecutan automáticamente antes de cada commit:

```yaml
# .pre-commit-config.yaml
- Java: Spotless (Google Java Format)
- Python: black, isort, flake8, mypy, bandit
- Validaciones: trailing-whitespace, end-of-file-fixer
```

### Quality Gates

#### Java/Maven
```bash
# Verificar formato
mvn spotless:check

# Aplicar formato
mvn spotless:apply

# Tests con coverage
mvn clean test jacoco:report

# Análisis de seguridad
mvn dependency-check:check
```

#### Python
```bash
# Formateo
black ml-service/
isort ml-service/

# Linting
flake8 ml-service/
mypy ml-service/

# Tests con coverage
pytest ml-service/tests/ --cov=ml-service/app --cov-report=html

# Análisis de seguridad
bandit -r ml-service/app/
safety check
```

#### Frontend
```bash
cd frontend

# Linting
npm run lint

# Tests
npm run test

# Build
npm run build
```

## 🔄 Workflow de Desarrollo

### 1. Feature Branch

```bash
# Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# Trabajar en la feature...
git add .
git commit -m "feat: añadir nueva funcionalidad"

# Pre-commit hooks se ejecutan automáticamente ✅
```

### 2. Pull Request

```bash
# Push a GitHub
git push origin feature/nueva-funcionalidad

# Crear PR en GitHub
# CI/CD se ejecuta automáticamente ⚙️
```

### 3. CI/CD Pipeline

El pipeline ejecuta automáticamente:

1. **Quality Checks** 🔍
   - Formato de código
   - Linting
   - Type checking

2. **Testing** 🧪
   - Unit tests
   - Integration tests
   - Coverage > 70%

3. **Security** 🔒
   - Dependency scanning
   - Code analysis
   - Vulnerability checks

4. **Build & Package** 📦
   - Docker images
   - Artifacts
   - Documentation

## 🧪 Testing

### Backend Testing

```java
// Ejemplo de test de integración
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class ProductControllerIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:13")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void shouldCreateProduct() {
        ProductRequest request = ProductRequest.builder()
            .name("Test Product")
            .price(BigDecimal.valueOf(99.99))
            .category("Electronics")
            .build();
            
        ResponseEntity<ProductResponse> response = restTemplate.postForEntity(
            "/api/products", request, ProductResponse.class);
            
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getName()).isEqualTo("Test Product");
    }
}
```

### ML Service Testing

```python
# tests/test_predictions.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_stock_prediction():
    payload = {
        "product_id": 1,
        "prediction_type": "stock",
        "horizon_days": 7,
        "include_confidence": True
    }
    
    response = client.post("/api/v1/predictions/generate", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert len(data["predictions"]) == 7
    assert all(p["confidence"] > 0 for p in data["predictions"])

@pytest.mark.asyncio
async def test_cache_integration():
    # Test que las predicciones se almacenan en cache
    payload = {"product_id": 1, "prediction_type": "stock", "horizon_days": 7}
    
    # Primera llamada - debe calcular
    response1 = client.post("/api/v1/predictions/generate", json=payload)
    
    # Segunda llamada - debe usar cache
    response2 = client.post("/api/v1/predictions/generate", json=payload)
    
    assert response1.json() == response2.json()
```

### Frontend Testing

```typescript
// src/components/__tests__/ProductList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { ProductList } from '../ProductList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('should display products', async () => {
  render(<ProductList />, { wrapper: createWrapper() });
  
  await waitFor(() => {
    expect(screen.getByText('iPhone 13')).toBeInTheDocument();
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
  });
});
```

## 🐳 Docker Development

### Development Compose

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      target: development
    volumes:
      - ./backend/src:/app/src
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - SPRING_DEVTOOLS_RESTART_ENABLED=true
    ports:
      - "8080:8080"
      - "5005:5005"  # Debug port
  
  ml-service:
    build:
      context: ./ml-service
      target: development
    volumes:
      - ./ml-service/app:/app/app
    environment:
      - PYTHONPATH=/app
      - RELOAD=true
    ports:
      - "8001:8001"
```

### Hot Reload Setup

```bash
# Backend con hot reload
cd backend
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"

# ML Service con auto-reload
cd ml-service
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Frontend con Vite
cd frontend
npm run dev
```

## 🔧 Configuración IDE

### VS Code

```json
// .vscode/settings.json
{
  "java.configuration.updateBuildConfiguration": "automatic",
  "java.format.settings.url": "https://raw.githubusercontent.com/google/styleguide/gh-pages/eclipse-java-google-style.xml",
  "python.defaultInterpreterPath": "./ml-service/.venv/bin/python",
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### IntelliJ IDEA

```xml
<!-- .idea/codeStyles/Project.xml -->
<component name="ProjectCodeStyleConfiguration">
  <code_scheme name="Project" version="173">
    <JavaCodeStyleSettings>
      <option name="IMPORT_LAYOUT_TABLE">
        <value>
          <package name="" withSubpackages="true" static="false" />
        </value>
      </option>
    </JavaCodeStyleSettings>
  </code_scheme>
</component>
```

## 📊 Debugging

### Backend Debugging

```java
// Configuración logback-spring.xml
<configuration>
    <springProfile name="dev">
        <logger name="com.ecommerce.backend" level="DEBUG"/>
        <logger name="org.springframework.web" level="DEBUG"/>
        <logger name="org.hibernate.SQL" level="DEBUG"/>
    </springProfile>
</configuration>
```

### ML Service Debugging

```python
# app/core/config.py
import logging

if settings.ENVIRONMENT == "development":
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Habilitar logs de SQL
    logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
```

### Frontend Debugging

```typescript
// src/utils/debug.ts
export const debugLogger = {
  api: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`🔍 API: ${message}`, data);
    }
  },
  store: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`🏪 Store: ${message}`, data);
    }
  }
};
```

## 🔍 Monitoring en Desarrollo

### Health Checks

```bash
# Verificar servicios
curl http://localhost:8080/actuator/health
curl http://localhost:8001/health
curl http://localhost:5173  # Frontend dev server
```

### Métricas

```bash
# Métricas de Spring Boot
curl http://localhost:8080/actuator/metrics

# Prometheus metrics (ML Service)
curl http://localhost:8001/metrics
```

### Logs

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f ml-service

# Logs con filtro
docker-compose logs -f | grep ERROR
```

## 🛡️ Security en Desarrollo

### Variables de Entorno

```bash
# backend/.env.example
DATABASE_URL=jdbc:postgresql://localhost:5432/ecommerce
DATABASE_USERNAME=ecommerce_user
DATABASE_PASSWORD=change_me_in_production
JWT_SECRET=your_jwt_secret_key_minimum_256_bits
REDIS_URL=redis://localhost:6379

# ml-service/.env.example
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
REDIS_URL=redis://localhost:6379
SECRET_KEY=your_secret_key_for_ml_service
ALGORITHM=HS256
```

### Secrets Management

```bash
# Usar docker secrets en producción
echo "super_secret_password" | docker secret create db_password -

# Referencia en docker-compose.yml
services:
  backend:
    secrets:
      - db_password
    environment:
      - DATABASE_PASSWORD_FILE=/run/secrets/db_password
```

## 📚 Documentación

### Generar Docs

```bash
# OpenAPI docs (Backend)
mvn spring-boot:run
# Acceder a http://localhost:8080/swagger-ui.html

# FastAPI docs (ML Service)
uvicorn app.main:app --reload
# Acceder a http://localhost:8001/docs

# Documentación del frontend
cd frontend
npm run build-storybook
```

### Contribuir

1. Fork del repositorio
2. Crear feature branch
3. Seguir convenciones de commit
4. Asegurar cobertura de tests > 70%
5. Actualizar documentación
6. Crear Pull Request

---

## 🤝 Support

- **Documentación**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/E-CommerxoPIMO/issues)
- **Wiki**: [GitHub Wiki](https://github.com/tu-usuario/E-CommerxoPIMO/wiki)

<div align="center">

**🚀 Happy Coding! 🚀**

</div>