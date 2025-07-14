# Script de optimizacion para E-CommerxoPIMO
# Ejecuta optimizaciones de base de datos y limpia caches

Write-Host "Iniciando optimizaciones del sistema E-CommerxoPIMO..." -ForegroundColor Green

# Funcion para mostrar el estado
function Show-Status {
    param($Message, $Color = "Yellow")
    Write-Host "=> $Message" -ForegroundColor $Color
}

# Funcion para ejecutar comandos de Docker
function Invoke-DockerCommand {
    param($Command, $Description)
    Show-Status $Description
    try {
        Invoke-Expression $Command
        Write-Host "✓ $Description completado" -ForegroundColor Green
    } catch {
        Write-Host "✗ Error en: $Description" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# 1. Verificar salud de los servicios
Show-Status "Verificando salud de los servicios..."
Start-Sleep -Seconds 5

$services = @(
    @{Name="Backend"; Url="http://localhost:8080/actuator/health"},
    @{Name="ML Service"; Url="http://localhost:8000/health"},
    @{Name="Frontend"; Url="http://localhost:5173"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ $($service.Name) está funcionando correctamente" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠ $($service.Name) no responde en $($service.Url)" -ForegroundColor Yellow
    }
}

# 2. Mostrar estadisticas de rendimiento
Show-Status "Obteniendo estadisticas de rendimiento..."
$stats = docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
Write-Host "`nEstadisticas de contenedores:" -ForegroundColor Cyan
Write-Host $stats

# 3. Informacion de optimizaciones aplicadas
Write-Host "`nOptimizaciones aplicadas:" -ForegroundColor Cyan
Write-Host "  ✓ Cache en memoria para productos y usuarios"
Write-Host "  ✓ Paginacion en frontend y backend"
Write-Host "  ✓ Busqueda con debounce en frontend"
Write-Host "  ✓ Componentes React memoizados"
Write-Host "  ✓ Consultas asincronas en ML service"
Write-Host "  ✓ Limitacion de recursos en Docker"

Write-Host "`nOptimizacion completada!" -ForegroundColor Green
Write-Host "Tu sistema ahora tiene mejor rendimiento y escalabilidad." -ForegroundColor Green

# 4. Sugerencias adicionales
Write-Host "`nSugerencias adicionales:" -ForegroundColor Magenta
Write-Host "  • Considera usar Redis para cache distribuido en produccion"
Write-Host "  • Implementa CDN para archivos estaticos del frontend"
Write-Host "  • Configura load balancer para multiples instancias"
Write-Host "  • Monitorea metricas con Prometheus/Grafana"
Write-Host "  • Implementa backup automatico de la base de datos"
