import { forwardRef } from 'react';

const sizes = {
  sm: 'input-sm',
  md: 'input-md',
  lg: 'input-lg',
  xl: 'input-xl',
};

const Input = forwardRef(({ error = false, disabled = false, size = 'md', className = '', ...props }, ref) => {
  const sizeClass = sizes[size] || sizes.md;
  const cls = [
    'input',
    sizeClass,
    error ? 'error' : '',
    disabled ? 'disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="input-wrapper">
      <input ref={ref} className={cls} disabled={disabled} {...props} />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
