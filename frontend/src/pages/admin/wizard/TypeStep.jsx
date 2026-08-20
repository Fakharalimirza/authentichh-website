import { Home, Building2, Castle, Landmark, Box } from 'lucide-react';

const propertyTypes = [
  { value: 'Apartment', labelEn: 'Apartment', labelAr: 'شقة', icon: Building2, descEn: 'Standard apartment unit', descAr: 'وحدة شقة عادية' },
  { value: 'Townhouse', labelEn: 'Townhouse', labelAr: 'تاون هاوس', icon: Home, descEn: 'Multi-story townhouse', descAr: 'تاون هاوس متعدد الطوابق' },
  { value: 'Villa', labelEn: 'Villa', labelAr: 'فيلا', icon: Castle, descEn: 'Standalone villa', descAr: 'فيلا مستقلة' },
  { value: 'Penthouse', labelEn: 'Penthouse', labelAr: 'بنتهاوس', icon: Landmark, descEn: 'Top-floor penthouse', descAr: 'بنتهاوس في الطابق العلوي' },
  { value: 'Studio', labelEn: 'Studio', labelAr: 'استوديو', icon: Box, descEn: 'Open-plan studio', descAr: 'استوديو مفتوح' },
];

export default function TypeStep({ form, handleChange }) {
  return (
    <div className="wizard-step">
      <h2>Property Type / نوع العقار</h2>
      <p className="form-hint" style={{ marginBottom: 'var(--space-4)' }}>
        Select the type of property you are listing
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
        {propertyTypes.map(({ value, labelEn, labelAr, icon: Icon, descEn, descAr }) => {
          const selected = form.property_type === value;
          return (
            <label
              key={value}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: 'var(--space-4) var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: selected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                cursor: 'pointer', transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
            >
              <input
                type="radio"
                name="property_type"
                value={value}
                checked={selected}
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              <div
                style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: selected ? 'var(--color-primary)' : 'var(--color-surface-secondary)',
                  color: selected ? '#fff' : 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={24} />
              </div>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>
                {labelEn}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }} dir="rtl">
                {labelAr}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                {descEn}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
