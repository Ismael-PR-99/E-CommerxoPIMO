# E-CommerxoPIMO - Sistema de Gestión de Inventario Inteligente

## Descripción
Sistema de gestión de inventario inteligente para e-commerce con arquitectura de microservicios que incluye análisis predictivo y recomendaciones basadas en machine learning.

## Tecnologías Utilizadas
- **Frontend**: React con TypeScript, Vite, Tailwind CSS
- **Backend**: Spring Boot (Java 17)
- **Microservicio IA**: Python (FastAPI)
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT
- **Contenedorización**: Docker

## Estructura del Proyecto
```
ecommerce-system/
├── frontend/             # Aplicación React + TypeScript
├── backend/              # API REST con Spring Boot
├── ml-service/           # Microservicio de IA con FastAPI
├── database/             # Scripts SQL para PostgreSQL
├── docker/               # Configuración de Docker
└── README.md
```

## Funcionalidades Principales
- Dashboard con métricas de ventas e inventario
- Catálogo de productos con filtros avanzados
- Carrito de compras
- Panel de administración completo
- Análisis predictivo de stock
- Recomendaciones personalizadas de productos
- Autenticación y autorización basada en JWT

## Instalación y Configuración

### Requisitos previos
- Node.js 18+
- Java 17
- Python 3.11+
- Docker y Docker Compose
- Maven
- PostgreSQL

### Instalación

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### Microservicio de IA
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Base de datos y Docker
```bash
docker-compose up -d
```

## Acceso a la aplicación
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Microservicio IA: http://localhost:8000
- Documentación API Backend: http://localhost:8080/swagger-ui.html
- Documentación API ML: http://localhost:8000/docs

## Entornos
- Desarrollo: Variables de entorno en `.env.development`
- Producción: Variables de entorno en `.env.production`

## Contribución
Para contribuir al proyecto, por favor revisa nuestra guía de contribución en CONTRIBUTING.md.

## Licencia
Este proyecto está licenciado bajo MIT License - ver el archivo LICENSE.md para más detalles.