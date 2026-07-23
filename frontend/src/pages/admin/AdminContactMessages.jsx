import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetch = () => {
    adminApi.get('/contact-messages')
      .then(r => setMessages(r.data))
      .catch(() => navigate('/admin/login'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await adminApi.put(`/contact-messages/${id}/status`, { status });
      fetch();
      if (selected && selected.id === id) setSelected(null);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-header"><h1>Contact Messages</h1></div>

        {selected && (
          <div style={{
            background: 'var(--color-surface)', borderRadius: 12, padding: 30,
            marginBottom: 30, border: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2>{selected.subject || 'No Subject'}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Close</Button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div><strong>From:</strong> {selected.name} ({selected.email})</div>
              <div><strong>Phone:</strong> {selected.phone || 'N/A'}</div>
              <div><strong>Date:</strong> {new Date(selected.created_at).toLocaleString()}</div>
              <div><strong>Status:</strong> <Badge variant={selected.status === 'new' ? 'accent' : selected.status === 'read' ? 'primary' : 'default'} size="sm">{selected.status}</Badge></div>
            </div>
            <div style={{
              padding: 20, background: 'var(--color-bg)', borderRadius: 8, lineHeight: 1.8,
              color: 'var(--color-text)',
            }}>{selected.message}</div>
            <div style={{ marginTop: 15, display: 'flex', gap: 8 }}>
              <Button variant="ghost" size="sm" onClick={() => { updateStatus(selected.id, 'read'); setSelected({...selected, status: 'read'}); }}>Mark as Read</Button>
              <Button variant="outline" size="sm" onClick={() => updateStatus(selected.id, 'closed')}>Close</Button>
            </div>
          </div>
        )}

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
              ) : messages.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No contact messages yet.</td></tr>
              ) : messages.map(m => (
                <tr key={m.id}>
                  <td>{new Date(m.created_at).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{m.name}</td>
                  <td>{m.email}</td>
                  <td>{m.subject || '-'}</td>
                  <td><Badge variant={m.status === 'new' ? 'accent' : m.status === 'read' ? 'primary' : 'default'} size="sm">{m.status}</Badge></td>
                  <td><Button variant="ghost" size="sm" onClick={() => { setSelected(m); if (m.status === 'new') updateStatus(m.id, 'read'); }}>View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
