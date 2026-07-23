import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import Button from '../../components/ui/Button';
import DirhamSymbol from '../../components/ui/DirhamSymbol';

const steps = [
  { label: 'Basic Info', icon: '📋' },
  { label: 'Details', icon: '🏠' },
  { label: 'Description', icon: '📝' },
  { label: 'Images', icon: '🖼️' },
  { label: 'Amenities', icon: '✨' },
  { label: 'Location', icon: '📍' },
  { label: 'SEO & Publish', icon: '🚀' },
];

const emptyForm = {
  title: '', property_type: 'Apartment', building_name: '', location: '', address: '',
  bedrooms: '1', bathrooms: '1', max_guests: '2', size_sqft: '', price_per_night: '',
  short_description: '', description: '', map_url: '', latitude: '', longitude: '',
  status: 'draft', is_featured: 0, meta_title: '', meta_description: '',
  amenities: [],
};

export default function AdminPropertyWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
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
            amenities: p.amenities ? p.amenities.map(a => a.id) : [],
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

  const canProceed = () => {
    switch (step) {
      case 0: return form.title.trim();
      case 1: return form.price_per_night;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
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
        if (selectedFiles.length > 0) await uploadImages(id);
        navigate('/admin/properties');
      } else {
        const res = await adminApi.post('/properties', data);
        const newId = res.data.id;
        if (selectedFiles.length > 0) await uploadImages(newId);
        navigate('/admin/properties');
      }
    } catch {
      alert('Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadImages = async (propertyId) => {
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
    } catch { alert('Failed to delete image'); }
  };

  const handleSetCover = async (imageId) => {
    try {
      await adminApi.put(`/properties/${id}/images/${imageId}/cover`);
      setImages(prev => prev.map(i => ({ ...i, is_cover: i.id === imageId ? 1 : 0 })));
    } catch { alert('Failed to set cover image'); }
  };

  const inputStyle = {
    width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8,
    border: '1.5px solid var(--color-border)',
    background: 'var(--color-surface)', color: 'var(--color-text)',
    fontSize: 13, fontFamily: 'var(--font-sans)',
    outline: 'none', boxSizing: 'border-box',
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="wizard-step">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label>Property Title <span className="required">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} style={inputStyle} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Property Type</label>
              <select name="property_type" value={form.property_type} onChange={handleChange} style={inputStyle}>
                <option value="Apartment">Apartment</option>
                <option value="Studio">Studio</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Villa">Villa</option>
              </select>
            </div>
            <div className="form-group">
              <label>Building Name</label>
              <input name="building_name" value={form.building_name} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Area / Location</label>
              <input name="location" value={form.location} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </div>
      );

      case 1: return (
        <div className="wizard-step">
          <h2>Property Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Bedrooms</label>
              <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="form-group">
              <label>Bathrooms</label>
              <input name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="form-group">
              <label>Max Guests</label>
              <input name="max_guests" type="number" min="1" value={form.max_guests} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="form-group">
              <label>Size (sqft)</label>
              <input name="size_sqft" type="number" min="0" value={form.size_sqft} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
          <div className="form-group">
            <label>Price Per Night <DirhamSymbol size="1em" /> <span className="required">*</span></label>
            <input name="price_per_night" type="number" min="0" step="0.01" value={form.price_per_night} onChange={handleChange} style={inputStyle} required />
          </div>
        </div>
      );

      case 2: return (
        <div className="wizard-step">
          <h2>Description</h2>
          <div className="form-group">
            <label>Short Description</label>
            <textarea name="short_description" value={form.short_description} onChange={handleChange} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
            <small className="form-hint">Brief overview shown on listing cards</small>
          </div>
          <div className="form-group">
            <label>Full Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} style={{ ...inputStyle, minHeight: 200, resize: 'vertical' }} />
          </div>
        </div>
      );

      case 3: return (
        <div className="wizard-step">
          <h2>Images</h2>
          {images.length > 0 && (
            <div className="wizard-images-grid">
              {images.map(img => (
                <div key={img.id} className={`wizard-image-item ${img.is_cover ? 'is-cover' : ''}`}>
                  <img src={`/${img.image_url}`} alt="" />
                  <div className="wizard-image-actions">
                    <button type="button" className="wizard-image-btn" onClick={() => handleSetCover(img.id)}>
                      {img.is_cover ? '⭐ Cover' : 'Set Cover'}
                    </button>
                    <button type="button" className="wizard-image-btn danger" onClick={() => handleDeleteImage(img.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="form-group">
            <label>Upload New Images</label>
            <div className="wizard-upload-area">
              <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e => setSelectedFiles(Array.from(e.target.files))} />
            </div>
            <small className="form-hint">Allowed: JPEG, PNG, WebP. Max 5MB per image.</small>
          </div>
        </div>
      );

      case 4: return (
        <div className="wizard-step">
          <h2>Amenities</h2>
          <p className="form-hint" style={{ marginBottom: 'var(--space-4)' }}>Select all amenities this property offers</p>
          <div className="wizard-amenities">
            {allAmenities.map(a => {
              const selected = form.amenities.includes(a.id);
              return (
                <label key={a.id} className={`wizard-amenity-chip ${selected ? 'selected' : ''}`}>
                  <input type="checkbox" checked={selected} onChange={() => toggleAmenity(a.id)} />
                  <span>{a.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      );

      case 5: return (
        <div className="wizard-step">
          <h2>Location / Map</h2>
          <div className="form-group">
            <label>Google Maps Embed URL</label>
            <input name="map_url" value={form.map_url} onChange={handleChange} style={inputStyle} placeholder="https://maps.google.com/?q=..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input name="latitude" value={form.latitude} onChange={handleChange} style={inputStyle} placeholder="25.2048" />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input name="longitude" value={form.longitude} onChange={handleChange} style={inputStyle} placeholder="55.2708" />
            </div>
          </div>
          <div className="form-group">
            <label>Full Address</label>
            <input name="address" value={form.address} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
      );

      case 6: return (
        <div className="wizard-step">
          <h2>SEO & Publish</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                <option value="draft">Draft (not visible)</option>
                <option value="published">Published (visible on site)</option>
                <option value="unpublished">Unpublished (hidden)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.is_featured === 1} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked ? 1 : 0 }))} />
                Featured Property
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Meta Title</label>
            <input name="meta_title" value={form.meta_title} onChange={handleChange} style={inputStyle} />
            <small className="form-hint">SEO title for search engines</small>
          </div>
          <div className="form-group">
            <label>Meta Description</label>
            <textarea name="meta_description" value={form.meta_description} onChange={handleChange} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
            <small className="form-hint">SEO description for search results</small>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-header">
          <h1>{isEdit ? 'Edit Property' : 'New Property'}</h1>
        </div>

        <div className="wizard-progress">
          {steps.map((s, i) => (
            <div key={i} className={`wizard-step-indicator ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`} onClick={() => i < step && setStep(i)}>
              <div className="wizard-step-dot">{i < step ? '✓' : s.icon}</div>
              <span className="wizard-step-label">{s.label}</span>
            </div>
          ))}
        </div>

        <form className="admin-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          {renderStep()}

          <div className="wizard-nav">
            <Button type="button" variant="ghost" onClick={step === 0 ? () => navigate('/admin/properties') : handlePrev}>
              {step === 0 ? 'Cancel' : '← Previous'}
            </Button>
            {step < steps.length - 1 ? (
              <Button type="button" variant="primary" onClick={handleNext} disabled={!canProceed()}>
                Next →
              </Button>
            ) : (
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
