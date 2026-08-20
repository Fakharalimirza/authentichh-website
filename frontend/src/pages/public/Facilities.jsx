import { Helmet } from 'react-helmet-async';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wifi, Snowflake, Tv, WashingMachine, CookingPot, Coffee, Wind, Shield,
  Waves, Dumbbell, Car, ShieldCheck, LockKeyhole, Building2, MapPin,
  Home, Hotel, Shield as ShieldIcon, ChevronRight,
} from 'lucide-react';
import Card from '../../components/public/Card';
import Button from '../../components/public/Button';
import { useI18n } from '../../i18n/I18nContext';

const iconMap = {
  'Wi-Fi': Wifi,
  'Air Conditioning': Snowflake,
  'Smart TV': Tv,
  'Washing Machine': WashingMachine,
  'Equipped Kitchen': CookingPot,
  'Coffee Maker': Coffee,
  'Hair Dryer': Wind,
  'Safe': Shield,
  'Swimming Pool': Waves,
  'Gym': Dumbbell,
  'Parking': Car,
  '24-Hour Security': ShieldCheck,
  'Smart Lock': LockKeyhole,
  'Balcony': Building2,
};

const catIcons = {
  'Stay Essentials': Home,
  'Comfort & Convenience': Hotel,
  'Building & Security': ShieldIcon,
};

function FacilityCard({ name, desc, iconKey }) {
  const Icon = iconMap[iconKey] || MapPin;
  return (
    <Card variant="elevated" className="facility-card">
      <div className="facility-icon-wrap">
        <Icon size={24} strokeWidth={1.6} />
      </div>
      <h3 className="facility-name">{name}</h3>
      <p className="facility-desc">{desc}</p>
    </Card>
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

export default function Facilities() {
  const { t } = useI18n();

  const allFacilities = [
    { name: t('facilities.wifi'), desc: t('facilities.wifi_desc'), iconKey: 'Wi-Fi', key: 'wifi' },
    { name: t('facilities.ac'), desc: t('facilities.ac_desc'), iconKey: 'Air Conditioning', key: 'ac' },
    { name: t('facilities.smart_tv'), desc: t('facilities.smart_tv_desc'), iconKey: 'Smart TV', key: 'smart_tv' },
    { name: t('facilities.washer'), desc: t('facilities.washer_desc'), iconKey: 'Washing Machine', key: 'washer' },
    { name: t('facilities.kitchen'), desc: t('facilities.kitchen_desc'), iconKey: 'Equipped Kitchen', key: 'kitchen' },
    { name: t('facilities.coffee'), desc: t('facilities.coffee_desc'), iconKey: 'Coffee Maker', key: 'coffee' },
    { name: t('facilities.hair'), desc: t('facilities.hair_desc'), iconKey: 'Hair Dryer', key: 'hair' },
    { name: t('facilities.safe'), desc: t('facilities.safe_desc'), iconKey: 'Safe', key: 'safe' },
    { name: t('facilities.balcony'), desc: t('facilities.balcony_desc'), iconKey: 'Balcony', key: 'balcony' },
    { name: t('facilities.smartlock'), desc: t('facilities.smartlock_desc'), iconKey: 'Smart Lock', key: 'smartlock' },
    { name: t('facilities.pool'), desc: t('facilities.pool_desc'), iconKey: 'Swimming Pool', key: 'pool' },
    { name: t('facilities.gym'), desc: t('facilities.gym_desc'), iconKey: 'Gym', key: 'gym' },
    { name: t('facilities.parking'), desc: t('facilities.parking_desc'), iconKey: 'Parking', key: 'parking' },
    { name: t('facilities.security'), desc: t('facilities.security_desc'), iconKey: '24-Hour Security', key: 'security' },
  ];

  const categories = [
    {
      title: t('facilities.cat_essentials'),
      iconKey: 'Stay Essentials',
      items: allFacilities.filter(f => ['wifi', 'ac', 'smart_tv', 'washer', 'kitchen', 'coffee', 'hair', 'safe'].includes(f.key)),
    },
    {
      title: t('facilities.cat_comfort'),
      iconKey: 'Comfort & Convenience',
      items: allFacilities.filter(f => ['balcony', 'smartlock'].includes(f.key)),
    },
    {
      title: t('facilities.cat_building'),
      iconKey: 'Building & Security',
      items: allFacilities.filter(f => ['pool', 'gym', 'parking', 'security'].includes(f.key)),
    },
  ];

  const featured = allFacilities.filter(f => ['pool', 'gym', 'parking', 'security'].includes(f.key));

  return (
    <>
      <Helmet>
        <title>{t('facilities.title')}</title>
        <meta name="description" content={t('facilities.subtitle')} />
        <meta property="og:title" content={t('facilities.title')} />
      </Helmet>
      <div className="page-header">
        <div className="container">
          <h1 style={{ color: 'white' }}>{t('facilities.heading')}</h1>
          <p>{t('facilities.subtitle')}</p>
        </div>
      </div>

      <section className="section contact-section">
        <div className="container">
          <AnimateSection>
            <Card variant="elevated" style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-8)', maxWidth: 700, margin: '0 auto' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', lineHeight: 1.8, margin: 0 }}>
                {t('facilities.intro')}
              </p>
            </Card>
          </AnimateSection>

          {categories.map((cat, ci) => {
            const CatIcon = catIcons[cat.iconKey] || Building2;
            return (
              <div key={ci} style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>
                <AnimateSection>
                  <h2 className="contact-info-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'center' }}>
                    <CatIcon size={22} strokeWidth={1.8} />
                    {cat.title}
                  </h2>
                </AnimateSection>
                <div className="facilities-grid">
                  {cat.items.map((f) => (
                    <AnimateSection key={f.key}>
                      <FacilityCard name={f.name} desc={f.desc} iconKey={f.iconKey} />
                    </AnimateSection>
                  ))}
                </div>
              </div>
            );
          })}

          <AnimateSection>
            <div style={{ paddingTop: 'var(--space-16)' }}>
              <h2 className="contact-info-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'center' }}>
                <Building2 size={22} strokeWidth={1.8} />
                {t('facilities.premium')}
              </h2>
              <p className="section-subtitle" style={{ marginBottom: 'var(--space-8)' }}>
                {t('facilities.premium_desc')}
              </p>
            </div>
          </AnimateSection>
          <div className="featured-grid">
            {featured.map((f) => {
              const Icon = iconMap[f.iconKey] || MapPin;
              return (
                <AnimateSection key={f.key} threshold={0.1}>
                  <Card variant="elevated" className="featured-card">
                    <div className="featured-icon">
                      <Icon size={32} strokeWidth={1.5} />
                    </div>
                    <div className="featured-body">
                      <h3>{f.name}</h3>
                      <p>{f.desc}</p>
                    </div>
                  </Card>
                </AnimateSection>
              );
            })}
          </div>

          <AnimateSection>
            <div style={{ textAlign: 'center', paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-8)' }}>
              <h2 className="cta-title">{t('facilities.find_stay')}</h2>
              <p className="cta-sub">
                {t('facilities.find_stay_text')}
              </p>
              <div className="cta-actions">
                <Button variant="primary" size="xl" onClick={() => window.location.href = '/apartments'}>
                  {t('facilities.explore_apartments')}
                </Button>
                <Button variant="accent" size="xl" onClick={() => window.location.href = '/contact'}>
                  {t('facilities.contact_us')} <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </AnimateSection>
        </div>
      </section>
    </>
  );
}
