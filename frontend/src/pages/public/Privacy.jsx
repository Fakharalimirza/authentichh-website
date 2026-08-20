import { Helmet } from 'react-helmet-async';
import { useState, useRef, useEffect } from 'react';
import {
  Database, ListChecks, Cookie, Shield, Share2, Clock, CheckCircle, Mail, RefreshCw,
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

function Li({ html }) {
  return <li dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function Privacy() {
  const { t } = useI18n();

  const sections = [
    {
      icon: Database,
      title: t('privacy.collect_title'),
      content: (
        <>
          <p>{t('privacy.collect_intro')}</p>
          <ul>
            <Li html={t('privacy.collect_li_1')} />
            <Li html={t('privacy.collect_li_2')} />
            <Li html={t('privacy.collect_li_3')} />
            <Li html={t('privacy.collect_li_4')} />
          </ul>
        </>
      ),
    },
    {
      icon: ListChecks,
      title: t('privacy.use_title'),
      content: (
        <>
          <p>{t('privacy.use_intro')}</p>
          <ul>
            <li>{t('privacy.use_li_1')}</li>
            <li>{t('privacy.use_li_2')}</li>
            <li>{t('privacy.use_li_3')}</li>
            <li>{t('privacy.use_li_4')}</li>
            <li>{t('privacy.use_li_5')}</li>
          </ul>
        </>
      ),
    },
    { icon: Cookie, title: t('privacy.cookies_title'), content: <p>{t('privacy.cookies_content')}</p> },
    { icon: Shield, title: t('privacy.protection_title'), content: <p>{t('privacy.protection_content')}</p> },
    { icon: Share2, title: t('privacy.sharing_title'), content: <p>{t('privacy.sharing_content')}</p> },
    { icon: Clock, title: t('privacy.retention_title'), content: <p>{t('privacy.retention_content')}</p> },
    {
      icon: CheckCircle,
      title: t('privacy.rights_title'),
      content: (
        <>
          <p>{t('privacy.rights_intro')}</p>
          <ul>
            <li>{t('privacy.rights_li_1')}</li>
            <li>{t('privacy.rights_li_2')}</li>
            <li>{t('privacy.rights_li_3')}</li>
            <li>{t('privacy.rights_li_4')}</li>
            <li>{t('privacy.rights_li_5')}</li>
          </ul>
        </>
      ),
    },
    { icon: Mail, title: t('privacy.contact_title'), content: (<p>{t('privacy.contact_content')}<br />Email: info@authenticholidayhomes.ae<br />Phone: +971 50 000 0000</p>) },
    {
      icon: RefreshCw,
      title: t('privacy.updates_title'),
      content: (
        <>
          <p>{t('privacy.updates_content')}</p>
          <p><em>{t('privacy.last_updated')}</em></p>
        </>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t('privacy.title')}</title>
        <meta name="description" content={t('privacy.subtitle')} />
        <meta property="og:title" content={t('privacy.title')} />
      </Helmet>
      <div className="page-header">
        <div className="container">
          <h1 style={{ color: 'white' }}>{t('privacy.heading')}</h1>
          <p>{t('privacy.subtitle')}</p>
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
