import { Helmet } from 'react-helmet-async';
import { useState, useRef, useEffect } from 'react';
import {
  FileText, Calendar, Ban, Users, Building2, Shield, RefreshCw, Mail,
} from 'lucide-react';
import Card from '../../components/public/Card';
import { useI18n } from '../../i18n/I18nContext';

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

export default function Terms() {
  const { t } = useI18n();

  const sections = [
    { icon: FileText, title: t('terms.intro_title'), content: <p>{t('terms.intro_content')}</p> },
    { icon: Calendar, title: t('terms.booking_title'), content: (<><p>{t('terms.booking_content_1')}</p><p>{t('terms.booking_content_2')}</p></>) },
    { icon: Ban, title: t('terms.cancellation_title'), content: <p>{t('terms.cancellation_content')}</p> },
    {
      icon: Users,
      title: t('terms.guest_title'),
      content: (
        <>
          <p>{t('terms.guest_intro')}</p>
          <ul>
            <li>{t('terms.guest_li_1')}</li>
            <li>{t('terms.guest_li_2')}</li>
            <li>{t('terms.guest_li_3')}</li>
            <li>{t('terms.guest_li_4')}</li>
            <li>{t('terms.guest_li_5')}</li>
            <li>{t('terms.guest_li_6')}</li>
          </ul>
        </>
      ),
    },
    { icon: Building2, title: t('terms.listings_title'), content: <p>{t('terms.listings_content')}</p> },
    { icon: Shield, title: t('terms.liability_title'), content: <p>{t('terms.liability_content')}</p> },
    { icon: RefreshCw, title: t('terms.changes_title'), content: <p>{t('terms.changes_content')}</p> },
    { icon: Mail, title: t('terms.contact_title'), content: (<p>{t('terms.contact_content')}<br />Email: info@authenticholidayhomes.ae<br />Phone: +971 50 000 0000</p>) },
  ];

  return (
    <>
      <Helmet>
        <title>{t('terms.title')}</title>
        <meta name="description" content={t('terms.subtitle')} />
        <meta property="og:title" content={t('terms.title')} />
      </Helmet>
      <div className="page-header">
        <div className="container">
          <h1 style={{ color: 'white' }}>{t('terms.heading')}</h1>
          <p>{t('terms.subtitle')}</p>
        </div>
      </div>

      <section className="section contact-section">
        <div className="container">
          <AnimateSection>
            <Card variant="elevated" className="legal-content">
              {sections.map((s, i) => (
                <div key={i}>
                  <h2 className="contact-info-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-accent-light)',
                      color: 'var(--color-accent)',
                      flexShrink: 0,
                    }}>
                      <s.icon size={20} strokeWidth={1.6} />
                    </span>
                    {s.title}
                  </h2>
                  {s.content}
                </div>
              ))}
            </Card>
          </AnimateSection>
        </div>
      </section>
    </>
  );
}
