import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Home, Unlock, Settings, ClipboardCheck,
  Camera, Globe, Star, ShieldCheck, Clock, ChevronRight,
  AlertCircle, CheckCircle2, User, Mail, MessageSquare,
  Sparkles, Key, BarChart3, ArrowDown, Check,
} from 'lucide-react';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DirhamSymbol from '../components/ui/DirhamSymbol';

function useOnScreen(ref, threshold = 0.2) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return visible;
}

function AnimateSection({ children, className = '', threshold }) {
  const ref = useRef(null);
  const visible = useOnScreen(ref, threshold);
  return (
    <div ref={ref} className={`animate-section ${visible ? 'animate-in' : ''} ${className}`}>
      {children}
    </div>
  );
}

function StatItem({ target, suffix = '', label, decimal = false }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 2000;
          const start = performance.now();
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(decimal ? parseFloat((eased * target).toFixed(1)) : Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimal]);

  return (
    <div className="stat-item" ref={ref}>
      <div className="stat-number">
        {count}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

const comparisons = [
  { icon: TrendingUp, title: 'Monthly Returns', detail: 'Experience consistent monthly income, providing financial stability and flexibility' },
  { icon: Home, title: 'Flexible Living', detail: 'Move into your property whenever you desire, providing you with the ultimate flexibility' },
  { icon: DirhamSymbol, title: 'Increased Revenue', detail: 'Generate 15%-25% more revenue compared to yearly rentals, boosting your overall returns' },
  { icon: Unlock, title: 'Sale at Any Time', detail: 'Enjoy the freedom to sell your unit whenever you choose, without being tied down to a long-term lease' },
  { icon: Settings, title: 'Property Maintenance', detail: 'Our expert management ensures your property stays in tiptop condition, guaranteeing its longevity and appeal' },
];

const steps = [
  {
    icon: ClipboardCheck,
    title: 'Sign Contract',
    detail: 'The landlord initiates the process by signing a contract with Authentic Holiday Homes LLC.',
  },
  {
    icon: Star,
    title: 'DTCM Registration',
    detail: 'We handle the DTCM (Dubai Tourism and Commerce Marketing) registration on your behalf.',
    table: true,
  },
  {
    icon: Camera,
    title: 'Property Setup & Photography',
    detail: 'Professional photos and videos are taken to showcase your property at its best across all platforms.',
  },
  {
    icon: Globe,
    title: 'Listing Goes Live',
    detail: 'Your property is published across our website, OTAs, and booking channels — reaching thousands of potential guests.',
  },
  {
    icon: TrendingUp,
    title: 'Start Earning',
    detail: 'Receive bookings and enjoy hassle-free passive income while we handle every detail.',
  },
];

const dtcmFees = [
  { type: 'Studio', fee: 370 },
  { type: '1 Bedroom', fee: 370 },
  { type: '2 Bedroom', fee: 670 },
  { type: '3 Bedroom', fee: 970 },
];

const services = [
  { icon: Camera, title: 'Property Marketing', detail: 'Promoting your property through high-quality photos and videos on various channels.' },
  { icon: Sparkles, title: 'Linen Services', detail: 'Ensuring your property is always equipped with clean linens, including bedsheets, pillow covers, and towels.' },
  { icon: Key, title: 'Check-In & Check-Out', detail: 'Managing the check-in and check-out process for a seamless experience for your guests.' },
  { icon: BarChart3, title: 'Stay Connected', detail: 'Receive real-time updates, track booking status and access detailed insights into your property\'s performance with our exclusive web portal.' },
];

export default function ListProperty() {
  const navigate = useNavigate();
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
      setError('Please agree to be contacted by Authentic Holiday Homes');
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/landlord-requests', { ...form, agreeContact });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
      <section className="section contact-section">
        <div className="container">

          {/* Hero */}
          <div className="hero-content" style={{ paddingTop: 'calc(var(--header-height) + var(--space-12))' }}>
            <div className="hero-badge">Property Investment</div>
            <h1 className="hero-title">
              Unlock the Rental Potential<br />
              <span className="hero-accent">of Your Property</span>
            </h1>
            <p className="hero-sub">
              Discover the advantages of short-term rentals over traditional yearly leasing
              and elevate your property investment to new heights.
            </p>
            <div className="hero-actions">
              <Button variant="primary" size="xl" onClick={scrollToForm} icon={<ArrowDown size={20} />}>
                Start Earning
              </Button>
              <Button variant="accent" size="xl" onClick={scrollToSteps}>
                See How It Works
              </Button>
            </div>
          </div>

          {/* Stats bar with gold gradient preserve */}
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
              <StatItem target={200} suffix="+" label="Properties Managed" />
              <div className="stat-item">
                <div className="stat-number">Since 2021</div>
                <div className="stat-label">Years Experience</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.2<Star size={18} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 2 }} /></div>
                <div className="stat-label">Google Rating</div>
              </div>
              <StatItem target={25} suffix="%" label="More Revenue" />
            </div>
          </div>

          {/* Comparison */}
          <div style={{ paddingTop: 'var(--space-16)' }}>
            <AnimateSection>
              <div className="section-label">Why Choose Short-Term Rentals</div>
              <h2 className="section-title">Short-Term Rental VS Yearly Rental</h2>
              <p className="section-subtitle">
                See how short-term holiday rentals outperform traditional yearly leasing across every metric.
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

          {/* Timeline */}
          <div style={{ paddingTop: 'var(--space-16)' }} ref={stepsRef}>
            <AnimateSection>
              <div className="section-label">Simple Process</div>
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">
                From contract signing to your first booking — we guide you every step of the way.
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
                                  <th>Apartment Type</th>
                                  <th>Registration Fee</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dtcmFees.map((row, j) => (
                                  <tr key={j}>
                                    <td>{row.type}</td>
                                    <td><DirhamSymbol size="1em" /> {row.fee.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <p className="dtcm-note">Note: Permit will only be issued if the apartment is furnished according to DTCM standards.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </AnimateSection>
                );
              })}
            </div>
          </div>

          {/* Services */}
          <div style={{ paddingTop: 'var(--space-16)' }}>
            <AnimateSection>
              <div className="section-label">Our Commission</div>
              <h2 className="section-title">We Take Care of Everything</h2>
              <p className="section-subtitle">
                Our comprehensive 15% commission covers everything you need to run a successful holiday home.
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

          {/* CTA + Form */}
          <div style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-12)', textAlign: 'center' }}>
            <AnimateSection>
              <h2 className="cta-title">Ready to Maximize Your Property's Potential?</h2>
              <p className="cta-sub">
                Join 200+ property owners who trust Authentic Holiday Homes to manage their short-term rentals.
              </p>
              <div className="cta-actions">
                <Button variant="primary" size="xl" onClick={scrollToForm} icon={<ArrowDown size={20} />}>
                  List Your Property
                </Button>
                <Button variant="accent" size="xl" onClick={() => navigate('/contact#contact-info')} icon={<ChevronRight size={20} />}>
                  Contact Us
                </Button>
              </div>
            </AnimateSection>

            <div className={`form-reveal ${showForm ? 'open' : ''}`} ref={formRef}>
              <div className="form-reveal-inner">
                {submitted ? (
                  <Card variant="elevated" className="form-success">
                    <div className="form-success-icon"><CheckCircle2 size={48} strokeWidth={1.5} /></div>
                    <h3 className="form-success-title">Thank You!</h3>
                    <p className="form-success-text">
                      Thank you for your interest. Our team has received your request and will contact you within 24 hours.
                    </p>
                    <Button variant="primary" onClick={() => { setSubmitted(false); setShowForm(false); setForm({ full_name: '', phone_email: '', message: '' }); setAgreeContact(false); }}>
                      Submit Another Request
                    </Button>
                  </Card>
                ) : (
                  <>
                    <h3 className="form-title">List Your Property</h3>
                    <p className="form-subtitle">Leave your details and we will call you back within 24 hours.</p>

                    {error && (
                      <div className="form-error" style={{ marginBottom: 'var(--space-4)' }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </div>
                    )}

                    <form className="list-property-form" onSubmit={handleSubmit} noValidate>
                      <div className="input-wrapper">
                        <label className="input-label">
                          Full Name <span className="input-required">*</span>
                        </label>
                        <div className="input-field input-md input-glow">
                          <span className="input-prefix"><User size={16} /></span>
                          <input className="input-element" name="full_name" required
                            value={form.full_name} onChange={handleChange} placeholder="Your full name" />
                        </div>
                      </div>

                      <div className="input-wrapper">
                        <label className="input-label">
                          Phone or Email <span className="input-required">*</span>
                        </label>
                        <div className="input-field input-md input-glow">
                          <span className="input-prefix"><Mail size={16} /></span>
                          <input className="input-element" name="phone_email" required
                            value={form.phone_email} onChange={handleChange} placeholder="Phone number or email address" />
                        </div>
                      </div>

                      <div className="input-wrapper">
                        <label className="input-label">
                          Message <span className="input-required">*</span>
                        </label>
                        <div className="input-field input-md input-glow">
                          <span className="input-prefix"><MessageSquare size={16} /></span>
                          <textarea className="input-element" name="message" required
                            value={form.message} onChange={handleChange}
                            placeholder="Tell us about your property..." rows={3} />
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
                            I agree to be contacted by Authentic Holiday Homes
                          </span>
                        </label>
                      </div>

                      <Button type="submit" variant="primary" size="xl" fullWidth disabled={submitting} icon={submitting ? undefined : <ArrowDown size={20} />}>
                        {submitting ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </form>

                    <div className="trust-strip">
                      <div className="trust-strip-item">
                        <ShieldCheck size={16} strokeWidth={1.5} />
                        <span>Your data is secure</span>
                      </div>
                      <div className="trust-strip-item">
                        <Clock size={16} strokeWidth={1.5} />
                        <span>24hr response time</span>
                      </div>
                      <div className="trust-strip-item">
                        <Star size={16} strokeWidth={1.5} />
                        <span>Trusted by 500+ owners</span>
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
