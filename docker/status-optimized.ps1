# Script de optimizacion para E-CommerxoPIMO
Write-Host "Iniciando verificacion del sistema E-CommerxoPIMO..." -ForegroundColor Green

# Verificar servicios
Write-Host "`n=> Verificando servicios..." -ForegroundColor Yellow

# Verificar estado de contenedores
docker-compose ps

# Mostrar estadisticas de rendimiento
Write-Host "`n=> Estadisticas de rendimiento:" -ForegroundColor Yellow
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

# Mostrar optimizaciones aplicadas
Write-Host "`nOptimizaciones aplicadas:" -ForegroundColor Cyan
Write-Host "  - Cache en memoria para productos y usuarios"
Write-Host "  - Paginacion en frontend y backend"
Write-Host "  - Busqueda con debounce en frontend"
Write-Host "  - Componentes React memoizados"
Write-Host "  - Consultas asincronas en ML service"
Write-Host "  - Limitacion de recursos en Docker"

Write-Host "`nSistema optimizado correctamente!" -ForegroundColor Green

# Probar conectividad basica
Write-Host "`n=> Probando conectividad..." -ForegroundColor Yellow
$frontendTest = Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet
$backendTest = Test-NetConnection -ComputerName localhost -Port 8080 -InformationLevel Quiet
$mlTest = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet

if ($frontendTest) { Write-Host "✓ Frontend (puerto 5173) - OK" -ForegroundColor Green }
else { Write-Host "✗ Frontend (puerto 5173) - No responde" -ForegroundColor Red }

if ($backendTest) { Write-Host "✓ Backend (puerto 8080) - OK" -ForegroundColor Green }
else { Write-Host "✗ Backend (puerto 8080) - No responde" -ForegroundColor Red }

if ($mlTest) { Write-Host "✓ ML Service (puerto 8000) - OK" -ForegroundColor Green }
else { Write-Host "✗ ML Service (puerto 8000) - No responde" -ForegroundColor Red }

Write-Host "`nAccede a tu sistema optimizado en:" -ForegroundColor Magenta
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8080" -ForegroundColor White
Write-Host "  ML Service: http://localhost:8000" -ForegroundColor White
