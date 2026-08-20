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
  { value: 'read', label: 'Read' },
  { value: 'closed', label: 'Closed' },
];

function statusVariant(s) {
  const map = { new: 'accent', read: 'primary', closed: 'default' };
  return map[s] || 'default';
}

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const toast = useAdminToast();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (search) params.q = search;
      if (status) params.status = status;
      const res = await adminApi.get('/contact-messages', { params });
      setMessages(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch {
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  }, [search, status, page, perPage]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const updateStatus = async (id, newStatus) => {
    try {
      await adminApi.put(`/contact-messages/${id}/status`, { status: newStatus });
      toast.success(`Message marked as ${newStatus}`);
      fetchMessages();
      if (selected && selected.id === id) {
        setSelected({ ...selected, status: newStatus });
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const openPanel = (m) => {
    setSelected(m);
    setPanelOpen(true);
    if (m.status === 'new') {
      updateStatus(m.id, 'read');
    }
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setSelected(null), 300);
  };

  return (
    <>
      <AdminTablePage
        title="Contact Messages"
        loading={loading}
        items={messages}
        rowKey="id"
        columns={[
          { label: 'Date', render: (m) => new Date(m.created_at).toLocaleDateString() },
          { label: 'Name', render: (m) => <span className="font-medium">{m.name}</span> },
          { label: 'Email', render: (m) => m.email },
          { label: 'Subject', render: (m) => m.subject || '-' },
          { label: 'Status', render: (m) => <Badge variant={statusVariant(m.status)} size="sm">{m.status}</Badge> },
          {
            label: 'Action',
            render: (m) => (
              <Button variant="ghost" size="sm" onClick={() => openPanel(m)}>
                <Eye size={14} />
                <span>View</span>
              </Button>
            ),
          },
        ]}
        search={{
          value: search,
          placeholder: 'Search by name, email, or subject...',
          onChange: (v) => { setSearch(v); setPage(1); },
        }}
        filters={[
          {
            label: 'Status',
            placeholder: 'All Statuses',
            value: status,
            onChange: (v) => { setStatus(v); setPage(1); },
            options: STATUS_OPTIONS.slice(1),
          },
        ]}
        empty={{
          icon: <Search size={28} />,
          title: 'No contact messages yet',
          hint: 'Messages from the contact form will appear here.',
        }}
        mobileCard={(m) => ({
          title: m.name || 'Unknown',
          subtitle: m.subject || '',
          meta: [
            m.email && { label: '', value: m.email },
          ].filter(Boolean),
          status: { label: m.status, variant: m.status === 'new' ? 'accent' : m.status === 'read' ? 'primary' : 'default' },
          actions: [
            { icon: Eye, label: 'View', onClick: () => openPanel(m) },
          ],
          onClick: () => openPanel(m),
        })}
        pagination={{
          page,
          totalPages,
          total,
          perPage,
          onPerPageChange: (n) => { setPerPage(n); setPage(1); },
          onChange: setPage,
        }}
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
              <h2>{selected.subject || 'No Subject'}</h2>
              <button type="button" className="modal-close" onClick={closePanel}>
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted mb-1">From</div>
                  <div className="text-sm font-medium">{selected.name}</div>
                  <div className="text-xs text-muted">{selected.email}</div>
                </div>
                <div>
                  <div className="text-sm text-muted mb-1">Phone</div>
                  <div className="text-sm font-medium">{selected.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted mb-1">Date</div>
                  <div className="text-sm font-medium">
                    {new Date(selected.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted mb-1">Status</div>
                  <div>
                    <Badge variant={statusVariant(selected.status)} size="sm">
                      {selected.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm font-semibold mb-2">Message</div>
              <div
                className="text-sm leading-relaxed p-4"
                style={{
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                }}
              >
                {selected.message}
              </div>
            </div>

            <div className="divider mb-6" />

            <div className="flex gap-3">
              {selected.status !== 'read' && selected.status !== 'closed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateStatus(selected.id, 'read')}
                >
                  Mark as Read
                </Button>
              )}
              {selected.status !== 'closed' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateStatus(selected.id, 'closed')}
                >
                  Close
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
