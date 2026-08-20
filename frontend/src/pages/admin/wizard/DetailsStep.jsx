import DirhamSymbol from '../../../components/public/DirhamSymbol';

const houseTypes = [
  { value: 'Standard', labelEn: 'Standard', labelAr: 'قياسي' },
  { value: 'Corner', labelEn: 'Corner', labelAr: 'ركني' },
  { value: 'Middle', labelEn: 'Middle', labelAr: 'وسط' },
  { value: 'End Unit', labelEn: 'End Unit', labelAr: 'وحدة نهاية' },
  { value: 'Duplex', labelEn: 'Duplex', labelAr: 'دوبلكس' },
];

export default function DetailsStep({ form, errors, handleChange, renderFieldError, listing }) {
  const isLinked = listing?.unit_id;

  return (
    <div className="wizard-step">
      <h2>التفاصيل / Property Details</h2>

      {/* Room details */}
      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">غرف النوم / Bedrooms</label>
          <input name="bedrooms" type="number" min="0" value={form.bedrooms} 
                 onChange={handleChange} 
                 className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'} />
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">الحمامات / Bathrooms</label>
          <input name="bathrooms" type="number" min="0" value={form.bathrooms} 
                 onChange={handleChange} 
                 className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'} />
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">الضيوف / Max Guests</label>
          <input name="max_guests" type="number" min="1" value={form.max_guests} 
                 onChange={handleChange} 
                 className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'} />
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">موقف السيارات / Parking</label>
          <input name="parking_spots" type="number" min="0" value={form.parking_spots} 
                 onChange={handleChange} 
                 className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'} />
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">المساحة (قدم²) / Size (sqft)</label>
          <input name="size_sqft" type="number" min="0" value={form.size_sqft} 
                 onChange={handleChange} 
                 className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'} />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">
          السعر لكل ليلة <DirhamSymbol size="1em" /> / Price Per Night <span className="required">*</span>
        </label>
        <input
          name="price_per_night"
          type="number" min="0" step="0.01"
          value={form.price_per_night}
          onChange={handleChange}
          className="admin-input" style={{ borderColor: errors.price_per_night ? 'var(--color-error)' : undefined }}
          required
        />
        {renderFieldError('price_per_night')}
      </div>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-4) 0' }} />

      {/* Unit-specific fields */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>
        وحدة التفاصيل / Unit Details
      </h3>

      {/* Linked unit notice */}
      {isLinked && (
        <div style={{
          padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-light)',
          background: 'var(--color-primary-light)', marginBottom: 'var(--space-4)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--color-primary)', margin: 0 }}>
            • هذه الحقول تُدار من الوحدات - تم التعديل في <a href="/admin/units" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Admin → Units</a>
          </p>
        </div>
      )}

      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">رقم الشقة / Apartment Number</label>
          <input
            name="apartment_number"
            value={form.apartment_number || ''}
            onChange={handleChange}
            className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'}
            placeholder="e.g. 1204"
          />
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">نوع المنزل / House Type</label>
          <select
            name="house_type"
            value={form.house_type || ''}
            onChange={handleChange}
            className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'}
            disabled={isLinked}
          >
            <option value="">-- اختر / Select --</option>
            {houseTypes.map(ht => (
              <option key={ht.value} value={ht.value}>
                {ht.labelEn} / {ht.labelAr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">مزوّد الخدمة / Internet Provider</label>
          <input
            name="internet_provider"
            value={form.internet_provider || ''}
            onChange={handleChange}
            className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'}
            placeholder="e.g. Etisalat, Du"
          />
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">رقم حساب الإنترنت / Internet Account Number</label>
          <input
            name="internet_account_number"
            value={form.internet_account_number || ''}
            onChange={handleChange}
            className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">رقم عقار ديوا / DEWA Premises Number</label>
        <input
          name="dewa_premises_number"
          value={form.dewa_premises_number || ''}
          onChange={handleChange}
          className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'} style={{ maxWidth: 300 }}
        />
      </div>
    </div>
  );
}