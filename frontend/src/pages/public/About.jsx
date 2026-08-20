import { Helmet } from 'react-helmet-async';
import { useState, useRef, useEffect } from 'react';
import {
  Star, ShieldCheck, MapPin, Users, ChevronRight,
} from 'lucide-react';
import Card from '../../components/public/Card';
import Button from '../../components/public/Button';
import AgentAdminCard from '../../components/public/AgentAdminCard';
import { useI18n } from '../../i18n/I18nContext';

function useOnScreen(ref, threshold = 0.15) {
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

const ceo = {
  name: 'Ahmed Al Doulah',
  role: 'CEO',
  image: '/images/about/ceo.png',
};

const manager = {
  name: 'Mohammad Al Doulah',
  role: 'Manager',
  image: '/images/about/manager.jpg',
};

const agents = [
  { name: 'Ahmed', role: 'Agent', image: '/images/about/ahmed.png' },
  { name: 'Issa', role: 'Agent', image: '/images/about/issa.png' },
  { name: 'Yousuf', role: 'Agent', image: '' },
];

const admins = [
  { name: 'Admin 1', role: 'Administration', image: '/images/about/admin-1.png' },
  { name: 'Admin 2', role: 'Administration', image: '/images/about/admin-2.png' },
  { name: 'Admin 3', role: 'Administration', image: '/images/about/admin-3.png' },
  { name: 'Admin 4', role: 'Administration', image: '/images/about/admin-4.jpg' },
  { name: 'Admin 5', role: 'Administration', image: '/images/about/admin-5.png' },
];

export default function About() {
  const { t } = useI18n();
  const valuesRef = useRef(null);
  const statsRef = useRef(null);

  const values = [
    { icon: Star, title: t('about.value_quality_title'), desc: t('about.value_quality_desc') },
    { icon: ShieldCheck, title: t('about.value_trusted_title'), desc: t('about.value_trusted_desc') },
    { icon: MapPin, title: t('about.value_locations_title'), desc: t('about.value_locations_desc') },
    { icon: Users, title: t('about.value_team_title'), desc: t('about.value_team_desc') },
  ];

  function useCarousel(ref) {
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const items = Array.from(el.children);
      if (items.length < 2) return;
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % items.length;
        const itemRect = items[index].getBoundingClientRect();
        const containerRect = el.getBoundingClientRect();
        el.scrollBy({ left: itemRect.left - containerRect.left, behavior: 'smooth' });
      }, 3000);
      return () => clearInterval(interval);
    }, [ref]);
  }

  useCarousel(valuesRef);
  useCarousel(statsRef);

  return (
    <>
      <Helmet>
        <title>{t('about.meta_title')}</title>
        <meta name="description" content={t('about.meta_description')} />
        <meta name="keywords" content={t('about.meta_keywords')} />
        <meta property="og:title" content={t('about.meta_title')} />
        <meta property="og:description" content={t('about.og_description')} />
      </Helmet>
      <div className="page-header">
        <div className="container">
          <h1 style={{ color: 'white' }}>{t('about.title')}</h1>
          <p>{t('about.subtitle')}</p>
        </div>
      </div>

      <section className="section contact-section">
        <div className="container">
          <div className="about-lead-grid">
            <AnimateSection>
              <div className="about-image-wrap">
                <img src={ceo.image} alt={ceo.name} />
              </div>
            </AnimateSection>
            <AnimateSection>
              <Card variant="elevated" className="about-content-card">
                <div className="about-greeting">
                  {t('about.ceo_greeting', { name: ceo.name, role: t('about.role_ceo') })}
                </div>
                <p>{t('about.ceo_text_1')}</p>
                <p>{t('about.ceo_text_2')}</p>
                <p className="about-signoff">{t('about.thank_you')}</p>
              </Card>
            </AnimateSection>
          </div>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container">
          <AnimateSection>
            <div className="section-label">{t('about.why_title')}</div>
            <h2 className="section-title">{t('about.why_heading')}</h2>
            <p className="section-subtitle">
              {t('about.why_subtitle')}
            </p>
          </AnimateSection>

          <div className="about-values-grid" ref={valuesRef}>
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <AnimateSection key={i} threshold={0.1}>
                  <Card variant="elevated" className="about-value-card">
                    <div className="about-value-icon"><Icon size={24} strokeWidth={1.5} /></div>
                    <h3 className="about-value-title">{v.title}</h3>
                    <p className="about-value-desc">{v.desc}</p>
                  </Card>
                </AnimateSection>
              );
            })}
          </div>

          <AnimateSection threshold={0.1}>
            <div className="about-why-text">
              <p>
                {t('about.why_text_pre')} <strong>2021</strong>{t('about.why_text_post')}
              </p>
            </div>
          </AnimateSection>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container">
          <div className="about-lead-grid flipped">
            <AnimateSection>
              <Card variant="elevated" className="about-content-card">
                <div className="about-greeting">
                  {t('about.manager_greeting', { name: manager.name, role: t('about.role_manager') })}
                </div>
                <p>{t('about.manager_text_1')}</p>
                <p>{t('about.manager_text_2')}</p>
              </Card>
            </AnimateSection>
            <AnimateSection>
              <div className="about-image-wrap">
                <img src={manager.image} alt={manager.name} />
              </div>
            </AnimateSection>
          </div>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container">
          <AnimateSection>
            <div className="section-label">{t('about.team_label')}</div>
            <h2 className="section-title">{t('about.team_title')}</h2>
            <p className="section-subtitle">
              {t('about.team_text')}
            </p>
          </AnimateSection>

          <Card variant="elevated">
            <AgentAdminCard
              agentImages={agents.map(a => a.image).filter(Boolean)}
              adminImages={admins.map(a => a.image).filter(Boolean)}
            />
          </Card>
        </div>
      </section>

      <section className="section stats-section">
        <div className="container">
          <div className="stats-bar" ref={statsRef}>
            <div className="stat-item">
              <div className="stat-number">200+</div>
              <div className="stat-label">{t('about.stats_properties')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{t('about.stats_since_2021')}</div>
              <div className="stat-label">{t('about.stats_years')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.2<Star size={18} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 2 }} /></div>
              <div className="stat-label">{t('about.stats_rating')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{t('about.stats_local')}</div>
              <div className="stat-label">{t('about.stats_emirati')}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section contact-section" style={{ textAlign: 'center', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
        <div className="container">
          <AnimateSection>
            <h2 className="cta-title">{t('about.cta_title')}</h2>
            <p className="cta-sub">
              {t('about.cta_text')}
            </p>
            <div className="cta-actions">
              <Button variant="primary" size="xl" onClick={() => window.location.href = '/apartments'}>
                {t('about.view_properties')}
              </Button>
              <Button variant="accent" size="xl" onClick={() => window.location.href = '/contact'}>
                {t('about.contact_us')} <ChevronRight size={20} />
              </Button>
            </div>
          </AnimateSection>
        </div>
      </section>
    </>
  );
}
