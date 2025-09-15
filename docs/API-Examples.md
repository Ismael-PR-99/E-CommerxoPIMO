# 📊 Ejemplos de Uso - E-CommerxoPIMO API

Este documento contiene ejemplos prácticos de uso de las APIs del sistema.

## 🛒 Flujo Completo de E-commerce

### 1. Registro y Autenticación

```javascript
// 1. Registrar nuevo usuario
const registerResponse = await fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'juan.perez@email.com',
    password: 'MiPassword123!',
    firstName: 'Juan',
    lastName: 'Pérez',
    phone: '+34123456789',
    acceptTerms: true
  })
});

const registerData = await registerResponse.json();
const accessToken = registerData.tokens.accessToken;

// 2. Headers para requests autenticados
const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`
};
```

### 2. Explorar Catálogo de Productos

```javascript
// Buscar productos por término
const searchProducts = async (query) => {
  const response = await fetch(
    `http://localhost:8080/api/products/search?q=${encodeURIComponent(query)}&size=10`,
    { headers: { 'Accept': 'application/json' } }
  );
  return await response.json();
};

// Filtrar por categoría y precio
const filterProducts = async () => {
  const response = await fetch(
    'http://localhost:8080/api/products/filter?minPrice=100&maxPrice=1500&page=0&size=20'
  );
  return await response.json();
};

// Obtener productos de una categoría específica
const categoryProducts = await fetch(
  'http://localhost:8080/api/products/category/Electrónicos?page=0&size=10'
);
```

### 3. Obtener Recomendaciones ML

```javascript
// Recomendaciones personalizadas híbridas
const getRecommendations = async (userId) => {
  const response = await fetch('http://localhost:8001/api/v1/recommendations/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      recommendation_type: 'hybrid',
      max_results: 10,
      include_metadata: true,
      exclude_owned: true
    })
  });
  return await response.json();
};

// Productos similares a uno específico
const getSimilarProducts = async (productId) => {
  const response = await fetch(
    `http://localhost:8001/api/v1/recommendations/product/${productId}/similar?max_results=8`
  );
  return await response.json();
};

// Productos trending
const getTrendingProducts = async () => {
  const response = await fetch(
    'http://localhost:8001/api/v1/recommendations/trending?max_results=15&days=7'
  );
  return await response.json();
};
```

### 4. Predicciones de Inventario

```javascript
// Predicción de stock para los próximos 30 días
const getStockPrediction = async (productId) => {
  const response = await fetch('http://localhost:8001/api/v1/predictions/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      prediction_type: 'stock',
      horizon_days: 30,
      include_confidence: true,
      include_factors: false
    })
  });
  return await response.json();
};

// Predicción de demanda
const getDemandPrediction = async (productId) => {
  const response = await fetch('http://localhost:8001/api/v1/predictions/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      prediction_type: 'demand',
      horizon_days: 14,
      include_confidence: true
    })
  });
  return await response.json();
};
```

### 5. Crear Pedido

```javascript
// Crear un pedido completo
const createOrder = async (userId, items, shippingAddress) => {
  const response = await fetch('http://localhost:8080/api/orders', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country
      },
      paymentMethod: 'CREDIT_CARD'
    })
  });
  return await response.json();
};

// Ejemplo de uso
const orderItems = [
  { productId: 123, quantity: 1, price: 1299.99 },
  { productId: 456, quantity: 2, price: 299.99 }
];

const shippingInfo = {
  street: 'Calle Mayor 123',
  city: 'Madrid',
  state: 'Madrid',
  zipCode: '28001',
  country: 'España'
};

const order = await createOrder(userId, orderItems, shippingInfo);
```

## 🐍 Ejemplos con Python

### Cliente Python para ML Service

```python
import requests
import json
from datetime import datetime, timedelta

