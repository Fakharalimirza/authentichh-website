/**
 * @fileoverview Confirmation dialog built on top of Modal, with a variant-styled confirm button.
 */

import Modal from '../public/Modal';
import Button from '../public/Button';

/** @param {{ open: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, confirmLabel?: string, variant?: string }} */
export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger' }) {
  return (
    <Modal isOpen={open} onClose={onClose} title={title}>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
        {message}
      </p>
      <div className="confirm-actions">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
