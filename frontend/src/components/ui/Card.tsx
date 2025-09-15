import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-lg ring-1 ring-black/5 ${className}`}
    >
      {children}
    </div>
  );
}
