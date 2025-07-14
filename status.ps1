# Script para verificar el estado de Docker y los servicios
Write-Host "=== Verificación de Estado ===" -ForegroundColor Green

# Verificar Docker
Write-Host "`n1. Estado de Docker:" -ForegroundColor Yellow
try {
    docker --version
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host "✅ Docker funcionando correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está disponible" -ForegroundColor Red
}

# Verificar servicios del proyecto
Write-Host "`n2. Servicios del proyecto:" -ForegroundColor Yellow
try {
    Set-Location "C:\xampp\htdocs\E-CommerxoPIMO"
    docker-compose -f docker/docker-compose.yml ps
} catch {
    Write-Host "❌ Error al verificar servicios del proyecto" -ForegroundColor Red
}

Write-Host "`n3. URLs del sistema:" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8080/api" -ForegroundColor Cyan
Write-Host "ML Service: http://localhost:8000/docs" -ForegroundColor Cyan
