import { useState, useEffect, useCallback } from 'react';
import { Search, X, Eye } from 'lucide-react';
import { adminApi } from '../../utils/api';
import Button from '../../components/public/Button';
import Badge from '../../components/public/Badge';
import { useAdminToast } from '../../hooks/useAdminToast';
import AdminTablePage from '../../components/admin/AdminTablePage';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in_discussion', label: 'In Discussion' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted_to_listing', label: 'Converted to Listing' },
];

const ALL_STATUSES = ['new', 'contacted', 'in_discussion', 'approved', 'rejected', 'converted_to_listing'];

function statusVariant(s) {
  const map = {
    new: 'accent',
    contacted: 'primary',
    in_discussion: 'warning',
    approved: 'success',
    rejected: 'error',
    converted_to_listing: 'success',
  };
  return map[s] || 'default';
}

function formatLabel(s) {
  return s.replace(/_/g, ' ');
}

export default function AdminLandlordRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const toast = useAdminToast();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      if (status) params.status = status;
      const res = await adminApi.get('/landlord-requests', { params });
      setRequests(res.data);
    } catch {
      toast.error('Failed to load landlord requests');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (id, newStatus) => {
    try {
      await adminApi.put(`/landlord-requests/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${formatLabel(newStatus)}`);
      fetchRequests();
      if (selected && selected.id === id) {
        setSelected({ ...selected, status: newStatus });
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const openPanel = (r) => {
    setSelected(r);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setSelected(null), 300);
  };

  return (
    <>
      <AdminTablePage
        title="Landlord Requests"
        loading={loading}
        items={requests}
        rowKey="id"
        columns={[
          { label: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString() },
          { label: 'Name', render: (r) => <span className="font-medium">{r.full_name}</span> },
          { label: 'Phone', render: (r) => r.phone },
          { label: 'Email', render: (r) => r.email },
          { label: 'Location', render: (r) => r.property_location },
          { label: 'Type', render: (r) => r.property_type },
          { label: 'Bedrooms', render: (r) => r.bedrooms },
          { label: 'Status', render: (r) => <Badge variant={statusVariant(r.status)} size="sm">{formatLabel(r.status)}</Badge> },
          {
            label: 'Action',
            render: (r) => (
              <Button variant="ghost" size="sm" onClick={() => openPanel(r)}>
                <Eye size={14} />
                <span>View</span>
              </Button>
            ),
          },
        ]}
        search={{
          value: search,
          placeholder: 'Search by name, email, or location...',
          onChange: setSearch,
        }}
        filters={[
          {
            label: 'Status',
            placeholder: 'All Statuses',
            value: status,
            onChange: setStatus,
            options: STATUS_OPTIONS.slice(1),
          },
        ]}
        empty={{
          icon: <Search size={28} />,
          title: 'No landlord requests yet',
          hint: 'Landlord signup requests will appear here.',
        }}
        mobileCard={(r) => ({
          title: r.full_name || 'Unknown',
          subtitle: r.property_location || '',
          meta: [
            r.property_type && { label: 'Type', value: r.property_type },
            r.bedrooms && { label: 'Beds', value: r.bedrooms },
          ].filter(Boolean),
          status: { label: r.status, variant: statusVariant(r.status) },
          actions: [
            { icon: Eye, label: 'View', onClick: () => openPanel(r) },
          ],
          onClick: () => openPanel(r),
        })}
      />

      {/* Slide Panel */}
      <div
        className={`slide-panel-backdrop${panelOpen ? ' open' : ''}`}
        onClick={closePanel}
      />
      <div className={`slide-panel${panelOpen ? ' open' : ''}`}>
        {selected && (
          <>
            <div className="slide-panel-header">
              <h2>{selected.full_name}</h2>
              <button type="button" className="modal-close" onClick={closePanel}>
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-muted mb-1">Phone</div>
                <div className="text-sm font-medium">{selected.phone}</div>
              </div>
              <div>
                <div className="text-sm text-muted mb-1">Email</div>
                <div className="text-sm font-medium">{selected.email}</div>
              </div>
              <div>
                <div className="text-sm text-muted mb-1">Property Location</div>
                <div className="text-sm font-medium">{selected.property_location}</div>
              </div>
              <div>
                <div className="text-sm text-muted mb-1">Building Name</div>
                <div className="text-sm font-medium">{selected.building_name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-muted mb-1">Unit Number</div>
                <div className="text-sm font-medium">{selected.unit_number || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-muted mb-1">Property Type</div>
                <div className="text-sm font-medium">{selected.property_type}</div>
              </div>
              <div>
                <div className="text-sm text-muted mb-1">Bedrooms</div>
                <div className="text-sm font-medium">{selected.bedrooms}</div>
              </div>
              <div>
                <div className="text-sm text-muted mb-1">Furnishing Status</div>
                <div className="text-sm font-medium">{selected.furnishing_status}</div>
              </div>
              <div>
                <div className="text-sm text-muted mb-1">Status</div>
                <div>
                  <Badge variant={statusVariant(selected.status)} size="sm">
                    {formatLabel(selected.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted mb-1">Date</div>
                <div className="text-sm font-medium">
                  {new Date(selected.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {selected.description && (
              <div className="mb-6">
                <div className="text-sm font-semibold mb-2">Description</div>
                <div className="text-sm text-secondary leading-relaxed p-4" style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                  {selected.description}
                </div>
              </div>
            )}

            {selected.message && (
              <div className="mb-6">
                <div className="text-sm font-semibold mb-2">Message</div>
                <div className="text-sm text-secondary leading-relaxed p-4" style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                  {selected.message}
                </div>
              </div>
            )}

            <div className="divider mb-6" />

            <div className="mb-2 text-sm font-semibold">Update Status</div>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((s) => (
                <Button
                  key={s}
                  variant={selected.status === s ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => updateStatus(selected.id, s)}
                >
                  {formatLabel(s)}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
