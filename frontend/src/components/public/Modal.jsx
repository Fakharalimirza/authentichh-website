/**
 * @fileoverview Accessible modal dialog with backdrop, Escape-key dismissal, and scroll lock.
 */

import { forwardRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * @param {{ isOpen: boolean, onClose: () => void, title?: string, children?: React.ReactNode, className?: string }} props
 */
const Modal = forwardRef(({ isOpen, onClose, title, children, className = '', ...props }, ref) => {
  const [modalId] = useState(() => `modal-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div ref={ref} className={`modal ${className}`} role="dialog" aria-modal="true" {...props}>
        <div className="modal-header">
          <h2 id={modalId} className="modal-title">{title}</h2>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal;
