import { describe, it, expect } from 'vitest';
import { fmtCurrency, fmtDate, fmtWeight, fmtNumber, fmtPercentage } from '../src/utils/format';

// Nota: Intl.NumberFormat en es-ES introduce un espacio NO-BREAK (\u00A0) antes del símbolo de moneda o porcentaje.
// Ajustamos las expectativas para reflejar el valor real en el entorno de test.

const NBSP = '\u00A0';

describe('Utilidades de formato', () => {
  describe('fmtCurrency', () => {
    it('debe formatear moneda en euros correctamente', () => {
      expect(fmtCurrency(12.5)).toBe(`12,50${NBSP}€`);
      expect(fmtCurrency(1234.56)).toBe(`1234,56${NBSP}€`);
      expect(fmtCurrency(0)).toBe(`0,00${NBSP}€`);
      expect(fmtCurrency(999)).toBe(`999,00${NBSP}€`);
    });

    it('debe manejar números decimales', () => {
      expect(fmtCurrency(12.567)).toBe(`12,57${NBSP}€`);
      expect(fmtCurrency(12.001)).toBe(`12,00${NBSP}€`);
    });

    it('debe permitir diferentes monedas', () => {
      expect(fmtCurrency(100, 'USD')).toBe(`100,00${NBSP}US$`);
    });
  });

  describe('fmtDate', () => {
    const testDate = new Date('2025-09-15T14:30:45');

    it('debe formatear fecha en formato corto', () => {
      expect(fmtDate(testDate, 'short')).toBe('15/09/2025');
    });

    it('debe formatear fecha en formato medio', () => {
      expect(fmtDate(testDate, 'medium')).toBe('15 sept 2025');
    });

    it('debe formatear fecha en formato largo', () => {
      // Dependiendo de implementación, mes podría ser "septiembre"
      expect(fmtDate(testDate, 'long')).toBe('15 de septiembre de 2025');
    });

    it('debe usar formato corto por defecto', () => {
      expect(fmtDate(testDate)).toBe('15/09/2025');
    });

    it('debe manejar strings de fecha', () => {
      expect(fmtDate('2025-09-15')).toBe('15/09/2025');
    });
  });

  describe('fmtWeight', () => {
    it('debe formatear pesos correctamente', () => {
      expect(fmtWeight(2.5)).toBe('2,5 kg');
      expect(fmtWeight(1)).toBe('1,0 kg');
      expect(fmtWeight(0.75)).toBe('0,75 kg');
    });
  });

  describe('fmtNumber', () => {
    it('debe formatear números con separadores de miles', () => {
      expect(fmtNumber(1234)).toBe('1234');
      expect(fmtNumber(1234567)).toBe('1.234.567');
      expect(fmtNumber(100)).toBe('100');
    });
  });

  describe('fmtPercentage', () => {
    it('debe formatear porcentajes correctamente', () => {
      expect(fmtPercentage(0.25)).toBe(`25${NBSP}%`);
      expect(fmtPercentage(0.1)).toBe(`10${NBSP}%`);
      expect(fmtPercentage(1)).toBe(`100${NBSP}%`);
      expect(fmtPercentage(0.125)).toBe(`12,5${NBSP}%`);
    });
  });
});