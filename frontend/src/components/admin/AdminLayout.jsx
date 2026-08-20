/**
 * @fileoverview Admin layout shell — wraps page content with sidebar, header, and auth guard.
 */

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../shared/AdminSidebar';
import AdminHeader from './AdminHeader';
import BottomTabBar from './BottomTabBar';
import MobileMoreSheet from './MobileMoreSheet';
import '../../styles/admin/admin.css';

export default function AdminLayout({ title, actions, children }) {
  const { isAuthenticated, loading, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (!isMobile) setCollapsed(c => !c);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-main" style={{ marginLeft: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-layout">
      {!isMobile && (
        <AdminSidebar
          collapsed={collapsed}
          onToggle={handleToggleSidebar}
        />
      )}
      <div className={`admin-main${!isMobile && collapsed ? ' sidebar-collapsed' : ''}`}>
        <AdminHeader title={title} actions={actions} onToggleSidebar={isMobile ? undefined : handleToggleSidebar} />
        <div className="admin-content">
          {children}
        </div>
        <footer className="admin-footer">
          <span>&copy; {new Date().getFullYear()} Authentic Holiday Homes. All rights reserved.</span>
        </footer>
      </div>
      {isMobile && (
        <>
          <BottomTabBar onOpenMore={() => setMoreOpen(true)} />
          <MobileMoreSheet
            open={moreOpen}
            onClose={() => setMoreOpen(false)}
            onLogout={handleLogout}
          />
        </>
      )}
    </div>
  );
}
