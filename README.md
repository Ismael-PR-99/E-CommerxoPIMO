# 🛒 E-CommerxoPIMO - Sistema de Gestión de Inventario E-commerce

## 📋 Descripción del Proyecto

**E-CommerxoPIMO** es un sistema completo de gestión de inventario para e-commerce que incluye:
- 🏪 **Tienda externa** para clientes
- ⚙️ **Panel de administración** para gestionar productos
- 📦 **Control de stock en tiempo real**
- 🛒 **Sistema de carrito de compras**
- 💾 **Persistencia de datos con localStorage**
- 🤖 **Microservicio de IA** (en desarrollo)
- 🗄️ **Backend con Spring Boot** (en desarrollo)

---

## 🏗️ Arquitectura del Proyecto

```
E-CommerxoPIMO/
├── frontend/                 # Aplicación React (✅ FUNCIONAL)
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   │   ├── admin/       # Panel de administración
│   │   │   └── Store.tsx    # Tienda externa
│   │   ├── store/           # Estado global (Zustand)
│   │   └── types/           # Tipos TypeScript
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # API Spring Boot (✅ EN DESARROLLO, PostgreSQL)
├── ml-service/               # Microservicio IA Python (🚧 En desarrollo)
├── database/                 # Scripts PostgreSQL (✅ EN USO)
└── docker/                   # Contenedores Docker
```

---

## 🚀 Instalación y Configuración RÁPIDA

### 📋 Prerrequisitos MÍNIMOS

1. **Node.js** (versión 18 o superior)
   ```bash
   # Verificar instalación
   node --version
   npm --version
   ```

2. **Git** (para clonar el repositorio)

### ⚡ INICIO RÁPIDO (5 minutos)

```bash
# 1. Clonar repositorio
git clone https://github.com/Ismael-PR-99/E-CommerxoPIMO.git
cd E-CommerxoPIMO

# 2. Instalar y ejecutar
cd frontend
npm install
npm run dev

# 3. Abrir en navegador:
# Tienda: http://localhost:5173/store
# Admin: http://localhost:5173/admin/products
```

**¡LISTO! El sistema está funcionando.**

---

## 🖥️ Comandos de Terminal - GUÍA COMPLETA

### 📦 Comandos Principales del Frontend
```bash
# Navegar al directorio
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Ejecutar en desarrollo (COMANDO PRINCIPAL)
npm run dev

# Ejecutar con acceso desde red local
npm run dev -- --host 0.0.0.0

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Linter de código
npm run lint

# Ejecutar tests
npm run test
```

### 🔧 Comandos de Solución de Problemas
```bash
# Si hay problemas con dependencias
rm -rf node_modules package-lock.json
npm install

# Si el puerto está ocupado
npm run dev -- --port 3000

# Limpiar caché
npm run dev -- --force

# Ver logs detallados
npm run dev -- --debug
```

---

## 🗄️ Base de Datos - Estado Actual

El backend usará **PostgreSQL** como base de datos principal:
- ✅ Scripts y migraciones en `database/postgresql/`
- ✅ Integración con Spring Boot y JPA/Hibernate
- ✅ Docker para levantar la base de datos fácilmente

### 📋 Instalación rápida de PostgreSQL con Docker

```bash
# Desde el directorio docker/
docker-compose up -d
```

---

## 🎯 Funcionalidades DETALLADAS

### 🛒 **Tienda Externa** (`http://localhost:5173/store`)
```
✅ Catálogo de productos con imágenes
✅ Filtros por categoría (Electrónicos, Ropa, Hogar, etc.)
✅ Búsqueda en tiempo real
✅ Carrito de compras interactivo
✅ Sistema de checkout simulado
✅ Control de stock automático
✅ Productos agotados (❌ Agotado)
✅ Validación de stock antes de compra
✅ Persistencia del carrito
```

### ⚙️ **Panel de Administración** (`http://localhost:5173/admin/products`)
```
✅ Dashboard con estadísticas en tiempo real
✅ Gestión completa de productos (Crear, Editar, Eliminar)
✅ Alertas de stock bajo (≤10 unidades)
✅ Búsqueda y filtros avanzados
✅ Cálculo automático de valor de inventario
✅ Interfaz moderna tema blanco/negro
✅ Formularios validados
✅ Responsive design
```

### 🔄 **Sincronización en Tiempo Real**
```
✅ Estado compartido entre tienda y admin
✅ Actualizaciones instantáneas de stock
✅ Persistencia automática en localStorage
✅ Logs detallados para debugging
```

---

## 🧪 CÓMO PROBAR TODO - Guía Paso a Paso

### 1. 🚀 **Iniciar el Sistema**
```bash
cd frontend
npm run dev
```
Resultado: Servidor en http://localhost:5173

### 2. 🛒 **Probar la Tienda**
1. Ir a: **http://localhost:5173/store**
2. Navegar por productos
3. Usar filtros de categoría
4. Buscar productos por nombre
5. Agregar al carrito
6. Cambiar cantidades en el carrito
7. Hacer checkout
8. ✅ **Verificar que el stock baja**

### 3. ⚙️ **Probar el Admin**
1. Ir a: **http://localhost:5173/admin/products**
2. Ver estadísticas actualizadas
3. Crear un nuevo producto
4. Editar productos existentes
5. ✅ **Verificar stock en tiempo real**

### 4. 🔄 **Probar Sincronización**
1. **Abrir ambas páginas** en pestañas separadas:
   - Pestaña 1: Tienda
   - Pestaña 2: Admin
