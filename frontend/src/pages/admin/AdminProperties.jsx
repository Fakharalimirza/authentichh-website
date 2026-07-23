import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DirhamSymbol from '../../components/ui/DirhamSymbol';

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProperties = () => {
    adminApi.get('/properties')
      .then(r => setProperties(r.data))
      .catch(() => navigate('/admin/login'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property? This action cannot be undone.')) return;
    try {
      await adminApi.delete(`/properties/${id}`);
      fetchProperties();
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  const handleToggleFeatured = async (prop) => {
    try {
      await adminApi.put(`/properties/${prop.id}`, { is_featured: prop.is_featured ? 0 : 1 });
      fetchProperties();
    } catch (err) {
      alert('Failed to update property');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-header">
          <h1>Properties</h1>
          <Link to="/admin/properties/new"><Button variant="primary" size="sm">Add New Property</Button></Link>
        </div>

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Type</th>
                <th>Bedrooms</th>
                <th>Price/Night</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
              ) : properties.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}>No properties found. <Link to="/admin/properties/new">Add your first property</Link></td></tr>
              ) : properties.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.title}</td>
                  <td>{p.location}</td>
                  <td>{p.property_type}</td>
                  <td>{p.bedrooms}</td>
                  <td><DirhamSymbol size="1em" /> {parseFloat(p.price_per_night).toLocaleString()}</td>
                  <td><Badge variant={p.status === 'published' ? 'success' : p.status === 'draft' ? 'warning' : 'error'} size="sm">{p.status}</Badge></td>
                  <td>
                    <button onClick={() => handleToggleFeatured(p)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                      title={p.is_featured ? 'Remove featured' : 'Mark featured'}
                    >{p.is_featured ? '⭐' : '☆'}</button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/admin/properties/edit/${p.id}`}><Button variant="ghost" size="sm">Edit</Button></Link>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(p.id)}>Delete</Button>
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
