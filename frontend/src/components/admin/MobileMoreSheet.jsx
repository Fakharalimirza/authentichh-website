import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPinned,
  User,
  Wifi,
  ClipboardList,
  MessageSquare,
  Settings,
  Globe,
  Sun,
  Moon,
  LogOut,
  X,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function MobileMoreSheet({ open, onClose, onLogout }) {
  const navigate = useNavigate();
  const { theme, changePreference } = useTheme();

  const items = [
    { to: '/admin/buildings', icon: Building2, label: 'Buildings' },
    { to: '/admin/communities', icon: MapPinned, label: 'Communities' },
    { to: '/admin/landlords', icon: User, label: 'Landlords' },
    { to: '/admin/amenities', icon: Wifi, label: 'Amenities' },
    { to: '/admin/landlord-requests', icon: ClipboardList, label: 'Landlord Requests' },
    { to: '/admin/contact-messages', icon: MessageSquare, label: 'Contact Messages' },
    { to: '/admin/admins', icon: User, label: 'Admin Users' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const handleNav = (to) => {
    navigate(to);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="mobile-more-backdrop" onClick={onClose} />
      <div className={`mobile-more-sheet${open ? ' open' : ''}`}>
        <div className="mobile-more-sheet-header">
          <h3>More</h3>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="mobile-more-sheet-body">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              className="mobile-more-item"
              onClick={() => handleNav(item.to)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="admin-nav-divider" />
          <button
            type="button"
            className="mobile-more-item"
            onClick={() => { changePreference(theme === 'dark' ? 'light' : 'dark'); onClose(); }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-more-item"
            onClick={onClose}
          >
            <Globe size={20} />
            <span>View Website</span>
          </a>
          <button
            type="button"
            className="mobile-more-item mobile-more-item--danger"
            onClick={() => { onLogout(); onClose(); }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
