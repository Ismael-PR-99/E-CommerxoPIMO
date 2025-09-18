import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mocks base de Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({})),
}));

vi.mock('@stripe/react-stripe-js', () => {
  const PaymentElement = (props: any) => <div data-testid="payment-element" {...props} />;
  return {
    Elements: ({ children }: any) => <div data-testid="elements-wrapper">{children}</div>,
    PaymentElement,
    useStripe: () => ({
      confirmPayment: vi.fn(async () => ({ paymentIntent: { status: 'succeeded' } })),
    }),
    useElements: () => ({}),
  };
});

// Mock del servicio de pagos (se remplazará createCheckout luego)
vi.mock('../services/payments', async () => {
  const actual = await vi.importActual<any>('../services/payments');
  return {
    ...actual,
    paymentsService: {
      ...actual.paymentsService,
      createCheckout: async () => ({
        client_secret: 'cs_placeholder',
        payment_intent_id: 'pi_placeholder',
        amount_cents: 0,
        currency: 'EUR',
      }),
    },
    generateIdempotencyKey: () => 'fixed-idempotency-key',
  };
});

import { paymentsService } from '../services/payments';
import Checkout from '../pages/Checkout';

const mockCreateCheckout = vi.fn(async () => ({
  client_secret: 'cs_test_dummy',
  payment_intent_id: 'pi_test_dummy',
  amount_cents: 2500,
  currency: 'EUR',
}));

// Sobrescribir implementación real del mock antes de cada test
beforeEach(() => {
  vi.clearAllMocks();
  // @ts-ignore forzamos sobreescritura del método mockeado
  paymentsService.createCheckout = mockCreateCheckout;
  localStorage.setItem('token', 'fake-jwt');
});

// Página simulada de Thank You para validar navegación
const ThankYou = () => <div data-testid="thank-you-page">Gracias por tu compra</div>;

// Helper para renderizar con router y rutas reales
const renderCheckout = (initialPath = '/checkout/123') => (
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/checkout/:orderId" element={<Checkout />} />
        <Route path="/order/thank-you" element={<ThankYou />} />
      </Routes>
    </MemoryRouter>
  )
);

describe('Checkout UI Flow', () => {
  it('renderiza PaymentElement tras crear checkout y navega a Thank You al confirmar', async () => {
    renderCheckout();

    // Espera a que se resuelva createCheckout y aparezca el PaymentElement
    const paymentElement = await screen.findByTestId('payment-element');
    expect(paymentElement).toBeInTheDocument();

    const payButton = screen.getByRole('button', { name: /Completar pago/i });
    expect(payButton).toBeEnabled();

    await act(async () => {
      userEvent.click(payButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('thank-you-page')).toBeInTheDocument();
    });
  });

  it('muestra estado de carga inicial y llama createCheckout una sola vez', async () => {
    renderCheckout();
    await screen.findByTestId('payment-element');
    expect(mockCreateCheckout).toHaveBeenCalledTimes(1);
  });
});
