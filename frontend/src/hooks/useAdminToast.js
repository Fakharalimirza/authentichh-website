/**
 * @fileoverview Convenience wrapper around the toast system exposing .success(), .error(), etc.
 */

import { useToast } from '../components/public/Toast';

/** Returns an object with { success, error, warning, info } helper methods. */
export function useAdminToast() {
  const { addToast } = useToast();
  return {
    success: (msg) => addToast({ type: 'success', message: msg }),
    error: (msg) => addToast({ type: 'error', message: msg }),
    warning: (msg) => addToast({ type: 'warning', message: msg }),
    info: (msg) => addToast({ type: 'info', message: msg }),
  };
}
