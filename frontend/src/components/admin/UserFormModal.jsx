/**
 * @fileoverview Modal form for creating / editing admin users.
 */

import { useState } from 'react';
import Modal from '../public/Modal';
import Input from '../public/Input';
import Button from '../public/Button';

const ROLES = ['admin', 'manager', 'editor'];

export default function UserFormModal({ isOpen, onClose, editing, onSave }) {
  const [form, setForm] = useState({
    name: editing?.name || '',
    email: editing?.email || '',
    password: '',
    role: editing?.role || 'admin',
    is_active: editing?.is_active ?? 1,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      await onSave(payload, editing);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Admin User' : 'Add Admin User'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="input-label">Name <span className="input-required">*</span></label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required />
        </div>
        <div>
          <label className="input-label">Email <span className="input-required">*</span></label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" required />
        </div>
        <div>
          <label className="input-label">Password {!editing && <span className="input-required">*</span>}</label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Leave blank to keep current' : 'Password'} />
        </div>
        <div>
          <label className="input-label">Role</label>
          <div className="input-wrapper">
            <select className="input-element" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="user_is_active" checked={!!form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
            style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }} />
          <label htmlFor="user_is_active" className="text-sm" style={{ cursor: 'pointer' }}>Active</label>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}