class MLServiceClient:
    def __init__(self, base_url="http://localhost:8001/api/v1"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def get_stock_prediction(self, product_id, days=30):
        """Obtener predicción de stock"""
        payload = {
            "product_id": product_id,
            "prediction_type": "stock",
            "horizon_days": days,
            "include_confidence": True
        }
        
        response = self.session.post(
            f"{self.base_url}/predictions/generate",
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def get_user_recommendations(self, user_id, max_results=10):
        """Obtener recomendaciones para usuario"""
        payload = {
            "user_id": user_id,
            "recommendation_type": "hybrid",
            "max_results": max_results,
            "include_metadata": True,
            "exclude_owned": True
        }
        
        response = self.session.post(
            f"{self.base_url}/recommendations/generate",
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def get_trending_products(self, days=7, limit=20):
        """Obtener productos trending"""
        response = self.session.get(
            f"{self.base_url}/recommendations/trending",
            params={"max_results": limit, "days": days}
        )
        response.raise_for_status()
        return response.json()

# Ejemplo de uso
ml_client = MLServiceClient()

# Predicción de stock
stock_prediction = ml_client.get_stock_prediction(product_id=123, days=30)
print(f"Predicción de stock: {stock_prediction['predictions'][:3]}")

# Recomendaciones
recommendations = ml_client.get_user_recommendations(user_id=456)
print(f"Recomendaciones: {len(recommendations['recommendations'])} productos")

# Productos trending
trending = ml_client.get_trending_products(days=7)
print(f"Productos trending: {len(trending['recommendations'])} productos")
```

## ☕ Ejemplos con Java

### Cliente Java para Backend API

```java
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.List;
import java.util.Map;

@Service
public class EcommerceApiClient {
    
    private final WebClient webClient;
    
    public EcommerceApiClient() {
        this.webClient = WebClient.builder()
            .baseUrl("http://localhost:8080/api")
            .build();
    }
    
    public Mono<AuthResponse> login(String email, String password) {
        LoginRequest request = LoginRequest.builder()
            .email(email)
            .password(password)
            .build();
            
        return webClient.post()
            .uri("/auth/login")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(AuthResponse.class);
    }
    
    public Mono<PageResponse<ProductResponse>> getProducts(int page, int size) {
        return webClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/products")
                .queryParam("page", page)
                .queryParam("size", size)
                .build())
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<PageResponse<ProductResponse>>() {});
    }
    
    public Mono<ProductResponse> getProductById(Long productId) {
        return webClient.get()
            .uri("/products/{id}", productId)
            .retrieve()
            .bodyToMono(ProductResponse.class);
    }
    
    public Mono<OrderResponse> createOrder(OrderRequest orderRequest, String authToken) {
        return webClient.post()
            .uri("/orders")
            .header("Authorization", "Bearer " + authToken)
            .bodyValue(orderRequest)
            .retrieve()
            .bodyToMono(OrderResponse.class);
    }
}

// Ejemplo de uso
@Component
public class EcommerceService {
    
    @Autowired
    private EcommerceApiClient apiClient;
    
    public void demonstrateApiUsage() {
        // Login
        AuthResponse auth = apiClient.login("user@example.com", "password123")
            .block();
        
        String token = auth.getTokens().getAccessToken();
        
        // Obtener productos
        PageResponse<ProductResponse> products = apiClient.getProducts(0, 10)
            .block();
        
        System.out.println("Total productos: " + products.getTotalElements());
        
        // Crear pedido
        OrderRequest orderRequest = OrderRequest.builder()
            .items(List.of(
                OrderItemRequest.builder()
                    .productId(123L)
                    .quantity(2)
                    .price(BigDecimal.valueOf(99.99))
                    .build()
            ))
            .build();
            
        OrderResponse order = apiClient.createOrder(orderRequest, token)
            .block();
            
        System.out.println("Pedido creado: " + order.getId());
    }
}
```

## 🔧 Scripts de Testing

### Bash Script para Testing Completo

```bash
#!/bin/bash

# Configuración
BASE_URL_BACKEND="http://localhost:8080/api"
BASE_URL_ML="http://localhost:8001/api/v1"

echo "🧪 Testing E-CommerxoPIMO APIs..."

# 1. Test de Health Check
echo "📊 Health Check..."
curl -s "$BASE_URL_BACKEND/../actuator/health" | jq .
curl -s "$BASE_URL_ML/../health" | jq .

# 2. Test de Registro
echo "📝 Testing registro..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL_BACKEND/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "acceptTerms": true
  }')

echo $REGISTER_RESPONSE | jq .

# Extraer token
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.tokens.accessToken')

# 3. Test de Productos
echo "🛍️ Testing productos..."
curl -s "$BASE_URL_BACKEND/products?page=0&size=5" | jq '.content[0]'

# 4. Test de Búsqueda
echo "🔍 Testing búsqueda..."
curl -s "$BASE_URL_BACKEND/products/search?q=laptop" | jq '.totalElements'

# 5. Test de Predicciones ML
echo "🔮 Testing predicciones ML..."
curl -s -X POST "$BASE_URL_ML/predictions/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "prediction_type": "stock",
    "horizon_days": 7,
    "include_confidence": true
  }' | jq '.predictions[0]'

# 6. Test de Recomendaciones
echo "🎯 Testing recomendaciones..."
curl -s -X POST "$BASE_URL_ML/recommendations/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "recommendation_type": "trending",
    "max_results": 3,
    "include_metadata": true
  }' | jq '.recommendations[0]'

echo "✅ Testing completado!"
```

## 📊 Monitoreo y Métricas

### Script de Monitoreo

```python
import requests
import time
import json
from datetime import datetime

