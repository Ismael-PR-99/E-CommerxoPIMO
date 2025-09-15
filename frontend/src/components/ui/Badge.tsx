import React from 'react';

type Variant = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
}

const variantMap: Record<Variant, string> = {
  success: 'bg-[var(--success-bg)] text-[var(--success-fg)]',
  warning: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]',
  info:    'bg-[var(--info-bg)] text-[var(--info-fg)]',
  danger:  'bg-[var(--danger-bg)] text-[var(--danger-fg)]',
  neutral: 'bg-gray-100 text-gray-800',
};

export function Badge({ children, className = '', variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
