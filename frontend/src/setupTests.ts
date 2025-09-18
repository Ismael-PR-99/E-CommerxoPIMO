import '@testing-library/jest-dom';

// Mock de import.meta.env usados en el código
// Evita fallos por claves no definidas en entorno de test
Object.assign(import.meta, {
  env: {
    VITE_API_URL: 'http://localhost:8080',
    VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_dummy',
    DEV: false,
    PROD: true,
  },
});
