import { Star } from 'lucide-react';

export default function SeoStep({ form, errors, setForm, renderFieldError }) {
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  return (
    <div className="wizard-step">
      <h2>SEO والنشر / SEO & Publish</h2>
      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">الحالة / Status</label>
          <select name="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="admin-input">
            <option value="draft">Draft (not visible) / مسودة</option>
            <option value="published">Published (visible on site) / منشور</option>
            <option value="unpublished">Unpublished (hidden) / غير منشور</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="checkbox-label" style={{ marginTop: 28 }}>
            <input
              type="checkbox"
              checked={form.is_featured === 1}
              onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked ? 1 : 0 }))}
            />
            <Star
              size={16}
              style={{
                fill: form.is_featured ? 'var(--color-accent)' : 'none',
                color: form.is_featured ? 'var(--color-accent)' : 'var(--color-text-muted)'
              }}
            />
            عقار مميز / Featured Property
          </label>
        </div>
      </div>

      {/* Meta Title EN */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">
          Meta Title (English)
          {errors.meta_title && <span style={{ color: 'var(--color-warning)', marginInlineStart: 4 }}>(recommended)</span>}
        </label>
        <input
          name="meta_title"
          value={form.meta_title}
          onChange={handleInput}
          className="admin-input" style={{ borderColor: errors.meta_title ? 'var(--color-warning)' : undefined }}
        />
        <small className="form-hint">SEO title for search engines</small>
        {renderFieldError('meta_title')}
      </div>

      {/* Meta Title AR */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">
          عنوان ميتا (العربية)
          {errors.meta_title_ar && <span style={{ color: 'var(--color-warning)', marginInlineStart: 4 }}>(موصى به)</span>}
        </label>
        <input
          name="meta_title_ar"
          value={form.meta_title_ar}
          onChange={handleInput}
          className="admin-input" style={{ borderColor: errors.meta_title_ar ? 'var(--color-warning)' : undefined }}
          dir="rtl"
          placeholder="عنوان SEO بالعربية"
        />
        <small className="form-hint">عنوان محرك البحث بالعربية</small>
        {renderFieldError('meta_title_ar')}
      </div>

      {/* Meta Description EN */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">Meta Description (English)</label>
        <textarea
          name="meta_description"
          value={form.meta_description}
          onChange={handleInput}
          className="admin-textarea" style={{ minHeight: 80 }}
        />
        <small className="form-hint">SEO description for search results</small>
      </div>

      {/* Meta Description AR */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">وصف ميتا (العربية)</label>
        <textarea
          name="meta_description_ar"
          value={form.meta_description_ar}
          onChange={handleInput}
          className="admin-textarea" style={{ minHeight: 80 }}
          dir="rtl"
          placeholder="وصف محرك البحث بالعربية"
        />
        <small className="form-hint">وصف نتائج البحث بالعربية</small>
      </div>
    </div>
  );
}
