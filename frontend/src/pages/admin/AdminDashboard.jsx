import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  FileEdit,
  Mail,
  ClipboardList,
  MessageSquare,
  PlusCircle,
  List,
  Users,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/public/Button';
import Badge from '../../components/public/Badge';

const statCards = [
  { key: 'totalProperties', label: 'Total Properties', icon: Building2, colorClass: 'primary', badgeKey: null },
  { key: 'publishedProperties', label: 'Published', icon: CheckCircle2, colorClass: 'success', badgeKey: null },
  { key: 'draftProperties', label: 'Draft', icon: FileEdit, colorClass: 'warning', badgeKey: null },
  { key: 'totalEnquiries', label: 'Property Enquiries', icon: Mail, colorClass: 'accent', badgeKey: 'newEnquiries' },
  { key: 'landlordRequests', label: 'Landlord Requests', icon: ClipboardList, colorClass: 'info', badgeKey: 'newLandlordRequests' },
  { key: 'contactMessages', label: 'Contact Messages', icon: MessageSquare, colorClass: 'info', badgeKey: 'newContactMessages' },
];

const quickActions = [
  { label: 'Add New Property', to: '/admin/listings/new', icon: PlusCircle, description: 'Create a new holiday home listing' },
  { label: 'Manage Properties', to: '/admin/listings', icon: List, description: 'View, edit, or remove existing properties' },
  { label: 'Landlord Requests', to: '/admin/landlord-requests', icon: Users, description: 'Review and approve landlord signups' },
  { label: 'Property Enquiries', to: '/admin/enquiries', icon: MessageCircle, description: 'Respond to guest enquiries' },
  { label: 'Contact Messages', to: '/admin/contact-messages', icon: MessageSquare, description: 'Read messages from the contact form' },
];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = () => {
    setLoading(true);
    setError(null);
    adminApi
      .get('/dashboard/summary')
      .then((res) => {
        setSummary(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading && (
        <div className="admin-cards">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="admin-stat-card">
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)' }} />
              <div className="admin-stat-content">
                <div className="skeleton" style={{ width: '60%', height: 28, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: '40%', height: 14 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <RefreshCw size={24} />
          </div>
          <h3>Failed to Load Dashboard</h3>
          <p>{error}</p>
          <Button variant="primary" onClick={fetchSummary}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && summary && (
        <div className="admin-cards">
          {statCards.map((card) => {
            const Icon = card.icon;
            const value = summary[card.key];
            const badgeCount = card.badgeKey ? summary[card.badgeKey] : null;

            return (
              <div key={card.key} className="admin-stat-card">
                <div className={`admin-stat-icon ${card.colorClass}`}>
                  <Icon size={22} />
                </div>
                <div className="admin-stat-content">
                  <div className="admin-stat-value">{value ?? 0}</div>
                  <div className="admin-stat-label">{card.label}</div>
                  {badgeCount != null && badgeCount > 0 && (
                    <div className="mt-4">
                      <Badge variant={card.colorClass === 'accent' ? 'accent' : 'info'} size="sm">
                        {badgeCount} New
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && (
        <div className="admin-content-card">
          <div className="admin-content-card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="admin-dashboard-actions grid grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="card card-elevated card-hover flex flex-col gap-3"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="admin-stat-icon primary">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="font-semibold">{action.label}</div>
                    <div className="text-sm text-muted">{action.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}