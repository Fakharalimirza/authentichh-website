import { NavLink, useNavigate } from 'react-router-dom';

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <div style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 400, color: 'var(--color-text-muted)', marginTop: 5 }}>Admin Dashboard</div>
      </div>

      <div style={{ marginBottom: 20, padding: '10px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{user.name || 'Admin'}</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user.email || ''}</div>
      </div>

      <NavLink to="/admin" end>📊 Dashboard</NavLink>
      <NavLink to="/admin/properties">🏢 Properties</NavLink>
      <NavLink to="/admin/properties/new">➕ New Property</NavLink>
      <NavLink to="/admin/landlord-requests">📋 Landlord Requests</NavLink>
      <NavLink to="/admin/enquiries">✉️ Property Enquiries</NavLink>
      <NavLink to="/admin/contact-messages">💬 Contact Messages</NavLink>


      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
        <NavLink to="/" target="_blank">🌐 View Website</NavLink>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>
    </div>
  );
}
