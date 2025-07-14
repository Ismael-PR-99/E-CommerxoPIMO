# Script para ejecutar E-CommerxoPIMO
Write-Host "=== E-CommerxoPIMO - Sistema de Gestión de Inventario ===" -ForegroundColor Green

# Verificar si Docker Desktop está ejecutándose
Write-Host "Verificando Docker..." -ForegroundColor Yellow

try {
    docker ps | Out-Null
    Write-Host "✅ Docker está ejecutándose" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Desktop no está ejecutándose. Iniciando..." -ForegroundColor Red
    Start-Process "Docker Desktop"
    Write-Host "Esperando que Docker Desktop se inicie (30 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Verificar nuevamente
    try {
        docker ps | Out-Null
        Write-Host "✅ Docker iniciado correctamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: Docker Desktop no pudo iniciarse. Por favor, inicia Docker Desktop manualmente." -ForegroundColor Red
        exit 1
    }
}

# Cambiar al directorio del proyecto
Set-Location "C:\xampp\htdocs\E-CommerxoPIMO"

Write-Host "Construyendo e iniciando los servicios..." -ForegroundColor Yellow
Write-Host "Esto puede tomar varios minutos la primera vez..." -ForegroundColor Cyan

# Ejecutar docker-compose
docker-compose -f docker/docker-compose.yml up --build

Write-Host "=== Servicios disponibles ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8080/api" -ForegroundColor Cyan
Write-Host "ML Service: http://localhost:8000" -ForegroundColor Cyan
Write-Host "PostgreSQL: localhost:5432" -ForegroundColor Cyan
