import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge, { useStatusVariant } from '../src/components/ui/StatusBadge';

describe('StatusBadge', () => {
  it('debe renderizar el texto en español para "entregado"', () => {
    render(<StatusBadge variant="entregado" />);
    expect(screen.getByText('Entregado')).toBeInTheDocument();
  });

  it('debe renderizar el texto en español para "enviado"', () => {
    render(<StatusBadge variant="enviado" />);
    expect(screen.getByText('Enviado')).toBeInTheDocument();
  });

  it('debe renderizar el texto en español para "procesando"', () => {
    render(<StatusBadge variant="procesando" />);
    expect(screen.getByText('Procesando')).toBeInTheDocument();
  });

  it('debe renderizar el texto en español para "pendiente"', () => {
    render(<StatusBadge variant="pendiente" />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('debe renderizar el texto en español para "stock-bajo"', () => {
    render(<StatusBadge variant="stock-bajo" />);
    expect(screen.getByText('Stock Bajo')).toBeInTheDocument();
  });

  it('debe tener clases CSS correctas para diferentes variantes', () => {
    const { rerender } = render(<StatusBadge variant="entregado" />);
    
    let badge = screen.getByRole('status');
    expect(badge).toHaveClass('bg-state-success-50', 'text-state-success-800');

    rerender(<StatusBadge variant="stock-bajo" />);
    badge = screen.getByRole('status');
    expect(badge).toHaveClass('bg-state-warning-50', 'text-state-warning-800');
  });

  it('debe tener aria-label correcto', () => {
    render(<StatusBadge variant="entregado" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'Estado: Entregado');
  });

  it('debe manejar diferentes tamaños', () => {
    const { rerender } = render(<StatusBadge variant="entregado" size="sm" />);
    
    let badge = screen.getByRole('status');
    expect(badge).toHaveClass('px-2', 'py-1', 'text-xs');

    rerender(<StatusBadge variant="entregado" size="lg" />);
    badge = screen.getByRole('status');
    expect(badge).toHaveClass('px-4', 'py-2', 'text-base');
  });
});

describe('useStatusVariant', () => {
  it('debe retornar "entregado" para estados relacionados', () => {
    expect(useStatusVariant('entregado')).toBe('entregado');
    expect(useStatusVariant('ENTREGADO')).toBe('entregado');
    expect(useStatusVariant('delivered')).toBe('entregado');
  });

  it('debe retornar "enviado" para estados relacionados', () => {
    expect(useStatusVariant('enviado')).toBe('enviado');
    expect(useStatusVariant('shipped')).toBe('enviado');
  });

  it('debe retornar "procesando" para estados relacionados', () => {
    expect(useStatusVariant('procesando')).toBe('procesando');
    expect(useStatusVariant('processing')).toBe('procesando');
  });

  it('debe retornar "stock-bajo" cuando stock <= stockMinimo', () => {
    expect(useStatusVariant(undefined, 5, 10)).toBe('stock-bajo');
    expect(useStatusVariant(undefined, 10, 10)).toBe('stock-bajo');
  });

  it('debe retornar "stock-alto" cuando stock > stockMinimo * 3', () => {
    expect(useStatusVariant(undefined, 35, 10)).toBe('stock-alto');
  });

  it('debe retornar "stock-normal" para stock normal', () => {
    expect(useStatusVariant(undefined, 20, 10)).toBe('stock-normal');
  });

  it('debe retornar "pendiente" por defecto', () => {
    expect(useStatusVariant()).toBe('pendiente');
    expect(useStatusVariant('unknown')).toBe('pendiente');
  });
});