import clsx from 'clsx';

export type StatusVariant = 
  | 'entregado' 
  | 'enviado' 
  | 'procesando' 
  | 'pendiente' 
  | 'stock-bajo'
  | 'cancelado'
  | 'stock-normal'
  | 'stock-alto';

interface StatusBadgeProps {
  variant: StatusVariant;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusVariant, {
  label: string;
  className: string;
}> = {
  entregado: {
    label: 'Entregado',
    className: 'bg-state-success-50 text-state-success-800 border-state-success-100'
  },
  enviado: {
    label: 'Enviado',
    className: 'bg-state-info-50 text-state-info-800 border-state-info-100'
  },
  procesando: {
    label: 'Procesando',
    className: 'bg-state-warning-50 text-state-warning-800 border-state-warning-100'
  },
  pendiente: {
    label: 'Pendiente',
    className: 'bg-state-neutral-50 text-state-neutral-800 border-state-neutral-100'
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-state-error-50 text-state-error-800 border-state-error-100'
  },
  'stock-bajo': {
    label: 'Stock Bajo',
    className: 'bg-state-warning-50 text-state-warning-800 border-state-warning-100'
  },
  'stock-normal': {
    label: 'Stock Normal',
    className: 'bg-state-success-50 text-state-success-800 border-state-success-100'
  },
  'stock-alto': {
    label: 'Stock Alto',
    className: 'bg-brand-50 text-brand-800 border-brand-100'
  }
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
};

export function StatusBadge({ 
  variant, 
  className,
  size = 'md'
}: StatusBadgeProps) {
  const config = statusConfig[variant];
  
  if (!config) {
    console.warn(`StatusBadge: variant "${variant}" no encontrada`);
    return null;
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-card border font-medium min-h-touch',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500',
        'transition-colors duration-200',
        config.className,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={`Estado: ${config.label}`}
    >
      {config.label}
    </span>
  );
}

// Hook para obtener el estado basado en condiciones
export function useStatusVariant(
  status?: string,
  stock?: number,
  stockMinimo?: number
): StatusVariant {
  // Prioridad 1: Estado explícito de pedido/orden
  if (status) {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('entregado') || normalizedStatus === 'delivered') {
      return 'entregado';
    }
    if (normalizedStatus.includes('enviado') || normalizedStatus === 'shipped') {
      return 'enviado';
    }
    if (normalizedStatus.includes('procesando') || normalizedStatus === 'processing') {
      return 'procesando';
    }
    if (normalizedStatus.includes('cancelado') || normalizedStatus === 'cancelled') {
      return 'cancelado';
    }
    return 'pendiente';
  }

  // Prioridad 2: Estado de stock
  if (typeof stock === 'number' && typeof stockMinimo === 'number') {
    if (stock <= stockMinimo) {
      return 'stock-bajo';
    }
    if (stock > stockMinimo * 3) {
      return 'stock-alto';
    }
    return 'stock-normal';
  }

  return 'pendiente';
}

export default StatusBadge;