class APIMonitor:
    def __init__(self):
        self.backend_url = "http://localhost:8080"
        self.ml_url = "http://localhost:8001"
        
    def check_health(self):
        """Verificar salud de los servicios"""
        services = {
            "backend": f"{self.backend_url}/actuator/health",
            "ml_service": f"{self.ml_url}/health"
        }
        
        results = {}
        for service, url in services.items():
            try:
                response = requests.get(url, timeout=5)
                results[service] = {
                    "status": "UP" if response.status_code == 200 else "DOWN",
                    "response_time_ms": response.elapsed.total_seconds() * 1000,
                    "timestamp": datetime.now().isoformat()
                }
            except Exception as e:
                results[service] = {
                    "status": "ERROR",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
        
        return results
    
    def test_api_performance(self):
        """Test de rendimiento básico"""
        
        # Test productos
        start_time = time.time()
        response = requests.get(f"{self.backend_url}/api/products?size=10")
        products_time = (time.time() - start_time) * 1000
        
        # Test ML predictions
        start_time = time.time()
        response = requests.post(f"{self.ml_url}/api/v1/predictions/generate", 
            json={
                "product_id": 1,
                "prediction_type": "stock",
                "horizon_days": 7
            })
        prediction_time = (time.time() - start_time) * 1000
        
        # Test recomendaciones
        start_time = time.time()
        response = requests.get(f"{self.ml_url}/api/v1/recommendations/trending?max_results=5")
        recommendations_time = (time.time() - start_time) * 1000
        
        return {
            "products_api_ms": products_time,
            "predictions_api_ms": prediction_time,
            "recommendations_api_ms": recommendations_time,
            "timestamp": datetime.now().isoformat()
        }
    
    def monitor_loop(self, interval_seconds=30):
        """Loop de monitoreo continuo"""
        print(f"🔍 Iniciando monitoreo cada {interval_seconds} segundos...")
        
        while True:
            try:
                health = self.check_health()
                performance = self.test_api_performance()
                
                print(f"\n📊 Reporte {datetime.now().strftime('%H:%M:%S')}")
                print(f"Backend: {health['backend']['status']} ({health['backend'].get('response_time_ms', 0):.1f}ms)")
                print(f"ML Service: {health['ml_service']['status']} ({health['ml_service'].get('response_time_ms', 0):.1f}ms)")
                print(f"Productos API: {performance['products_api_ms']:.1f}ms")
                print(f"Predicciones: {performance['predictions_api_ms']:.1f}ms")
                print(f"Recomendaciones: {performance['recommendations_api_ms']:.1f}ms")
                
                time.sleep(interval_seconds)
                
            except KeyboardInterrupt:
                print("\n👋 Monitoreo detenido")
                break
            except Exception as e:
                print(f"❌ Error en monitoreo: {e}")
                time.sleep(interval_seconds)

# Ejecutar monitoreo
if __name__ == "__main__":
    monitor = APIMonitor()
    monitor.monitor_loop(30)
```

---

## 🎯 Casos de Uso Avanzados

### Dashboard de Administrador

```javascript
// Dashboard que combina múltiples APIs
class AdminDashboard {
    constructor(authToken) {
        this.authToken = authToken;
        this.headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        };
    }
    
    async getDashboardData() {
        // Obtener datos en paralelo
        const [
            products,
            trending,
            lowStockPredictions,
            topCategories
        ] = await Promise.all([
            this.getProductStats(),
            this.getTrendingProducts(),
            this.getLowStockAlerts(),
            this.getTopCategories()
        ]);
        
        return {
            products,
            trending,
            lowStockPredictions,
            topCategories,
            timestamp: new Date().toISOString()
        };
    }
    
    async getProductStats() {
        const response = await fetch('http://localhost:8080/api/products?size=1');
        const data = await response.json();
        return {
            totalProducts: data.totalElements,
            totalPages: data.totalPages
        };
    }
    
    async getTrendingProducts() {
        const response = await fetch(
            'http://localhost:8001/api/v1/recommendations/trending?max_results=5'
        );
        return await response.json();
    }
    
    async getLowStockAlerts() {
        // Obtener predicciones de stock bajo para productos críticos
        const criticalProducts = [123, 456, 789]; // IDs de productos críticos
        
        const predictions = await Promise.all(
            criticalProducts.map(async (productId) => {
                const response = await fetch(
                    'http://localhost:8001/api/v1/predictions/generate',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            product_id: productId,
                            prediction_type: 'stock',
                            horizon_days: 14,
                            include_confidence: true
                        })
                    }
                );
                return await response.json();
            })
        );
        
        // Filtrar productos con stock bajo predicho
        return predictions.filter(prediction => {
            const lastPrediction = prediction.predictions.slice(-1)[0];
            return lastPrediction.value < 10; // Alerta si stock < 10
        });
    }
    
    async getTopCategories() {
        // Obtener productos por categoría para análisis
        const categories = ['Electrónicos', 'Ropa', 'Hogar'];
        
        const categoryData = await Promise.all(
            categories.map(async (category) => {
                const response = await fetch(
                    `http://localhost:8080/api/products/category/${encodeURIComponent(category)}?size=1`
                );
                const data = await response.json();
                return {
                    category,
                    totalProducts: data.totalElements
                };
            })
        );
        
        return categoryData.sort((a, b) => b.totalProducts - a.totalProducts);
    }
}

// Uso del dashboard
const dashboard = new AdminDashboard(authToken);
const dashboardData = await dashboard.getDashboardData();
console.log('Dashboard data:', dashboardData);
```

---

<div align="center">

**📚 Más ejemplos disponibles en el [repositorio](https://github.com/Ismael-PR-99/E-CommerxoPIMO/tree/main/examples)**

</div>