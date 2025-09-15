#!/bin/bash

# Script para ejecutar todos los tests y generar reportes de cobertura
# Usage: ./run-tests.sh [unit|integration|all]

set -e

TEST_TYPE=${1:-all}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🧪 Ejecutando tests para E-Commerce PIMO"
echo "📁 Directorio del proyecto: $PROJECT_DIR"
echo "🎯 Tipo de test: $TEST_TYPE"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_section() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar prerequisitos
check_prerequisites() {
    print_section "Verificando prerequisitos"
    
    # Java
    if ! command -v java &> /dev/null; then
        print_error "Java no está instalado"
        exit 1
    fi
    print_success "Java: $(java -version 2>&1 | head -n 1)"
    
    # Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 no está instalado"
        exit 1
    fi
    print_success "Python: $(python3 --version)"
    
    # Maven
    if ! command -v mvn &> /dev/null; then
        print_error "Maven no está instalado"
        exit 1
    fi
    print_success "Maven: $(mvn --version | head -n 1)"
    
    # Docker (opcional)
    if command -v docker &> /dev/null; then
        print_success "Docker: $(docker --version)"
    else
        print_warning "Docker no está disponible (tests de integración pueden fallar)"
    fi
}

# Tests unitarios Backend Java
run_backend_unit_tests() {
    print_section "Tests Unitarios Backend (Java)"
    
    cd "$PROJECT_DIR/backend"
    
    print_warning "Ejecutando tests unitarios Maven..."
    ./mvnw clean test -Dspring.profiles.active=test
    
    print_warning "Generando reporte de cobertura..."
    ./mvnw jacoco:report
    
    # Verificar cobertura mínima
    COVERAGE_THRESHOLD=60
    if ./mvnw jacoco:check -Djacoco.minimum.coverage=0.${COVERAGE_THRESHOLD}; then
        print_success "Cobertura de código cumple el umbral mínimo (${COVERAGE_THRESHOLD}%)"
    else
        print_error "Cobertura de código no cumple el umbral mínimo (${COVERAGE_THRESHOLD}%)"
        return 1
    fi
    
    print_success "Tests unitarios backend completados"
}

# Tests de integración Backend
run_backend_integration_tests() {
    print_section "Tests de Integración Backend (Java)"
    
    cd "$PROJECT_DIR/backend"
    
    # Verificar si Docker está disponible para Testcontainers
    if ! command -v docker &> /dev/null; then
        print_error "Docker es requerido para tests de integración"
        return 1
    fi
    
    print_warning "Ejecutando tests de integración..."
    ./mvnw test -Dtest="**/*IntegrationTest" -Dspring.profiles.active=test
    
    print_success "Tests de integración backend completados"
}

# Tests unitarios ML Service Python
run_ml_unit_tests() {
    print_section "Tests Unitarios ML Service (Python)"
    
    cd "$PROJECT_DIR/ml-service"
    
    # Crear entorno virtual si no existe
    if [ ! -d "venv" ]; then
        print_warning "Creando entorno virtual..."
        python3 -m venv venv
    fi
    
    # Activar entorno virtual
    source venv/bin/activate
    
    # Instalar dependencias
    print_warning "Instalando dependencias..."
    pip install -r requirements.txt
    pip install pytest pytest-cov pytest-asyncio httpx
    
    # Ejecutar tests con cobertura
    print_warning "Ejecutando tests con cobertura..."
    pytest tests/ -v \
        --cov=app \
        --cov-report=term-missing \
        --cov-report=html:htmlcov \
        --cov-report=xml:coverage.xml \
        --cov-fail-under=60
    
    print_success "Tests unitarios ML service completados"
    
    # Desactivar entorno virtual
    deactivate
}

