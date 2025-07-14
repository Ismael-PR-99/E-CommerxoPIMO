# Script de optimización para E-CommerxoPIMO
# Ejecuta optimizaciones de base de datos y limpia cachés

Write-Host "🚀 Iniciando optimizaciones del sistema E-CommerxoPIMO..." -ForegroundColor Green

# Función para mostrar el estado
function Show-Status {
    param($Message, $Color = "Yellow")
    Write-Host "⚡ $Message" -ForegroundColor $Color
}

# Función para ejecutar comandos de Docker
function Invoke-DockerCommand {
    param($Command, $Description)
    Show-Status $Description
    try {
        Invoke-Expression $Command
        Write-Host "✅ $Description completado" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error en: $Description" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# 1. Optimización de Base de Datos
Show-Status "Aplicando optimizaciones de base de datos..."
$dbOptimizationCmd = "docker-compose exec -T postgres psql -U postgres -d ecommerxo -f /docker-entrypoint-initdb.d/optimizations.sql"
Invoke-DockerCommand -Command $dbOptimizationCmd -Description "Optimizaciones de BD"

# 2. Limpiar cachés de aplicación
Show-Status "Limpiando cachés de aplicación..."
$clearCacheCmd = @"
docker-compose exec backend curl -X POST http://localhost:8080/api/cache/clear || echo 'Cache endpoint no disponible'
"@
Invoke-Expression $clearCacheCmd

# 3. Reiniciar servicios para aplicar optimizaciones
Show-Status "Reiniciando servicios..."
Invoke-DockerCommand -Command "docker-compose restart backend" -Description "Reinicio del backend"
Invoke-DockerCommand -Command "docker-compose restart ml-service" -Description "Reinicio del ML service"

# 4. Verificar salud de los servicios
Show-Status "Verificando salud de los servicios..."
Start-Sleep -Seconds 10

$services = @(
    @{Name="Backend"; Url="http://localhost:8080/api/health"},
    @{Name="ML Service"; Url="http://localhost:8000/health"},
    @{Name="Frontend"; Url="http://localhost:5173"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name) está funcionando correctamente" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️ $($service.Name) no responde en $($service.Url)" -ForegroundColor Yellow
    }
}

# 5. Mostrar estadísticas de rendimiento
Show-Status "Obteniendo estadísticas de rendimiento..."
$stats = docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
Write-Host "`n📊 Estadísticas de contenedores:" -ForegroundColor Cyan
Write-Host $stats

# 6. Información de optimizaciones aplicadas
Write-Host "`n🎯 Optimizaciones aplicadas:" -ForegroundColor Cyan
Write-Host "  ✓ Índices de base de datos para consultas rápidas"
Write-Host "  ✓ Cache en memoria para productos y usuarios"
Write-Host "  ✓ Paginación en frontend y backend"
Write-Host "  ✓ Búsqueda con debounce en frontend"
Write-Host "  ✓ Componentes React memoizados"
Write-Host "  ✓ Consultas asíncronas en ML service"
Write-Host "  ✓ Limitación de recursos en Docker"

Write-Host "`n🏁 Optimización completada!" -ForegroundColor Green
Write-Host "📈 Tu sistema ahora debería tener mejor rendimiento y escalabilidad." -ForegroundColor Green

# 7. Sugerencias adicionales
Write-Host "`n💡 Sugerencias adicionales:" -ForegroundColor Magenta
Write-Host "  • Considera usar Redis para cache distribuido en producción"
Write-Host "  • Implementa CDN para archivos estáticos del frontend"
Write-Host "  • Configura load balancer para múltiples instancias"
Write-Host "  • Monitorea métricas con Prometheus/Grafana"
Write-Host "  • Implementa backup automático de la base de datos"
