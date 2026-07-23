import { useState, useRef, useEffect } from 'react';
import {
  MapPin, Phone, MessageCircle, Mail, Clock,
  Send, CheckCircle, AlertCircle, ChevronRight, Star, Check,
} from 'lucide-react';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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

const contactItems = [
  {
    icon: MapPin,
    title: 'Our Address',
    lines: ['Dubai, United Arab Emirates', 'Downtown Dubai, Business Bay'],
    link: { href: 'https://maps.google.com/?q=Downtown+Dubai', label: 'View on Map' },
  },
  {
    icon: Phone,
    title: 'Phone',
    lines: ['+971 50 000 0000'],
    link: { href: 'tel:+971500000000', label: 'Call Now' },
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    lines: ['Quick replies within minutes'],
    link: { href: 'https://wa.me/971500000000', label: 'Chat on WhatsApp', target: '_blank' },
  },
  {
    icon: Mail,
    title: 'Email',
    lines: ['info@authenticholidayhomes.ae'],
    link: { href: 'mailto:info@authenticholidayhomes.ae', label: 'Send Email' },
  },
  {
    icon: Clock,
    title: 'Working Hours',
    lines: ['Sunday - Thursday: 9:00 AM - 6:00 PM', 'Friday - Saturday: By appointment'],
  },
];

export default function Contact() {
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
      setError('Please agree to the terms and conditions');
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
      setError(err.response?.data?.message || 'Failed to send message');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => setSubmitted(false);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We would love to hear from you</p>
        </div>
      </div>

      <section className="section contact-section">
        <div className="container">
          <div className="contact-grid">
            <AnimateSection>
              <Card variant="elevated" id="contact-info">
                  <h2 className="contact-info-title">Get In Touch</h2>
                  <p className="contact-info-sub">
                    We are here to help. Reach out and we will get back to you within 24 hours.
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
                      <h3>Message Sent!</h3>
                      <p>
                        Thank you for your message. We will get back to you within 24 hours.
                      </p>
                      <Button variant="ghost" onClick={handleReset}>
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h2 className="contact-form-title">Send Us a Message</h2>
                      <p className="contact-form-sub">
                        Have a question or need assistance? Fill out the form and we will be in touch.
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
                            Name <span className="input-required">*</span>
                          </label>
                          <div className="input-field input-md input-glow">
                            <input className="input-element" name="name" required
                              value={form.name} onChange={handleChange} placeholder="Your name" />
                          </div>
                        </div>

                        <div className="input-wrapper">
                          <label className="input-label">
                            Email <span className="input-required">*</span>
                          </label>
                          <div className="input-field input-md input-glow">
                            <input className="input-element" name="email" type="email" required
                              value={form.email} onChange={handleChange} placeholder="your@email.com" />
                          </div>
                        </div>

                        <div className="input-wrapper">
                          <label className="input-label">Phone</label>
                          <div className="input-field input-md input-glow">
                            <input className="input-element" name="phone" type="tel"
                              value={form.phone} onChange={handleChange} placeholder="+971 50 000 0000" />
                          </div>
                        </div>

                        <div className="input-wrapper">
                          <label className="input-label">Subject</label>
                          <div className="input-field input-md input-glow">
                            <input className="input-element" name="subject"
                              value={form.subject} onChange={handleChange} placeholder="What is this about?" />
                          </div>
                        </div>

                        <div className="input-wrapper">
                          <label className="input-label">
                            Message <span className="input-required">*</span>
                          </label>
                          <div className="input-field input-md input-glow">
                            <textarea className="input-element" name="message" required
                              value={form.message} onChange={handleChange}
                              placeholder="Tell us about your stay..." />
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
                              I agree to the <a href="/terms" target="_blank">Terms &amp; Conditions</a>
                            </span>
                          </label>

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

                        <Button type="submit" variant="primary" size="xl" fullWidth
                          disabled={submitting}>
                          {submitting ? 'Sending...' : 'Send Message'}
                        </Button>
                      </form>
                    </>
                  )}
                </Card>
            </AnimateSection>
          </div>

          <AnimateSection>
            <Card variant="elevated" style={{ marginTop: 'var(--space-8)' }}>
              <h2 className="contact-info-title" style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>
                Find Us Here
              </h2>
              
              <div className="contact-map-wrap">
                <div className="contact-map">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.4429901893786!2d55.4081068!3d25.222000299999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43fbe01575e5%3A0xfad1b6ee64ef2244!2sAuthentic%20Holiday%20Homes!5e0!3m2!1sen!2sae!4v1784718947210!5m2!1sen!2sae"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title="Authentic Holiday Homes Location"
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
                  Leave us a Review
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
