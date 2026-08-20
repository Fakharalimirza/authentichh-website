/**
 * @fileoverview Reusable Card component with variant, padding, and hover support.
 */

import { forwardRef } from 'react';

const variants = {
  default: 'card',
  elevated: 'card card-elevated',
  bordered: 'card card-bordered',
  flat: 'card card-flat',
};

/**
 * @param {{ variant?: 'default'|'elevated'|'bordered'|'flat', padding?: boolean, hover?: boolean, className?: string, children?: React.ReactNode, as?: React.ElementType }} props
 */
const Card = forwardRef(({
  variant = 'default',
  padding = true,
  hover = false,
  className = '',
  children,
  as: Tag = 'div',
  ...props
}, ref) => {
  const cls = [
    variants[variant] || variants.default,
    padding ? '' : 'card-no-padding',
    hover ? 'card-hover' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag ref={ref} className={cls} {...props}>
      {children}
    </Tag>
  );
});

Card.displayName = 'Card';

export default Card;
