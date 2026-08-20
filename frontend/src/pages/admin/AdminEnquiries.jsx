import { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../../utils/api';
import Button from '../../components/public/Button';
import Badge from '../../components/public/Badge';
import { useAdminToast } from '../../hooks/useAdminToast';
import AdminTablePage from '../../components/admin/AdminTablePage';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const toast = useAdminToast();

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (search) params.q = search;
      if (status) params.status = status;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const res = await adminApi.get('/property-enquiries', { params });
      setEnquiries(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch {
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  }, [search, status, fromDate, toDate, page, perPage]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const updateStatus = async (id, newStatus) => {
    try {
      await adminApi.put(`/property-enquiries/${id}/status`, { status: newStatus });
      toast.success(`Enquiry marked as ${newStatus}`);
      fetchEnquiries();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const statusVariant = (s) => {
    const map = { new: 'accent', contacted: 'primary', closed: 'default' };
    return map[s] || 'default';
  };

  return (
    <>
      <AdminTablePage
        title="Property Enquiries"
        loading={loading}
        items={enquiries}
        rowKey="id"
        columns={[
          { label: 'Date', render: (e) => new Date(e.created_at).toLocaleDateString() },
          { label: 'Name', render: (e) => <span className="font-medium">{e.name}</span> },
          { label: 'Email', render: (e) => e.email },
          { label: 'Phone', render: (e) => e.phone },
          { label: 'Property', render: (e) => e.property_name || 'N/A' },
          { label: 'Check-in', render: (e) => (e.check_in ? new Date(e.check_in).toLocaleDateString() : 'N/A') },
          { label: 'Check-out', render: (e) => (e.check_out ? new Date(e.check_out).toLocaleDateString() : 'N/A') },
          { label: 'Guests', render: (e) => e.guests },
          { label: 'Status', render: (e) => <Badge variant={statusVariant(e.status)} size="sm">{e.status}</Badge> },
          {
            label: 'Actions',
            render: (e) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateStatus(e.id, 'contacted')}
                >
                  Contacted
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateStatus(e.id, 'closed')}
                >
                  Close
                </Button>
              </div>
            ),
          },
        ]}
        search={{
          value: search,
          placeholder: 'Search by name, email, or property...',
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
          {
            label: 'From',
            placeholder: 'From date',
            type: 'date',
            value: fromDate,
            onChange: (v) => { setFromDate(v); setPage(1); },
          },
          {
            label: 'To',
            placeholder: 'To date',
            type: 'date',
            value: toDate,
            onChange: (v) => { setToDate(v); setPage(1); },
          },
        ]}
        empty={{
          icon: <Search size={28} />,
          title: 'No enquiries yet',
          hint: 'Property enquiries from guests will appear here.',
        }}
        mobileCard={(e) => ({
          title: e.name || 'Unknown',
          subtitle: `${e.property_name || 'N/A'}${e.check_in ? ' · ' + new Date(e.check_in).toLocaleDateString() : ''}`,
          meta: [
            e.email && { label: '', value: e.email },
            e.guests && { label: 'Guests', value: e.guests },
          ].filter(Boolean),
          status: { label: e.status, variant: e.status === 'new' ? 'accent' : e.status === 'contacted' ? 'primary' : 'default' },
          actions: [
            e.status !== 'contacted' && { icon: CheckCircle, label: 'Mark Contacted', onClick: () => updateStatus(e.id, 'contacted') },
            e.status !== 'closed' && { icon: XCircle, label: 'Close', onClick: () => updateStatus(e.id, 'closed') },
          ].filter(Boolean),
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
    </>
  );
}
