/**
 * @fileoverview Inline badge / tag component with color variants and sizes.
 */

const variants = {
  default: 'badge badge-default',
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  error: 'badge badge-error',
  info: 'badge badge-info',
  accent: 'badge badge-accent',
  primary: 'badge badge-primary',
};

const sizes = {
  sm: 'badge-sm',
  md: 'badge-md',
  lg: 'badge-lg',
};

/**
 * @param {{ variant?: 'default'|'success'|'warning'|'error'|'info'|'accent'|'primary', size?: 'sm'|'md'|'lg', children?: React.ReactNode, className?: string }} props
 */
export default function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
  ...props
}) {
  const cls = [
    variants[variant] || variants.default,
    sizes[size] || sizes.sm,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={cls} {...props}>
      {children}
    </span>
  );
}
