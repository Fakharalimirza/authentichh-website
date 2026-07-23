import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetch = () => {
    adminApi.get('/property-enquiries')
      .then(r => setEnquiries(r.data))
      .catch(() => navigate('/admin/login'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await adminApi.put(`/property-enquiries/${id}/status`, { status });
      fetch();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const statusBadge = (status) => {
    const map = { new: 'accent', contacted: 'primary', closed: 'default' };
    return <Badge variant={map[status] || 'default'} size="sm">{status}</Badge>;
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-header"><h1>Property Enquiries</h1></div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Property</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
              ) : enquiries.length === 0 ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: 40 }}>No enquiries yet.</td></tr>
              ) : enquiries.map(e => (
                <tr key={e.id}>
                  <td>{new Date(e.created_at).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{e.name}</td>
                  <td>{e.email}</td>
                  <td>{e.phone}</td>
                  <td>{e.property_name || 'N/A'}</td>
                  <td>{e.check_in ? new Date(e.check_in).toLocaleDateString() : 'N/A'}</td>
                  <td>{e.check_out ? new Date(e.check_out).toLocaleDateString() : 'N/A'}</td>
                  <td>{e.guests}</td>
                  <td>{statusBadge(e.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(e.id, 'contacted')}>Contacted</Button>
                      <Button variant="outline" size="sm" onClick={() => updateStatus(e.id, 'closed')}>Close</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