# Análisis de código
run_code_analysis() {
    print_section "Análisis de Código"
    
    # Backend Java
    print_warning "Análisis Backend (Java)..."
    cd "$PROJECT_DIR/backend"
    
    # Checkstyle
    if ./mvnw checkstyle:check; then
        print_success "Checkstyle: OK"
    else
        print_error "Checkstyle: Fallos detectados"
    fi
    
    # SpotBugs
    if ./mvnw spotbugs:check; then
        print_success "SpotBugs: OK"
    else
        print_error "SpotBugs: Fallos detectados"
    fi
    
    # PMD
    if ./mvnw pmd:check; then
        print_success "PMD: OK"
    else
        print_error "PMD: Fallos detectados"
    fi
    
    # ML Service Python
    print_warning "Análisis ML Service (Python)..."
    cd "$PROJECT_DIR/ml-service"
    
    source venv/bin/activate
    
    # Instalar herramientas de análisis
    pip install flake8 black isort bandit safety
    
    # Black formatting check
    if black --check app/ tests/; then
        print_success "Black: Formato correcto"
    else
        print_error "Black: Formato incorrecto"
    fi
    
    # Import sorting check
    if isort --check-only app/ tests/; then
        print_success "isort: Imports ordenados correctamente"
    else
        print_error "isort: Imports desordenados"
    fi
    
    # Linting
    if flake8 app/ tests/ --max-line-length=100; then
        print_success "flake8: Sin issues de linting"
    else
        print_error "flake8: Issues de linting detectados"
    fi
    
    # Security check
    if bandit -r app/; then
        print_success "bandit: Sin issues de seguridad"
    else
        print_error "bandit: Issues de seguridad detectados"
    fi
    
    # Dependency vulnerability check
    if safety check; then
        print_success "safety: Dependencias seguras"
    else
        print_error "safety: Vulnerabilidades en dependencias"
    fi
    
    deactivate
}

# Generar reporte consolidado
generate_report() {
    print_section "Generando Reporte Consolidado"
    
    REPORT_DIR="$PROJECT_DIR/test-reports"
    mkdir -p "$REPORT_DIR"
    
    REPORT_FILE="$REPORT_DIR/test-summary-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# Reporte de Tests - E-Commerce PIMO

**Fecha:** $(date)
**Tipo de ejecución:** $TEST_TYPE

## Backend (Java)

### Cobertura de Código
- **Ubicación:** \`backend/target/site/jacoco/index.html\`
- **Reporte XML:** \`backend/target/site/jacoco/jacoco.xml\`

### Tests Unitarios
- **Ubicación:** \`backend/target/surefire-reports/\`

### Tests de Integración
- **Ubicación:** \`backend/target/failsafe-reports/\`

## ML Service (Python)

### Cobertura de Código
- **Reporte HTML:** \`ml-service/htmlcov/index.html\`
- **Reporte XML:** \`ml-service/coverage.xml\`

### Tests
- **Tests ejecutados:** pytest con cobertura

## Análisis de Código

### Backend
- Checkstyle: Análisis de estilo de código
- SpotBugs: Análisis estático de bugs
- PMD: Análisis de calidad de código

### ML Service
- Black: Formato de código
- isort: Orden de imports
- flake8: Linting
- bandit: Análisis de seguridad
- safety: Vulnerabilidades en dependencias

## Archivos Generados

- Backend Coverage: \`backend/target/site/jacoco/\`
- ML Coverage: \`ml-service/htmlcov/\`
- Test Reports: \`$REPORT_DIR\`

EOF

    print_success "Reporte generado: $REPORT_FILE"
}

# Función principal
main() {
    check_prerequisites
    
    case $TEST_TYPE in
        "unit")
            run_backend_unit_tests
            run_ml_unit_tests
            ;;
        "integration")
            run_backend_integration_tests
            ;;
        "analysis")
            run_code_analysis
            ;;
        "all")
            run_backend_unit_tests
            run_backend_integration_tests
            run_ml_unit_tests
            run_code_analysis
            ;;
        *)
            print_error "Tipo de test inválido: $TEST_TYPE"
            echo "Uso: $0 [unit|integration|analysis|all]"
            exit 1
            ;;
    esac
    
    generate_report
    
    print_section "Tests Completados"
    print_success "Todos los tests han sido ejecutados exitosamente"
    print_warning "Revisa los reportes en el directorio test-reports/"
}

# Trap para cleanup en caso de error
cleanup() {
    print_error "Script interrumpido"
    # Cleanup code aquí si es necesario
    exit 1
}

trap cleanup SIGINT SIGTERM

# Ejecutar función principal
main "$@"