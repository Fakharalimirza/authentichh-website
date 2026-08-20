import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Mail,
  MoreHorizontal,
} from 'lucide-react';

const tabs = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/listings', icon: Building2, label: 'Listings' },
  { to: null, icon: PlusCircle, label: 'Add', isAdd: true },
  { to: '/admin/enquiries', icon: Mail, label: 'Messages' },
  { to: null, icon: MoreHorizontal, label: 'More', isMore: true },
];

export default function BottomTabBar({ onOpenMore }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (to) => {
    if (!to) return false;
    if (to === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="bottom-tab-bar">
      {tabs.map((tab, i) => {
        if (tab.isAdd) {
          return (
            <button
              key={i}
              type="button"
              className="bottom-tab-btn bottom-tab-btn--add"
              onClick={() => navigate('/admin/listings/new')}
              aria-label="Add new unit"
            >
              <div className="bottom-tab-add-icon">
                <PlusCircle size={28} />
              </div>
            </button>
          );
        }
        if (tab.isMore) {
          return (
            <button
              key={i}
              type="button"
              className={`bottom-tab-btn${onOpenMore ? '' : ''}`}
              onClick={onOpenMore}
              aria-label="More options"
            >
              <MoreHorizontal size={22} />
              <span className="bottom-tab-label">{tab.label}</span>
            </button>
          );
        }
        return (
          <button
            key={i}
            type="button"
            className={`bottom-tab-btn${isActive(tab.to) ? ' active' : ''}`}
            onClick={() => navigate(tab.to)}
          >
            <tab.icon size={22} />
            <span className="bottom-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
