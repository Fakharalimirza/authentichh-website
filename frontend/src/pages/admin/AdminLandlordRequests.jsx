import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function AdminLandlordRequests() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = () => {
    adminApi.get('/landlord-requests')
      .then(r => setRequests(r.data))
      .catch(() => navigate('/admin/login'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await adminApi.put(`/landlord-requests/${id}/status`, { status });
      fetchRequests();
      setSelected(null);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const statusVariant = (status) => {
    const map = {
      new: 'accent', contacted: 'primary', in_discussion: 'warning',
      approved: 'success', rejected: 'error', converted_to_listing: 'success',
    };
    return map[status] || 'default';
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-header"><h1>Landlord Requests</h1></div>

        {selected && (
          <div style={{
            background: 'var(--color-surface)', borderRadius: 12, padding: 30,
            marginBottom: 30, border: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2>{selected.full_name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Close</Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
              <div><strong>Phone:</strong> {selected.phone}</div>
              <div><strong>Email:</strong> {selected.email}</div>
              <div><strong>Property Location:</strong> {selected.property_location}</div>
              <div><strong>Building:</strong> {selected.building_name || 'N/A'}</div>
              <div><strong>Unit:</strong> {selected.unit_number || 'N/A'}</div>
              <div><strong>Type:</strong> {selected.property_type}</div>
              <div><strong>Bedrooms:</strong> {selected.bedrooms}</div>
              <div><strong>Furnishing:</strong> {selected.furnishing_status}</div>
              <div><strong>Status:</strong> <Badge variant={statusVariant(selected.status)} size="sm">{selected.status.replace(/_/g, ' ')}</Badge></div>
              <div><strong>Date:</strong> {new Date(selected.created_at).toLocaleDateString()}</div>
            </div>
            {selected.description && <div><strong>Description:</strong><p style={{ marginTop: 5, color: 'var(--color-text-secondary)' }}>{selected.description}</p></div>}
            {selected.message && <div><strong>Message:</strong><p style={{ marginTop: 5, color: 'var(--color-text-secondary)' }}>{selected.message}</p></div>}
            <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['new', 'contacted', 'in_discussion', 'approved', 'rejected', 'converted_to_listing'].map(s => (
                <Button key={s} variant={selected.status === s ? 'primary' : 'ghost'} size="sm" onClick={() => updateStatus(selected.id, s)}>
                  {s.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Location</th>
                <th>Type</th>
                <th>Bedrooms</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40 }}>No landlord requests yet.</td></tr>
              ) : requests.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{r.full_name}</td>
                  <td>{r.phone}</td>
                  <td>{r.email}</td>
                  <td>{r.property_location}</td>
                  <td>{r.property_type}</td>
                  <td>{r.bedrooms}</td>
                  <td><Badge variant={statusVariant(r.status)} size="sm">{r.status.replace(/_/g, ' ')}</Badge></td>
                  <td><Button variant="ghost" size="sm" onClick={() => setSelected(r)}>View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
