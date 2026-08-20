/**
 * @fileoverview Modal for resetting an admin user's password.
 */

import { useState } from 'react';
import Modal from '../public/Modal';
import Input from '../public/Input';
import Button from '../public/Button';

export default function ResetPasswordModal({ isOpen, onClose, target, onReset }) {
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleReset = async () => {
    if (!newPassword.trim()) return;
    setSaving(true);
    try {
      await onReset(target, newPassword);
      setNewPassword('');
    } finally {
      setSaving(false);
    }
  };

  if (!target) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); setNewPassword(''); }} title="Reset Password">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-secondary">
          Set a new password for <strong>{target.name}</strong> ({target.email}).
        </p>
        <div>
          <label className="input-label">New Password <span className="input-required">*</span></label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="ghost" type="button" onClick={() => { onClose(); setNewPassword(''); }}>Cancel</Button>
          <Button variant="primary" type="button" onClick={handleReset} loading={saving}>Reset Password</Button>
        </div>
      </div>
    </Modal>
  );
}
