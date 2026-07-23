import { forwardRef } from 'react';

const variants = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
  danger: 'btn btn-danger',
  accent: 'btn btn-accent',
};

const sizes = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  children,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const cls = [
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth ? 'btn-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={cls}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="btn-loader">
          <svg className="btn-spinner" viewBox="0 0 20 20" fill="none" width="18" height="18">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2.5" strokeDasharray="31.4 31.4" strokeLinecap="round" />
          </svg>
          {children && <span>{children}</span>}
        </span>
      ) : (
        <span className="btn-content">
          {icon && <span className="btn-icon">{icon}</span>}
          {children && <span>{children}</span>}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
