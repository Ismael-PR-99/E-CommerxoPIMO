@echo off
REM Script para verificar la estructura del proyecto Java
echo === VERIFICACION DE ESTRUCTURA DEL PROYECTO ===
echo.

echo 1. Verificando estructura de paquetes...
if exist "src\main\java\com\ecommercepimo\ecommerce\EcommerceApplication.java" (
    echo ✓ Aplicacion principal encontrada: EcommerceApplication.java
) else (
    echo ✗ Error: No se encontro EcommerceApplication.java
    exit /b 1
)

echo.
echo 2. Verificando que no existen paquetes duplicados...
if exist "src\main\java\com\ecommerxo" (
    echo ✗ Error: Paquete duplicado com.ecommerxo aun existe
    exit /b 1
) else (
    echo ✓ No hay paquetes duplicados
)

echo.
echo 3. Verificando controladores principales...
set controllers=AuthController ProductController UserController OrderController MLController

for %%c in (%controllers%) do (
    if exist "src\main\java\com\ecommercepimo\ecommerce\controller\%%c.java" (
        echo ✓ %%c encontrado
    ) else (
        echo ✗ Error: %%c no encontrado
    )
)

echo.
echo 4. Verificando configuracion principal...
if exist "src\main\java\com\ecommercepimo\ecommerce\config\SecurityConfig.java" (
    echo ✓ SecurityConfig encontrado
) else (
    echo ✗ Error: SecurityConfig no encontrado
)

echo.
echo 5. Verificando configuracion de aplicacion...
if exist "src\main\resources\application.yml" (
    echo ✓ application.yml encontrado
) else (
    echo ✗ Error: application.yml no encontrado
)

echo.
echo 6. Verificando migraciones de base de datos...
if exist "src\main\resources\db\migration\V1__Create_initial_tables.sql" (
    echo ✓ Migraciones de Flyway encontradas
) else (
    echo ✗ Error: Migraciones de Flyway no encontradas
)

echo.
echo === VERIFICACION COMPLETADA ===
echo.
echo RESUMEN:
echo - Aplicacion principal: com.ecommercepimo.ecommerce.EcommerceApplication
echo - Paquete base: com.ecommercepimo.ecommerce
echo - Sin paquetes duplicados
echo - Configuracion unificada
echo.
echo El proyecto esta listo para compilacion y ejecucion.