import { Helmet } from 'react-helmet-async';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, ChevronRight, AlertCircle, CheckCircle2,
  ArrowDown, Check, User, Mail, MessageSquare,
  ShieldCheck, Clock,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { api } from '../../utils/api';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import DirhamSymbol from '../../components/public/DirhamSymbol';
import { AnimateSection } from '../../hooks/useOnScreen';
import StatCounter from './components/StatCounter';
import { comparisonIcons, stepIcons, stepHasTable, serviceIcons, dtcmFees } from './data/listPropertyData';

export default function ListProperty() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const comparisons = comparisonIcons.map((icon, i) => ({
    icon,
    title: t(`list_property.vs_${i + 1}_title`),
    detail: t(`list_property.vs_${i + 1}_detail`),
  }));

  const steps = stepIcons.map((icon, i) => ({
    icon,
    title: t(`list_property.step_${i + 1}_title`),
    detail: t(`list_property.step_${i + 1}_detail`),
    table: stepHasTable[i],
  }));

  const services = serviceIcons.map((icon, i) => ({
    icon,
    title: t(`list_property.service_${i + 1}_title`),
    detail: t(`list_property.service_${i + 1}_detail`),
  }));
  const formRef = useRef(null);
  const stepsRef = useRef(null);
  const timelineRef = useRef(null);
  const statsRef = useRef(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const update = () => {
      const circles = el.querySelectorAll('.timeline-step-number');
      if (!circles.length) return;
      const last = circles[circles.length - 1];
      const tRect = el.getBoundingClientRect();
      const cRect = last.getBoundingClientRect();
      el.style.setProperty('--line-bottom', `${tRect.bottom - cRect.top}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el || window.innerWidth >= 1024) return;
    const items = Array.from(el.children);
    if (items.length < 2) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % items.length;
      el.scrollTo({ left: items[index].offsetLeft, behavior: 'smooth' });
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const [form, setForm] = useState({ full_name: '', phone_email: '', message: '' });
  const [agreeContact, setAgreeContact] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeContact) {
      setError(t('list_property.consent_error'));
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/landlord-requests', { ...form, agreeContact });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || t('list_property.submit_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = useCallback(() => {
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const scrollToSteps = useCallback(() => {
    stepsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('list_property.title')}</title>
        <meta name="description" content={t('list_property.meta_description')} />
        <meta name="keywords" content={t('list_property.meta_keywords')} />
        <meta property="og:title" content={t('list_property.title')} />
        <meta property="og:description" content={t('list_property.og_description')} />
      </Helmet>
      <section className="section contact-section">
        <div className="container">

          <div className="hero-content" style={{ paddingTop: 'calc(var(--header-height) + var(--space-12))' }}>
            <div className="hero-badge">{t('list_property.hero_badge')}</div>
            <h1 className="hero-title">
              {t('list_property.hero_heading')}
            </h1>
            <p className="hero-sub">
              {t('list_property.hero_text')}
            </p>
            <div className="hero-actions">
              <Button variant="primary" size="xl" onClick={scrollToForm} icon={<ArrowDown size={20} />}>
                {t('list_property.start_earning')}
              </Button>
              <Button variant="accent" size="xl" onClick={scrollToSteps}>
                {t('list_property.see_how')}
              </Button>
            </div>
          </div>

          <div className="list-property-stats-wrap" style={{
            marginTop: 'var(--space-10)',
            padding: 'var(--space-12) 0',
            borderRadius: 'var(--radius-lg)',
            background: [
              'radial-gradient(600px circle at 30% 50%, rgba(201, 169, 110, 0.15) 0%, transparent 65%)',
              'radial-gradient(500px circle at 70% 50%, rgba(201, 169, 110, 0.1) 0%, transparent 65%)',
              'var(--color-bg)',
            ].join(','),
          }}>
            <div className="stats-bar" ref={statsRef}>
              <StatCounter target={200} suffix="+" label={t('list_property.stat_properties')} />
              <div className="stat-item">
                <div className="stat-number">{t('list_property.stat_since')}</div>
                <div className="stat-label">{t('list_property.stat_years')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.2<Star size={18} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 2 }} /></div>
                <div className="stat-label">{t('list_property.stat_rating')}</div>
              </div>
              <StatCounter target={25} suffix="%" label={t('list_property.stat_revenue')} />
            </div>
          </div>

          <div style={{ paddingTop: 'var(--space-16)' }}>
            <AnimateSection>
              <div className="section-label">{t('list_property.vs_title')}</div>
              <h2 className="section-title">{t('list_property.vs_heading')}</h2>
              <p className="section-subtitle">
                {t('list_property.vs_subtitle')}
              </p>
            </AnimateSection>

            <div className="comparison-grid">
              {comparisons.map((c, i) => {
                const Icon = c.icon;
                return (
                  <AnimateSection key={i} threshold={0.1}>
                    <div className="comparison-card">
                      <div className="comparison-card-icon"><Icon size={24} strokeWidth={1.5} /></div>
                      <h3 className="comparison-card-title">{c.title}</h3>
                      <p className="comparison-card-detail">{c.detail}</p>
                    </div>
                  </AnimateSection>
                );
              })}
            </div>
          </div>

          <div style={{ paddingTop: 'var(--space-16)' }} ref={stepsRef}>
            <AnimateSection>
              <div className="section-label">{t('list_property.process_title')}</div>
              <h2 className="section-title">{t('list_property.process_heading')}</h2>
              <p className="section-subtitle">
                {t('list_property.process_subtitle')}
              </p>
            </AnimateSection>

            <div className="steps-timeline" ref={timelineRef}>
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <AnimateSection key={i} threshold={0.15}>
                    <div className="timeline-step">
                      <div className="timeline-step-number">
                        <Icon size={20} strokeWidth={1.6} />
                      </div>
                      <div className="timeline-step-content">
                        <h3 className="timeline-step-title">{s.title}</h3>
                        <p className="timeline-step-detail">{s.detail}</p>
                        {s.table && (
                          <div className="dtcm-table-wrap">
                            <table className="dtcm-table">
                              <thead>
                                <tr>
                                  <th>{t('list_property.table_type')}</th>
                                  <th>{t('list_property.table_fee')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dtcmFees.map((row, j) => (
                                  <tr key={j}>
                                    <td>{t(`list_property.${row.typeKey}`)}</td>
                                    <td><DirhamSymbol size="1em" /> {row.fee.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <p className="dtcm-note">{t('list_property.table_note_permits')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </AnimateSection>
                );
              })}
            </div>
          </div>

          <div style={{ paddingTop: 'var(--space-16)' }}>
            <AnimateSection>
              <div className="section-label">{t('list_property.commission_title')}</div>
              <h2 className="section-title">{t('list_property.commission_heading')}</h2>
              <p className="section-subtitle">
                {t('list_property.commission_subtitle')}
              </p>
            </AnimateSection>

            <div className="services-grid">
              {services.map((s, i) => {
                const Icon = s.icon;
                return (
                  <AnimateSection key={i} threshold={0.1}>
                    <Card variant="elevated" className="service-card">
                      <div className="service-card-icon"><Icon size={28} strokeWidth={1.5} /></div>
                      <h3 className="service-card-title">{s.title}</h3>
                      <p className="service-card-detail">{s.detail}</p>
                    </Card>
                  </AnimateSection>
                );
              })}
            </div>
          </div>

          <div style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-12)', textAlign: 'center' }}>
            <AnimateSection>
              <h2 className="cta-title">{t('list_property.cta_heading')}</h2>
              <p className="cta-sub">
                {t('list_property.cta_text')}
              </p>
              <div className="cta-actions">
                <Button variant="primary" size="xl" onClick={scrollToForm} icon={<ArrowDown size={20} />}>
                  {t('list_property.list_your_property')}
                </Button>
                <Button variant="accent" size="xl" onClick={() => navigate('/contact#contact-info')} icon={<ChevronRight size={20} />}>
                  {t('list_property.contact_us')}
                </Button>
              </div>
            </AnimateSection>

            <div className={`form-reveal ${showForm ? 'open' : ''}`} ref={formRef}>
              <div className="form-reveal-inner">
                {submitted ? (
                  <Card variant="elevated" className="form-success">
                    <div className="form-success-icon"><CheckCircle2 size={48} strokeWidth={1.5} /></div>
                    <h3 className="form-success-title">{t('list_property.success_title')}</h3>
                    <p className="form-success-text">
                      {t('list_property.success_text')}
                    </p>
                    <Button variant="primary" onClick={() => { setSubmitted(false); setShowForm(false); setForm({ full_name: '', phone_email: '', message: '' }); setAgreeContact(false); }}>
                      {t('list_property.submit_another')}
                    </Button>
                  </Card>
                ) : (
                  <>
                    <h3 className="form-title">{t('list_property.form_heading')}</h3>
                    <p className="form-subtitle">{t('list_property.form_subtext')}</p>

                    {error && (
                      <div className="form-error" style={{ marginBottom: 'var(--space-4)' }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </div>
                    )}

                    <form className="list-property-form" onSubmit={handleSubmit} noValidate>
                      <div className="input-wrapper">
                        <label className="input-label">
                          {t('list_property.form_name')} <span className="input-required">*</span>
                        </label>
                        <div className="input-field input-md input-glow">
                          <span className="input-prefix"><User size={16} /></span>
                          <input className="input-element" name="full_name" required
                            value={form.full_name} onChange={handleChange} placeholder={t('list_property.placeholder_name')} />
                        </div>
                      </div>

                      <div className="input-wrapper">
                        <label className="input-label">
                          {t('list_property.form_contact')} <span className="input-required">*</span>
                        </label>
                        <div className="input-field input-md input-glow">
                          <span className="input-prefix"><Mail size={16} /></span>
                          <input className="input-element" name="phone_email" required
                            value={form.phone_email} onChange={handleChange} placeholder={t('list_property.placeholder_contact')} />
                        </div>
                      </div>

                      <div className="input-wrapper">
                        <label className="input-label">
                          {t('list_property.form_message')} <span className="input-required">*</span>
                        </label>
                        <div className="input-field input-md input-glow">
                          <span className="input-prefix"><MessageSquare size={16} /></span>
                          <textarea className="input-element" name="message" required
                            value={form.message} onChange={handleChange}
                            placeholder={t('list_property.placeholder_message')} rows={3} />
                        </div>
                      </div>

                      <div className="checkbox-group">
                        <label className="checkbox-label">
                          <input type="checkbox" checked={agreeContact}
                            onChange={e => setAgreeContact(e.target.checked)} />
                          <span className="checkbox-custom">
                            {agreeContact && <Check size={14} strokeWidth={3} color="white" />}
                          </span>
                          <span className="checkbox-text">
                            {t('list_property.consent_contact')}
                          </span>
                        </label>
                      </div>

                      <Button type="submit" variant="primary" size="xl" fullWidth disabled={submitting} icon={submitting ? undefined : <ArrowDown size={20} />}>
                        {submitting ? t('list_property.submitting') : t('list_property.submit_btn')}
                      </Button>
                    </form>

                    <div className="trust-strip">
                      <div className="trust-strip-item">
                        <ShieldCheck size={16} strokeWidth={1.5} />
                        <span>{t('list_property.trust_secure')}</span>
                      </div>
                      <div className="trust-strip-item">
                        <Clock size={16} strokeWidth={1.5} />
                        <span>{t('list_property.trust_response')}</span>
                      </div>
                      <div className="trust-strip-item">
                        <Star size={16} strokeWidth={1.5} />
                        <span>{t('list_property.trust_owners')}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
