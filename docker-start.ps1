# 🐳 Script de Inicio Docker - E-Commerce PIMO
# Ejecutar después de instalar Docker Desktop

Write-Host "🚀 Iniciando setup Docker para E-Commerce PIMO" -ForegroundColor Green

# Verificar si Docker está instalado
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado. Por favor instalar Docker Desktop:" -ForegroundColor Red
    Write-Host "   https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host "   Después ejecutar este script nuevamente." -ForegroundColor Yellow
    exit 1
}

# Verificar archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "📋 Copiando configuración de variables de entorno..." -ForegroundColor Yellow
    Copy-Item ".env.docker" ".env"
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANTE: Editar .env y cambiar APP_JWT_SECRET antes de producción" -ForegroundColor Yellow
} else {
    Write-Host "✅ Archivo .env ya existe" -ForegroundColor Green
}

# Mostrar configuración actual
Write-Host "`n📊 Configuración actual:" -ForegroundColor Cyan
Write-Host "   - PostgreSQL: puerto 5432" -ForegroundColor White
Write-Host "   - Redis: puerto 6379" -ForegroundColor White
Write-Host "   - ML Service: puerto 8001" -ForegroundColor White
Write-Host "   - ecommerce-api: puerto 8080" -ForegroundColor White
Write-Host "   - Frontend: puerto 3000" -ForegroundColor White

# Construir y levantar servicios
Write-Host "`n🔨 Construyendo y levantando servicios..." -ForegroundColor Yellow
try {
    # Levantar solo servicios backend primero
    Write-Host "1️⃣ Levantando base de datos y cache..." -ForegroundColor Cyan
    docker compose up postgres redis -d --build
    
    Write-Host "2️⃣ Esperando a que la base de datos esté lista..." -ForegroundColor Cyan
    Start-Sleep -Seconds 15
    
    Write-Host "3️⃣ Levantando servicios ML y API..." -ForegroundColor Cyan
    docker compose up ml-service ecommerce-api -d --build
    
    Write-Host "4️⃣ Levantando frontend (desarrollo)..." -ForegroundColor Cyan
    docker compose --profile dev up frontend-dev -d --build
    
    Write-Host "`n✅ Todos los servicios levantados!" -ForegroundColor Green
    
    # Verificar estado de servicios
    Write-Host "`n📋 Estado de servicios:" -ForegroundColor Cyan
    docker compose ps
    
    # Mostrar URLs de acceso
    Write-Host "`n🌐 URLs de acceso:" -ForegroundColor Green
    Write-Host "   Frontend:     http://localhost:3000" -ForegroundColor White
    Write-Host "   API Backend:  http://localhost:8080/api" -ForegroundColor White
    Write-Host "   ML Service:   http://localhost:8001" -ForegroundColor White
    Write-Host "   Swagger ML:   http://localhost:8001/docs" -ForegroundColor White
    Write-Host "   Health API:   http://localhost:8080/actuator/health" -ForegroundColor White
    
    # Health checks
    Write-Host "`n🏥 Verificando health checks..." -ForegroundColor Cyan
    Start-Sleep -Seconds 10
    
    try {
        $mlHealth = Invoke-RestMethod -Uri "http://localhost:8001/health" -TimeoutSec 5
        Write-Host "✅ ML Service: OK" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  ML Service: Aún iniciando..." -ForegroundColor Yellow
    }
    
    try {
        $apiHealth = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -TimeoutSec 5
        Write-Host "✅ ecommerce-api: OK" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  ecommerce-api: Aún iniciando..." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error al levantar servicios: $_" -ForegroundColor Red
    Write-Host "💡 Intentar manualmente:" -ForegroundColor Yellow
    Write-Host "   docker compose --profile dev up --build -d" -ForegroundColor White
}

Write-Host "`n📚 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   Ver logs:        docker compose logs -f" -ForegroundColor White
Write-Host "   Parar servicios: docker compose down" -ForegroundColor White
Write-Host "   Restart:         docker compose restart" -ForegroundColor White
Write-Host "   Estado:          docker compose ps" -ForegroundColor White

Write-Host "`n🎉 Setup completado! Revisar los logs si algún servicio no está funcionando." -ForegroundColor Green