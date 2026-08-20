import { forwardRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Wifi,
  ClipboardList,
  Newspaper,
  Mail,
  MessageSquare,
  User,
  Settings,
  Globe,
  LogOut,
  MapPinned,
  Sun,
  Moon,
  ChevronLeft,
  ScanLine,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Admin sidebar navigation component.
 *
 * @param {Object} props
 * @param {boolean} [props.collapsed=false] - Whether sidebar is collapsed (icons only).
 * @param {string} [props.className] - Additional CSS class names.
 * @param {Object} [props.style] - Inline styles override.
 * @param {Function} [props.onToggle] - Callback when collapse toggle is clicked (used from parent).
 */
const AdminSidebar = forwardRef(function AdminSidebar(
  { collapsed = false, isMobileOpen = false, onCloseMobile, className = '', style, ...props },
  ref,
) {
  const navigate = useNavigate();
  const { theme, changePreference } = useTheme();
  const user = JSON.parse(localStorage.getItem('adminUser') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/smart-scan', icon: ScanLine, label: 'Smart Scan' },
    { to: '/admin/units', icon: Building2, label: 'Units' },
    { to: '/admin/listings', icon: ClipboardList, label: 'Listings' },
    { to: '/admin/buildings', icon: Building2, label: 'Buildings' },
    { to: '/admin/communities', icon: MapPinned, label: 'Communities' },
    { to: '/admin/landlords', icon: User, label: 'Landlords' },
    { to: '/admin/amenities', icon: Wifi, label: 'Amenities' },
    { to: '/admin/landlord-requests', icon: ClipboardList, label: 'Landlord Requests' },
    { to: '/admin/enquiries', icon: Mail, label: 'Property Enquiries' },
    { to: '/admin/contact-messages', icon: MessageSquare, label: 'Contact Messages' },
    { to: '/admin/admins', icon: User, label: 'Admin Users' },
    { to: '/admin/articles', icon: Newspaper, label: 'Area Articles' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside
      ref={ref}
      className={`admin-sidebar${collapsed ? ' collapsed' : ''}${isMobileOpen ? ' mobile-open' : ''}${className ? ' ' + className : ''}`}
      style={style}
      {...props}
    >
      {/* Logo / Brand */}
      <div className="admin-sidebar-logo" style={{ position: 'relative' }}>
        {collapsed ? (
          <img
            src={theme === 'dark' ? '/ahh white logo.webp' : '/ahh black logo.png'}
            alt="AHH"
            className="admin-sidebar-logo-img admin-sidebar-logo-img--collapsed"
          />
        ) : (
          <>
            <img
              src={theme === 'dark' ? '/ahh white logo.webp' : '/ahh black logo.png'}
              alt="Authentic Holiday Homes"
              className="admin-sidebar-logo-img"
            />
            <div className="admin-logo-sub">Admin Dashboard</div>
          </>
        )}
        <button
          type="button"
          className="admin-sidebar-collapse-btn"
          onClick={props.onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={14} style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>

      {/* User Info */}
      <div className="admin-sidebar-user">
        <div className="admin-sidebar-user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
        </div>
        {!collapsed && (
          <div className="admin-sidebar-user-info">
            <div className="admin-sidebar-user-name">{user?.name || 'Admin'}</div>
            <div className="admin-sidebar-user-email">{user?.email || ''}</div>
          </div>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to + (item.end ? '-end' : '')}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `admin-nav-item${isActive ? ' active' : ''}`
            }
            onClick={onCloseMobile}
          >
            <item.icon size={18} strokeWidth={1.75} className="admin-nav-icon" />
            {!collapsed && <span className="admin-nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="admin-sidebar-footer">
        <div className="admin-nav-divider" />
        <button
          type="button"
          onClick={() => changePreference(theme === 'dark' ? 'light' : 'dark')}
          className="admin-nav-item"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={1.75} className="admin-nav-icon" /> : <Moon size={18} strokeWidth={1.75} className="admin-nav-icon" />}
          {!collapsed && <span className="admin-nav-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-nav-item"
        >
          <Globe size={18} strokeWidth={1.75} className="admin-nav-icon" />
          {!collapsed && <span className="admin-nav-label">View Website</span>}
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="admin-nav-item admin-nav-item--danger"
        >
          <LogOut size={18} strokeWidth={1.75} className="admin-nav-icon" />
          {!collapsed && <span className="admin-nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
});

export default AdminSidebar;
