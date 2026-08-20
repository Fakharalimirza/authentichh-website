export default function LocationStep({ form, handleChange }) {
  return (
    <div className="wizard-step">
      <h2>الموقع / Location & Map</h2>
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">
          Plus Code <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(preferred — shows pin on map)</span>
        </label>
        <input name="plus_code" value={form.plus_code} onChange={handleChange} className="admin-input" placeholder="e.g. 6CC5+R6 Dubai" />
      </div>
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">Google Maps Embed URL</label>
        <input name="map_url" value={form.map_url} onChange={handleChange} className="admin-input" placeholder="https://maps.google.com/?q=..." />
      </div>
      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">خط العرض / Latitude</label>
          <input name="latitude" value={form.latitude} onChange={handleChange} className="admin-input" placeholder="25.2048" />
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">خط الطول / Longitude</label>
          <input name="longitude" value={form.longitude} onChange={handleChange} className="admin-input" placeholder="55.2708" />
        </div>
      </div>

      {/* Full Address EN */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">Full Address (English)</label>
        <input name="address" value={form.address} onChange={handleChange} className="admin-input" />
      </div>

      {/* Full Address AR */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">العنوان الكامل (العربية)</label>
        <input
          name="address_ar"
          value={form.address_ar}
          onChange={handleChange}
          className="admin-input"
          dir="rtl"
          placeholder="أدخل العنوان الكامل بالعربية"
        />
      </div>
    </div>
  );
}
