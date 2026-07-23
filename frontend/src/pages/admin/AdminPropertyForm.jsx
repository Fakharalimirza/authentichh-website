import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import Button from '../../components/ui/Button';
import DirhamSymbol from '../../components/ui/DirhamSymbol';

export default function AdminPropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', property_type: 'Apartment', building_name: '', location: '', address: '',
    bedrooms: '1', bathrooms: '1', max_guests: '2', size_sqft: '', price_per_night: '',
    short_description: '', description: '', map_url: '', latitude: '', longitude: '',
    status: 'draft', is_featured: 0, meta_title: '', meta_description: '',
    amenities: []
  });
  const [allAmenities, setAllAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminApi.get('/amenities/admin')
      .then(r => setAllAmenities(r.data))
      .catch(() => {});

    if (isEdit) {
      adminApi.get(`/properties/${id}`)
        .then(r => {
          const p = r.data;
          let amenities = [];
          if (p.amenities) {
            amenities = p.amenities.map(a => a.id);
          }
          setForm({
            title: p.title || '', property_type: p.property_type || 'Apartment',
            building_name: p.building_name || '', location: p.location || '', address: p.address || '',
            bedrooms: String(p.bedrooms || 0), bathrooms: String(p.bathrooms || 0),
            max_guests: String(p.max_guests || 0), size_sqft: p.size_sqft ? String(p.size_sqft) : '',
            price_per_night: String(p.price_per_night || 0),
            short_description: p.short_description || '', description: p.description || '',
            map_url: p.map_url || '', latitude: p.latitude ? String(p.latitude) : '',
            longitude: p.longitude ? String(p.longitude) : '',
            status: p.status || 'draft', is_featured: p.is_featured || 0,
            meta_title: p.meta_title || p.title || '', meta_description: p.meta_description || '',
            amenities
          });
          if (p.images) setImages(p.images);
        })
        .catch(() => navigate('/admin/properties'));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  };

  const toggleAmenity = (amenityId) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(amenityId)
        ? f.amenities.filter(a => a !== amenityId)
        : [...f.amenities, amenityId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        ...form,
        bedrooms: parseInt(form.bedrooms) || 0,
        bathrooms: parseInt(form.bathrooms) || 0,
        max_guests: parseInt(form.max_guests) || 0,
        size_sqft: form.size_sqft ? parseInt(form.size_sqft) : null,
        price_per_night: parseFloat(form.price_per_night) || 0,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };

      if (isEdit) {
        await adminApi.put(`/properties/${id}`, data);
        await uploadImages(id);
        navigate('/admin/properties');
      } else {
        const res = await adminApi.post('/properties', data);
        const newId = res.data.id;
        await uploadImages(newId);
        navigate('/admin/properties');
      }
    } catch (err) {
      alert('Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadImages = async (propertyId) => {
    if (selectedFiles.length === 0) return;
    const formData = new FormData();
    selectedFiles.forEach(f => formData.append('images', f));
    await adminApi.post(`/properties/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await adminApi.delete(`/properties/${id}/images/${imageId}`);
      setImages(prev => prev.filter(i => i.id !== imageId));
    } catch (err) {
      alert('Failed to delete image');
    }
  };

  const handleSetCover = async (imageId) => {
    try {
      await adminApi.put(`/properties/${id}/images/${imageId}/cover`);
      setImages(prev => prev.map(i => ({ ...i, is_cover: i.id === imageId ? 1 : 0 })));
    } catch (err) {
      alert('Failed to set cover image');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-header">
          <h1>{isEdit ? 'Edit Property' : 'New Property'}</h1>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>Basic Information</h2>
          <div className="form-group">
            <label>Property Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Property Type</label>
              <select name="property_type" value={form.property_type} onChange={handleChange}>
                <option value="Apartment">Apartment</option>
                <option value="Studio">Studio</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Villa">Villa</option>
              </select>
            </div>
            <div className="form-group">
              <label>Building Name</label>
              <input name="building_name" value={form.building_name} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Area/Location</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Bedrooms</label>
              <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Bathrooms</label>
              <input name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Max Guests</label>
              <input name="max_guests" type="number" min="1" value={form.max_guests} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Size (sqft)</label>
              <input name="size_sqft" type="number" min="0" value={form.size_sqft} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Starting Price Per Night <DirhamSymbol size="1em" /> *</label>
            <input name="price_per_night" type="number" min="0" step="0.01" value={form.price_per_night} onChange={handleChange} required />
          </div>

          <h2 style={{ marginTop: 30 }}>Description</h2>
          <div className="form-group">
            <label>Short Description</label>
            <textarea name="short_description" value={form.short_description} onChange={handleChange} style={{ minHeight: 80 }} />
          </div>
          <div className="form-group">
            <label>Full Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} style={{ minHeight: 200 }} />
          </div>

          <h2 style={{ marginTop: 30 }}>Status & Options</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 30 }}>
                <input type="checkbox" checked={form.is_featured === 1} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked ? 1 : 0 }))} />
                Featured Property
              </label>
            </div>
          </div>

          <h2 style={{ marginTop: 30 }}>Images</h2>
          {isEdit && images.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 15 }}>
              {images.map(img => (
                <div key={img.id} style={{
                  position: 'relative', width: 150, height: 120, borderRadius: 8, overflow: 'hidden',
                  border: img.is_cover ? '3px solid var(--color-accent)' : '1px solid var(--color-border)',
                }}>
                  <img src={`/${img.image_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, insetInline: 0, display: 'flex', gap: 2 }}>
                    <button type="button" onClick={() => handleSetCover(img.id)} style={{
                      flex: 1, padding: '3px', fontSize: 11,
                      background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', cursor: 'pointer',
                    }}>{img.is_cover ? '⭐ Cover' : 'Set Cover'}</button>
                    <button type="button" onClick={() => handleDeleteImage(img.id)} style={{
                      flex: 1, padding: '3px', fontSize: 11,
                      background: 'rgba(198,40,40,0.8)', color: 'white', border: 'none', cursor: 'pointer',
                    }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="form-group">
            <label>Upload Images</label>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e => setSelectedFiles(Array.from(e.target.files))} />
            <small style={{ color: 'var(--color-text-secondary)' }}>Allowed: JPEG, PNG, WebP. Max 5MB per image.</small>
          </div>

          <h2 style={{ marginTop: 30 }}>Amenities</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {allAmenities.map(a => {
              const selected = form.amenities.includes(a.id);
              return (
                <label key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px',
                  border: `2px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: 8, cursor: 'pointer',
                  background: selected ? 'rgba(200,164,92,0.08)' : 'var(--color-surface)',
                  transition: 'var(--transition)',
                }}>
                  <input type="checkbox" checked={selected} onChange={() => toggleAmenity(a.id)} style={{ display: 'none' }} />
                  <span>{a.name}</span>
                </label>
              );
            })}
          </div>

          <h2 style={{ marginTop: 30 }}>Location / Map</h2>
          <div className="form-group">
            <label>Google Map URL</label>
            <input name="map_url" value={form.map_url} onChange={handleChange} placeholder="https://maps.google.com/?q=..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="25.2048" />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="55.2708" />
            </div>
          </div>

          <h2 style={{ marginTop: 30 }}>SEO</h2>
          <div className="form-group">
            <label>Meta Title</label>
            <input name="meta_title" value={form.meta_title} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Meta Description</label>
            <textarea name="meta_description" value={form.meta_description} onChange={handleChange} style={{ minHeight: 80 }} />
          </div>

          <div style={{ marginTop: 30, display: 'flex', gap: 15 }}>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/properties')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
