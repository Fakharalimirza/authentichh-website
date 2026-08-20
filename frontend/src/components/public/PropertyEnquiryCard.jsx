/**
 * @fileoverview Enquiry card with date picker, WhatsApp/Call buttons, and form submission.
 */

import { useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import DateRangePicker from '../shared/DateRangePicker';
import { useI18n } from '../../i18n/I18nContext';

const inputStyle = {
  width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8,
  border: '1.5px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: 13, fontFamily: 'var(--font-sans)',
  outline: 'none', transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

export default function PropertyEnquiryCard({ property, api, maxHeight }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [enquiry, setEnquiry] = useState({ name: '', phone: '' });
  const [dates, setDates] = useState({ checkIn: null, checkOut: null });
  const [showCalendar, setShowCalendar] = useState(true);
  const { t } = useI18n();

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/property-enquiries', {
        name: enquiry.name,
        phone: enquiry.phone,
        property_id: property.id,
        check_in: dates.checkIn ? dates.checkIn.toISOString().slice(0, 10) : '',
        check_out: dates.checkOut ? dates.checkOut.toISOString().slice(0, 10) : '',
      });
      setSubmitted(true);
      setEnquiry({ name: '', phone: '' });
      setDates({ checkIn: null, checkOut: null });
      setShowCalendar(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/971569969332?text=Hello%2C%20I%27m%20interested%20in%20${encodeURIComponent(property.title)}`;
const callUrl = `tel:+971569969332`;

  return (
    <Card variant="elevated" padding className="pd-enquiry-card" style={{ position: 'sticky', top: 100, maxHeight: maxHeight || undefined, overflow: maxHeight ? 'hidden' : undefined }}>
      <h3 style={{ marginBottom: 'var(--space-3)', textAlign: 'center', fontSize: 'var(--text-lg)' }}>{t('enquiry.title')}</h3>

      {submitted ? (
        <div style={{ padding: 'var(--space-4)', borderRadius: 8, background: 'rgba(46, 213, 115, 0.1)', color: 'var(--color-success)', fontSize: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>✓</div>
          {t('enquiry.thank_you')}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <a href={whatsappUrl}
              target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', borderRadius: 8, background: '#25D366', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 12, minHeight: 36 }}
            >
              <MessageCircle size={15} /> {t('enquiry.whatsapp')}
            </a>
            <a href={callUrl}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', borderRadius: 8, background: 'var(--color-primary)', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 12, minHeight: 36 }}
            >
              <Phone size={15} /> {t('enquiry.call_us')}
            </a>
          </div>

          {dates.checkIn && dates.checkOut ? (
            <form onSubmit={handleEnquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {error && <div style={{ padding: 8, borderRadius: 6, background: 'rgba(227, 30, 36, 0.1)', color: 'var(--color-primary)', fontSize: 13 }}>{error}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 600 }}>{dates.checkIn.toLocaleDateString('en-GB')} → {dates.checkOut.toLocaleDateString('en-GB')}</span>
                <button type="button" onClick={() => { setDates({ checkIn: null, checkOut: null }); setShowCalendar(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 12, fontWeight: 600, padding: 0, textDecoration: 'underline' }}>{t('enquiry.change')}</button>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--color-text-secondary)' }}>{t('enquiry.name_label')}</label>
                <input required value={enquiry.name} onChange={e => setEnquiry(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--color-text-secondary)' }}>{t('enquiry.phone_label')}</label>
                <input type="tel" required value={enquiry.phone} onChange={e => setEnquiry(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
              </div>
              <Button type="submit" variant="primary" fullWidth disabled={submitting} style={{ marginTop: 4, minHeight: 44 }}>{submitting ? t('enquiry.sending') : t('enquiry.send_enquiry')}</Button>
            </form>
          ) : (
            <DateRangePicker compact={!!maxHeight} checkIn={dates.checkIn} checkOut={dates.checkOut} onChange={(d) => { setDates(d); if (d.checkIn && d.checkOut) setShowCalendar(false); }} />
          )}
        </>
      )}
    </Card>
  );
}
