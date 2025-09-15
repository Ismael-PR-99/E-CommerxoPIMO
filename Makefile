# Makefile para comandos de desarrollo y CI/CD

.PHONY: help install-dev format lint test test-cov clean build docker-build docker-run ci-backend ci-ml

# Variables
PYTHON := python3.11
PIP := pip
MAVEN := mvn
DOCKER := docker
DOCKER_COMPOSE := docker-compose

help: ## Mostrar esta ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Setup de desarrollo
install-dev: ## Instalar dependencias de desarrollo
	@echo "🔧 Instalando pre-commit hooks..."
	pip install pre-commit
	pre-commit install
	@echo "📦 Instalando dependencias Python..."
	cd ml-service && pip install -r requirements.txt -r requirements-dev.txt
	@echo "☕ Instalando dependencias Java..."
	cd backend && mvn dependency:resolve

# Formateo de código
format: ## Formatear código (Python + Java)
	@echo "🎨 Formateando código Python..."
	cd ml-service && black . && isort .
	@echo "☕ Formateando código Java..."
	cd backend && mvn spotless:apply

# Linting y análisis de código
lint: ## Ejecutar linting en todo el proyecto
	@echo "🔍 Linting Python..."
	cd ml-service && flake8 . && mypy app --ignore-missing-imports
	@echo "☕ Verificando formato Java..."
	cd backend && mvn spotless:check

# Tests
test: ## Ejecutar todos los tests
	@echo "🧪 Ejecutando tests Python..."
	cd ml-service && pytest -v
	@echo "☕ Ejecutando tests Java..."
	cd backend && mvn test

test-cov: ## Ejecutar tests con coverage
	@echo "📊 Tests con coverage Python..."
	cd ml-service && pytest --cov=app --cov-report=html --cov-report=term
	@echo "☕ Tests con coverage Java..."
	cd backend && mvn test jacoco:report

# Tests de integración
test-integration: ## Ejecutar tests de integración
	@echo "🔗 Tests de integración..."
	docker-compose -f docker/docker-compose.yml up -d postgres redis
	sleep 10
	cd ml-service && pytest tests/integration/ -v
	cd backend && mvn failsafe:integration-test
	docker-compose -f docker/docker-compose.yml down

# Seguridad
security: ## Análisis de seguridad
	@echo "🔒 Análisis de seguridad Python..."
	cd ml-service && safety check && bandit -r app
	@echo "☕ Análisis de seguridad Java..."
	cd backend && mvn org.owasp:dependency-check-maven:check

# Performance
performance: ## Tests de performance
	@echo "⚡ Tests de performance..."
	docker-compose -f docker/docker-compose.yml up -d
	sleep 30
	cd ml-service && locust -f tests/performance/locustfile.py --headless -u 50 -r 5 -t 60s --host http://localhost:8001
	docker-compose -f docker/docker-compose.yml down

# Limpieza
clean: ## Limpiar archivos temporales
	@echo "🧹 Limpiando archivos temporales..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	cd ml-service && rm -rf htmlcov/ .coverage .pytest_cache/
	cd backend && mvn clean

# Build
build: ## Construir el proyecto
	@echo "🏗️ Construyendo ML service..."
	cd ml-service && python -m build
	@echo "☕ Construyendo backend..."
	cd backend && mvn package -DskipTests

# Docker
docker-build: ## Construir imágenes Docker
	@echo "🐳 Construyendo imágenes Docker..."
	cd backend && docker build -t ecommerce-backend:latest .
	cd ml-service && docker build -t ecommerce-ml-service:latest .

docker-run: ## Ejecutar servicios con Docker Compose
	@echo "🐳 Iniciando servicios..."
	docker-compose -f docker/docker-compose.yml up -d

docker-stop: ## Parar servicios Docker
	@echo "🛑 Parando servicios..."
	docker-compose -f docker/docker-compose.yml down

docker-logs: ## Ver logs de servicios
	@echo "📝 Logs de servicios..."
	docker-compose -f docker/docker-compose.yml logs -f

# CI/CD
ci-backend: ## Pipeline CI para backend
	@echo "🚀 CI Backend..."
	cd backend && mvn spotless:check compile test jacoco:report

ci-ml: ## Pipeline CI para ML service
	@echo "🚀 CI ML Service..."
	cd ml-service && black --check . && isort --check-only . && flake8 . && pytest --cov=app

ci-full: lint test security ## Pipeline CI completo
	@echo "✅ CI completo finalizado"

# Desarrollo local
dev-setup: install-dev ## Setup completo de desarrollo
	@echo "🏁 Copiando archivos de configuración..."
	cp .env.example .env
	cp backend/.env.example backend/.env
	cp ml-service/.env.example ml-service/.env
	@echo "🐳 Iniciando base de datos..."
	docker-compose -f docker/docker-compose.yml up -d postgres redis
	@echo "⏳ Esperando a que la BD esté lista..."
	sleep 10
	@echo "📊 Ejecutando migraciones..."
	cd backend && mvn flyway:migrate
	@echo "✅ Setup de desarrollo completado!"

dev-run: ## Ejecutar servicios en modo desarrollo
	@echo "🚀 Iniciando servicios en modo desarrollo..."
	docker-compose -f docker/docker-compose.yml up -d postgres redis
	@echo "Servicios disponibles:"
	@echo "- Backend: http://localhost:8080"
	@echo "- ML Service: http://localhost:8001"
	@echo "- Frontend: http://localhost:3000"

# Release
tag: ## Crear tag de release
	@read -p "Versión (ej: v1.0.0): " version; \
	git tag -a $$version -m "Release $$version"; \
	git push origin $$version

# Monitoring
monitor: ## Iniciar stack de monitoring
	@echo "📊 Iniciando monitoring..."
	docker-compose -f docker/docker-compose.optimized.yml up -d prometheus grafana
	@echo "Monitoring disponible en:"
	@echo "- Prometheus: http://localhost:9090"
	@echo "- Grafana: http://localhost:3001"