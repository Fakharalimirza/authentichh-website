/**
 * @fileoverview Admin top header bar — shows page title, action buttons, hamburger toggle.
 */

import { Menu } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Button from '../public/Button';

export default function AdminHeader({ title, actions, onToggleSidebar }) {
  const { user } = useAdminAuth();

  return (
    <div className="admin-header-bar">
      <div className="flex items-center gap-3">
        <button type="button" className="btn-icon-only admin-header-menu-btn" onClick={onToggleSidebar} aria-label="Toggle menu" style={onToggleSidebar ? {} : { display: 'none' }}>
          <Menu size={20} />
        </button>
        <h2 className="admin-header-title">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {actions?.map((action, i) => (
          <Button key={i} variant={action.variant || 'primary'} onClick={action.onClick} icon={action.icon} disabled={action.disabled}>
            {action.label}
          </Button>
        ))}
        {user && (
          <div className="flex items-center gap-2">
            <div className="admin-sidebar-user-avatar">
              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span className="admin-header-user-name">{user.name || user.email}</span>
          </div>
        )}
      </div>
    </div>
  );
}
