export default function BasicInfoStep({ form, errors, handleChange, renderFieldError }) {
  return (
    <div className="wizard-step">
      <h2>Basic Information / المعلومات الأساسية</h2>

      {/* Title EN */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">
          Property Title (English) <span className="required">*</span>
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="admin-input" style={{ borderColor: errors.title ? 'var(--color-error)' : undefined }}
          placeholder="e.g. Luxury 2BR Apartment in Downtown Dubai"
          required
        />
        {renderFieldError('title')}
      </div>

      {/* Title AR */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">
          عنوان العقار (العربية) <span className="required">*</span>
        </label>
        <input
          name="title_ar"
          value={form.title_ar}
          onChange={handleChange}
          className="admin-input" style={{ borderColor: errors.title_ar ? 'var(--color-error)' : undefined }}
          dir="rtl"
          placeholder="أدخل عنوان العقار بالعربية"
          required
        />
        {renderFieldError('title_ar')}
      </div>
    </div>
  );
}
