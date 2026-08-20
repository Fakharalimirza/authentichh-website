export default function DescriptionStep({ form, handleChange }) {
  return (
    <div className="wizard-step">
      <h2>الوصف / Description</h2>

      {/* Short Description EN */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">Short Description (English)</label>
        <textarea
          name="short_description"
          value={form.short_description}
          onChange={handleChange}
          className="admin-textarea" style={{ minHeight: 80 }}
        />
        <small className="form-hint">Brief overview shown on listing cards</small>
      </div>

      {/* Short Description AR */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">وصف مختصر (العربية)</label>
        <textarea
          name="short_description_ar"
          value={form.short_description_ar}
          onChange={handleChange}
          className="admin-textarea" style={{ minHeight: 80 }}
          dir="rtl"
          placeholder="ملخص مختصر يظهر في بطاقات القوائم"
        />
        <small className="form-hint">النص المختصر المعروض على بطاقات القوائم</small>
      </div>

      {/* Full Description EN */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">Full Description (English)</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="admin-textarea" style={{ minHeight: 200 }}
        />
      </div>

      {/* Full Description AR */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">الوصف الكامل (العربية)</label>
        <textarea
          name="description_ar"
          value={form.description_ar}
          onChange={handleChange}
          className="admin-textarea" style={{ minHeight: 200 }}
          dir="rtl"
          placeholder="أدخل الوصف الكامل للعقار بالعربية"
        />
      </div>
    </div>
  );
}
