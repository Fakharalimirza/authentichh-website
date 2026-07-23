import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    adminApi.get('/dashboard/summary')
      .then(r => setSummary(r.data))
      .catch(() => navigate('/admin/login'));
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <Link to="/"><Button variant="ghost">View Website</Button></Link>
        </div>

        {summary && (
          <div className="admin-cards">
            <div className="admin-card">
              <h3>{summary.totalProperties}</h3>
              <p>Total Properties</p>
            </div>
            <div className="admin-card">
              <h3 style={{ color: 'var(--color-success)' }}>{summary.publishedProperties}</h3>
              <p>Published</p>
            </div>
            <div className="admin-card">
              <h3 style={{ color: 'var(--color-warning)' }}>{summary.draftProperties}</h3>
              <p>Draft</p>
            </div>
            <div className="admin-card">
              <h3>{summary.totalEnquiries}</h3>
              <p>Property Enquiries</p>
              {summary.newEnquiries > 0 && <Badge variant="accent" size="sm" style={{ marginTop: 8 }}>{summary.newEnquiries} New</Badge>}
            </div>
            <div className="admin-card">
              <h3>{summary.landlordRequests}</h3>
              <p>Landlord Requests</p>
              {summary.newLandlordRequests > 0 && <Badge variant="accent" size="sm" style={{ marginTop: 8 }}>{summary.newLandlordRequests} New</Badge>}
            </div>
            <div className="admin-card">
              <h3>{summary.contactMessages}</h3>
              <p>Contact Messages</p>
              {summary.newContactMessages > 0 && <Badge variant="accent" size="sm" style={{ marginTop: 8 }}>{summary.newContactMessages} New</Badge>}
            </div>
          </div>
        )}

        <div style={{ marginTop: 30 }}>
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/admin/properties/new"><Button variant="primary" size="sm">Add New Property</Button></Link>
            <Link to="/admin/properties"><Button variant="ghost" size="sm">Manage Properties</Button></Link>
            <Link to="/admin/landlord-requests"><Button variant="ghost" size="sm">Landlord Requests</Button></Link>
            <Link to="/admin/enquiries"><Button variant="ghost" size="sm">Property Enquiries</Button></Link>
            <Link to="/admin/contact-messages"><Button variant="ghost" size="sm">Contact Messages</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
