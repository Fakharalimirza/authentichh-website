import { Helmet } from 'react-helmet-async';
import { useState, useRef, useEffect } from 'react';
import {
  MapPin, Phone, Mail, Clock,
  Send, CheckCircle, AlertCircle, ChevronRight, Star, Check,
} from 'lucide-react';
import { api } from '../../utils/api';
import Reviews from '../../components/public/Reviews';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import { useI18n } from '../../i18n/I18nContext';

function WhatsAppIcon({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
    </svg>
  );
}

function useOnScreen(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

function AnimateSection({ children, className = '' }) {
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  return (
    <div ref={ref} className={`animate-section ${visible ? 'animate-in' : ''} ${className}`}>
      {children}
    </div>
  );
}

export default function Contact() {
  const { t } = useI18n();

  const contactItems = [
    {
      icon: MapPin,
      title: t('home.contact_address'),
      lines: [t('home.address_line_1'), t('home.address_line_2')],
      link: { href: 'https://maps.app.goo.gl/YwPSX4KLSB2rrRmV8', label: t('home.link_view_map') },
    },
    {
      icon: Phone,
      title: t('home.contact_phone'),
      lines: [t('home.phone_line_1'), t('home.phone_line_2')],
      link: { href: 'tel:+97142866788', label: t('home.link_call_now') },
    },
    {
      icon: WhatsAppIcon,
      title: t('home.contact_whatsapp'),
      lines: [t('home.whatsapp_line')],
      link: { href: 'https://wa.me/971569969332', label: t('home.link_chat_whatsapp'), target: '_blank' },
    },
    {
      icon: Mail,
      title: t('home.contact_email'),
      lines: ['info@authenticholidayhomes.ae'],
      link: { href: 'mailto:info@authenticholidayhomes.ae', label: t('home.link_send_email') },
    },
    {
      icon: Clock,
      title: t('home.contact_hours'),
      lines: [t('footer.hours_mon_fri'), t('footer.hours_sat'), t('footer.hours_sun')],
    },
  ];

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeContact, setAgreeContact] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const formRef = useRef(null);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError(t('contact.consent_error'));
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/contact', { ...form, agreeTerms, agreeContact });
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setAgreeTerms(false);
      setAgreeContact(false);
    } catch (err) {
      setError(err.response?.data?.message || t('contact.send_error'));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => setSubmitted(false);

  return (
    <>
      <Helmet>
        <title>{t('contact.title')}</title>
        <meta name="description" content={t('contact.meta_description')} />
        <meta name="keywords" content={t('contact.meta_keywords')} />
        <meta property="og:title" content={t('contact.title')} />
        <meta property="og:description" content={t('contact.og_description')} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: t('contact.jsonld_name'),
          description: t('contact.jsonld_description'),
          url: 'https://authenticholidayhomes.ae/contact',
        })}</script>
      </Helmet>
      <div className="page-header">
        <div className="container">
          <h1>{t('contact.heading')}</h1>
          <p>{t('contact.subtitle')}</p>
        </div>
      </div>

      <section className="section contact-section">
        <div className="container">
          <div className="contact-grid">
            <AnimateSection>
              <Card variant="elevated" id="contact-info">
                  <h2 className="contact-info-title">{t('contact.get_in_touch')}</h2>
                  <p className="contact-info-sub">
                    {t('contact.get_in_touch_text')}
                  </p>

                  {contactItems.map((item, i) => (
                    <div className="contact-item-island" key={i}>
                      <div className="contact-item-icon">
                        <item.icon size={22} strokeWidth={1.6} />
                      </div>
                      <div className="contact-item-body">
                        <h4 className="contact-item-title">{item.title}</h4>
                        {item.lines.map((line, j) => (
                          <p className="contact-item-detail" key={j}>{line}</p>
                        ))}
                        {item.link && (
                          <a href={item.link.href} className="contact-item-link" target={item.link.target} rel={item.link.target === '_blank' ? 'noopener noreferrer' : undefined}>
                            {item.link.label} <ChevronRight size={16} strokeWidth={2.5} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </Card>
            </AnimateSection>

            <AnimateSection>
              <Card variant="elevated">
                  {submitted ? (
                    <div className="contact-success">
                      <div className="contact-success-icon">
                        <CheckCircle size={36} strokeWidth={1.5} />
                      </div>
                      <hr className="divider-accent" />
                      <h3>{t('contact.success_title')}</h3>
                      <p>
                        {t('contact.success_text')}
                      </p>
                      <Button variant="ghost" onClick={handleReset}>
                        {t('contact.send_another')}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h2 className="contact-form-title">{t('contact.send_message')}</h2>
                      <p className="contact-form-sub">
                        {t('contact.send_message_text')}
                      </p>

                      {error && (
                        <div className={`list-property-form-error ${shake ? 'shake' : ''}`} style={{ marginBottom: 'var(--space-4)' }}>
                          <AlertCircle size={16} />
                          <span>{error}</span>
                        </div>
                      )}

                      <form className="contact-form" onSubmit={handleSubmit} noValidate ref={formRef}>
                        <div className="input-wrapper">
                          <label className="input-label">
                            {t('contact.form_name')} <span className="input-required">*</span>
                          </label>
                          <div className="input-field input-md input-glow">
                            <input className="input-element" name="name" required
                              value={form.name} onChange={handleChange} placeholder={t('contact.placeholder_name')} />
                          </div>
                        </div>

                        <div className="input-wrapper">
                          <label className="input-label">
                            {t('contact.form_email')} <span className="input-required">*</span>
                          </label>
                          <div className="input-field input-md input-glow">
                            <input className="input-element" name="email" type="email" required
                              value={form.email} onChange={handleChange} placeholder={t('contact.placeholder_email')} />
                          </div>
                        </div>

                        <div className="input-wrapper">
                          <label className="input-label">{t('contact.form_phone')}</label>
                          <div className="input-field input-md input-glow">
                            <input className="input-element" name="phone" type="tel"
                              value={form.phone} onChange={handleChange} placeholder={t('contact.placeholder_phone')} />
                          </div>
                        </div>

                        <div className="input-wrapper">
                          <label className="input-label">{t('contact.form_subject')}</label>
                          <div className="input-field input-md input-glow">
                            <input className="input-element" name="subject"
                              value={form.subject} onChange={handleChange} placeholder={t('contact.placeholder_subject')} />
                          </div>
                        </div>

                        <div className="input-wrapper">
                          <label className="input-label">
                            {t('contact.form_message')} <span className="input-required">*</span>
                          </label>
                          <div className="input-field input-md input-glow">
                            <textarea className="input-element" name="message" required
                              value={form.message} onChange={handleChange}
                              placeholder={t('contact.placeholder_message')} />
                          </div>
                        </div>

                        <div className="checkbox-group">
                          <label className="checkbox-label">
                            <input type="checkbox" checked={agreeTerms}
                              onChange={e => setAgreeTerms(e.target.checked)} />
                            <span className="checkbox-custom">
                              {agreeTerms && <Check size={14} strokeWidth={3} color="white" />}
                            </span>
                            <span className="checkbox-text">
                              {t('contact.consent_terms_pre')} <a href="/terms" target="_blank">{t('contact.consent_terms_link')}</a>
                            </span>
                          </label>

                          <label className="checkbox-label">
                            <input type="checkbox" checked={agreeContact}
                              onChange={e => setAgreeContact(e.target.checked)} />
                            <span className="checkbox-custom">
                              {agreeContact && <Check size={14} strokeWidth={3} color="white" />}
                            </span>
                            <span className="checkbox-text">
                              {t('contact.consent_contact')}
                            </span>
                          </label>
                        </div>

                        <Button type="submit" variant="primary" size="xl" fullWidth
                          disabled={submitting}>
                          {submitting ? t('contact.sending') : t('contact.send_btn')}
                        </Button>
                      </form>
                    </>
                  )}
                </Card>
            </AnimateSection>
          </div>

          <Reviews />
          <AnimateSection>
            <Card variant="elevated" style={{ marginTop: 'var(--space-8)' }}>
              <h2 className="contact-info-title" style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>
                {t('contact.find_us')}
              </h2>

              <div className="contact-map-wrap">
                <div className="contact-map">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.4429901893786!2d55.4081068!3d25.222000299999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43fbe01575e5%3A0xfad1b6ee64ef2244!2sAuthentic%20Holiday%20Homes!5e0!3m2!1sen!2sae!4v1784718947210!5m2!1sen!2sae"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title={t('contact.map_title')}
                  />
                </div>
              </div>
              <div className="contact-review-wrap">
                <a
                  href="https://g.page/r/CUQi72TuttH6EBM/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-review-btn"
                >
                  <Star size={24} strokeWidth={1.5} fill="currentColor" />
                  {t('contact.leave_review')}
                  <ChevronRight size={22} strokeWidth={2.5} />
                </a>
              </div>
            </Card>
          </AnimateSection>
        </div>
      </section>
    </>
  );
}
