# Stripe Checkout (Payment Element) - Quickstart

## 1. Configurar variables
Crea `frontend/.env` basado en `.env.example` y añade tu publishable key:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
VITE_API_URL=http://localhost:8080/api
```

## 2. Instalar dependencias (ya en package.json, verificar)
```
npm install
```

## 3. Levantar backend + frontend
Backend (desde raíz o carpeta backend):
```
./mvnw spring-boot:run
```
Frontend:
```
cd frontend
npm run dev
```
Visita: http://localhost:5173/checkout?orderId=ID_DE_LA_ORDEN

Para probar rápido, usa la orden PENDING creada por el seeding o crea una nueva en `/orders` (según UI disponible) y copia su ID en la URL.

## 4. Flujo de pago
1. El frontend llama `POST /api/payments/checkout` enviando `{ orderId }`.
2. Backend crea PaymentIntent y devuelve `client_secret` y `payment_intent_id`.
3. `PaymentElement` se monta con ese `client_secret`.
4. Al enviar, se ejecuta `stripe.confirmPayment`.
5. Redirección a `/thank-you?orderId=...&paymentIntentId=...`.
6. Página ThankYou consulta `/api/payments/status/{paymentIntentId}` y muestra estado.
7. Webhook de Stripe actualizará la orden/pago si cambia.

## 5. Tarjetas de prueba
- Éxito: `4242 4242 4242 4242`
- 3D Secure: `4000 0025 0000 3155`
- Fallo: `4000 0000 0000 9995`
Cualquier fecha futura y CVC.

## 6. Errores comunes
| Problema | Causa | Solución |
|----------|-------|----------|
| `Stripe no está cargado` | Variable publishable vacía | Verifica `.env` y reinicia `npm run dev` |
| 401 al crear checkout | Token JWT ausente/expirado | Inicia sesión y guarda token (`localStorage.token`) |
| 404 Orden | ID inválido o no pertenece al usuario | Confirmar ID antes de pagar |
| Estado se queda en PROCESSING | Webhook no configurado | Revisa logs backend y secret del webhook |

## 7. Siguientes mejoras (opcionales)
- Auto refresco de estado cada X segundos.
- Mostrar timeline de eventos (webhook audit).
- Guardar `payment_intent_id` en store para navegación sin query params.

Listo: flujo mínimo Stripe operativo para demo/portfolio.
