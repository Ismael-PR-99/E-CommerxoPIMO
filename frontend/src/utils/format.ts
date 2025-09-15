/**
 * Utilidades de formato para la aplicación E-Commerce PIMO
 * Todas las utilidades están configuradas para español (es-ES)
 */

/**
 * Formatea un número como moneda en euros
 * @param value - Valor numérico a formatear
 * @param currency - Código de moneda (por defecto EUR)
 * @returns String formateado como "12,50 €"
 */
export function fmtCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formatea una fecha en formato español
 * @param date - Fecha a formatear (Date | string | number)
 * @param format - Tipo de formato: 'short', 'medium', 'long', 'full'
 * @returns String formateado como "15/09/2025" o "15 de septiembre de 2025"
 */
export function fmtDate(
  date: Date | string | number, 
  format: 'short' | 'medium' | 'long' | 'full' = 'short'
): string {
  const dateObj = new Date(date);
  
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  };

  return new Intl.DateTimeFormat('es-ES', formatOptions[format]).format(dateObj);
}

/**
 * Formatea una fecha y hora en formato español
 * @param date - Fecha a formatear
 * @param includeSeconds - Si incluir segundos en la hora
 * @returns String formateado como "15/09/2025, 14:30" o "15/09/2025, 14:30:45"
 */
export function fmtDateTime(
  date: Date | string | number, 
  includeSeconds: boolean = false
): string {
  const dateObj = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' })
  };

  return new Intl.DateTimeFormat('es-ES', options).format(dateObj);
}

/**
 * Formatea un peso en kilogramos
 * @param weight - Peso en kg
 * @returns String formateado como "2,5 kg"
 */
export function fmtWeight(weight: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(weight) + ' kg';
}

/**
 * Formatea un número como porcentaje
 * @param value - Valor entre 0 y 1 (0.25 = 25%)
 * @returns String formateado como "25%"
 */
export function fmtPercentage(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Formatea un número con separadores de miles
 * @param value - Número a formatear
 * @returns String formateado como "1.234.567"
 */
export function fmtNumber(value: number): string {
  return new Intl.NumberFormat('es-ES').format(value);
}