# Instrucciones para usar con Brave Browser

## Problema
Brave Browser tiene configuraciones de seguridad muy estrictas que pueden bloquear la aplicación.

## Soluciones para Brave:

### 1. Deshabilitar Shields temporalmente
- Hacer clic en el icono del escudo (🛡️) en la barra de direcciones
- Seleccionar "Shields Down" para localhost:5173

### 2. Permitir JavaScript
- Ir a brave://settings/content/javascript
- Agregar [*.]localhost:5173 a la lista de "Permitidos"

### 3. Deshabilitar bloqueador de anuncios para localhost
- Ir a brave://settings/shields
- Agregar localhost:5173 como excepción

### 4. URL a probar:
http://localhost:5173/store

### 5. Si sigue sin funcionar:
- Probar en modo incógnito
- Usar otro navegador (Chrome/Firefox) para confirmar que funciona
- Verificar en la consola del desarrollador (F12) si hay errores específicos

## Estado actual:
✅ Servidor corriendo en http://localhost:5173
✅ Imágenes configuradas correctamente
✅ Aplicación funcionando en navegadores estándar