2. **Comprar en la tienda**
3. **Cambiar a la pestaña admin**
4. ✅ **Ver cómo se actualiza automáticamente**

---

## 🛠️ Herramientas de Debug INCLUIDAS

### 🔍 **Botones de Prueba Rápida**
- **Tienda**: Botón azul "🔍 Test Stock" - Reduce stock del primer producto
- **Admin**: Botón azul "🔍 Debug Stock" - Muestra estado actual

### 📊 **Logs en Consola** (Abrir F12)
```javascript
// Cuando actualizas stock:
🔄 Attempting to update stock for product ID: 1, reducing by: 2
📦 Product before update: {id: 1, name: "Laptop Dell XPS 13", stock: 15}
📦 Product after update: {id: 1, name: "Laptop Dell XPS 13", stock: 13}
✅ Stock update completed

// En la tienda:
🛒 Store - Products updated: 6 products

// En el admin:
🏪 Admin - Products updated: 6 products
```

---

## 🎨 Tecnologías y Dependencias

### 🖼️ **Frontend (Funcionando al 100%)**
```json
{
  "react": "^18.2.0",           // Framework principal
  "typescript": "^5.2.2",       // Tipado estático
  "vite": "^5.4.19",           // Build tool super rápido
  "react-router-dom": "^6.19.0", // Navegación
  "zustand": "^4.5.7",         // Estado global + persistencia
  "react-dom": "^18.2.0"       // Renderizado
}
```

### 🔧 **Herramientas de Desarrollo**
```json
{
  "@vitejs/plugin-react": "^4.2.1",  // Plugin React para Vite
  "@typescript-eslint/*": "^7.2.0",   // Linting TypeScript
  "eslint": "^8.57.0"                 // Linter de código
}
```

---

## 🚨 Solución de Problemas COMUNES

### ❌ **Puerto 5173 ocupado**
```bash
# Solución 1: Usar otro puerto
npm run dev -- --port 3000

# Solución 2: Matar procesos
# Windows:
taskkill /F /IM node.exe
# Linux/Mac:
killall node
```

### ❌ **"Cannot find module" o errores de dependencias**
```bash
# Limpiar todo y reinstalar
rm -rf node_modules
rm package-lock.json
npm install
```

### ❌ **Stock no se actualiza entre páginas**
```bash
# 1. Abrir DevTools (F12)
# 2. Ir a Application > Local Storage
# 3. Eliminar "ecommerce-storage"
# 4. Recargar páginas
```

### ❌ **Error de TypeScript**
```bash
# Verificar errores
npx tsc --noEmit

# Si persiste, reinstalar tipos
npm install @types/react @types/react-dom --save-dev
```

### ❌ **Página en blanco**
```bash
# 1. Verificar consola (F12)
# 2. Verificar que el servidor esté corriendo
# 3. Ir directamente a: http://localhost:5173
```

---

## 📁 Estructura de Archivos IMPORTANTE

### 🎯 **Archivos Clave que NO debes tocar**
```
frontend/
├── src/store/useStore.ts        # ⚠️ Estado global - CRÍTICO
├── src/App.tsx                  # ⚠️ Router principal
├── package.json                 # ⚠️ Dependencias
└── vite.config.ts              # ⚠️ Configuración servidor
```

### 🎨 **Archivos que SÍ puedes modificar**
```
frontend/src/
├── pages/Store.tsx              # ✅ Tienda externa
├── pages/admin/CleanProductManagement.tsx  # ✅ Admin
├── components/                  # ✅ Componentes
└── types/index.ts              # ✅ Tipos TypeScript
```

---

## 🌐 URLs del Sistema

| Página | URL | Descripción |
|--------|-----|-------------|
| 🏠 **Principal** | `http://localhost:5173` | Dashboard principal |
| 🛒 **Tienda** | `http://localhost:5173/store` | Tienda para clientes |
| ⚙️ **Admin Productos** | `http://localhost:5173/admin/products` | Gestión de productos |
| 🏢 **Dashboard Admin** | `http://localhost:5173/admin` | Panel de administración |

---

## 📞 Soporte y Contacto

### 👨‍💻 **Desarrollador Principal**
- **GitHub**: [@Ismael-PR-99](https://github.com/Ismael-PR-99)
- **Repositorio**: [E-CommerxoPIMO](https://github.com/Ismael-PR-99/E-CommerxoPIMO)

### 🆘 **Si tienes problemas:**
1. **Revisar esta guía** (90% de problemas están aquí)
2. **Abrir DevTools (F12)** y revisar errores en consola
3. **Verificar que el servidor esté corriendo** (`npm run dev`)
4. **Limpiar caché** del navegador (Ctrl+F5)

---

## 🔄 Estado del Proyecto (Julio 2025)

| Componente            | Estado         | Funcionalidad                       |
|-----------------------|---------------|-------------------------------------|
| 🖼️ Frontend React     | ✅ COMPLETO    | Tienda + Admin funcionando al 100%  |
| 💾 Persistencia       | ✅ COMPLETO    | Zustand + localStorage              |
| 🛒 Carrito de Compras | ✅ COMPLETO    | Funcional con validaciones          |
| 📦 Control de Stock   | ✅ COMPLETO    | Tiempo real + persistencia          |
| 🌐 Backend Spring Boot| 🚧 EN DESARROLLO| API REST + PostgreSQL (en progreso) |
| 🗄️ Base de Datos Real | ✅ EN USO      | PostgreSQL + migraciones            |
```