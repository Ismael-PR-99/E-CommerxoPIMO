import clsx from 'clsx';

export type CardVariant = 'metric' | 'content';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
}

export function Card({
  title,
  subtitle,
  children,
  actions,
  variant = 'content',
  className,
  onClick,
  isClickable = false
}: CardProps) {
  const cardClasses = clsx(
    // Base styles
    'bg-white rounded-card shadow-card border border-gray-100',
    'transition-all duration-200',
    
    // Interactive states
    {
      'hover:shadow-card-hover cursor-pointer': isClickable || onClick,
      'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2': onClick,
    },
    
    // Variant styles
    {
      'p-6': variant === 'content',
      'p-4': variant === 'metric',
    },
    
    className
  );

  const Component = onClick ? 'button' : 'div';

  return (
    <Component 
      className={cardClasses}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {/* Header */}
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={clsx(
                'font-semibold text-gray-900 truncate',
                variant === 'metric' ? 'text-sm' : 'text-lg'
              )}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={clsx(
                'text-gray-500 mt-1',
                variant === 'metric' ? 'text-xs' : 'text-sm'
              )}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex-shrink-0 ml-4">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {children && (
        <div className={clsx(
          variant === 'metric' && 'text-center'
        )}>
          {children}
        </div>
      )}
    </Component>
  );
}

// Componente especializado para métricas
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  actions,
  className
}: MetricCardProps) {
  return (
    <Card
      title={title}
      subtitle={subtitle}
      actions={actions}
      variant="metric"
      className={className}
    >
      <div className="flex items-center justify-center space-x-3">
        {icon && (
          <div className="flex-shrink-0 text-brand-500">
            {icon}
          </div>
        )}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {value}
          </div>
          {trend && (
            <div className={clsx(
              'text-sm font-medium mt-1',
              trend.isPositive ? 'text-state-success-700' : 'text-state-error-700'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Componente para cards de contenido con layout predefinido
interface ContentCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export function ContentCard({
  title,
  subtitle,
  children,
  actions,
  className,
  isLoading = false
}: ContentCardProps) {
  if (isLoading) {
    return (
      <Card variant="content" className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={title}
      subtitle={subtitle}
      actions={actions}
      variant="content"
      className={className}
    >
      {children}
    </Card>
  );
}

export default Card;
