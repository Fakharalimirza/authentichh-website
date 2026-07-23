import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wifi, Snowflake, Tv, WashingMachine, CookingPot, Coffee, Wind, Shield,
  Waves, Dumbbell, Car, ShieldCheck, LockKeyhole, Building2, MapPin,
  Home, Hotel, Shield as ShieldIcon, ChevronRight,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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

const allFacilities = [
  { name: 'Wi-Fi', desc: 'Stay connected with reliable high-speed internet throughout your stay.' },
  { name: 'Air Conditioning', desc: 'Central cooling keeps your stay comfortable regardless of the Dubai weather.' },
  { name: 'Smart TV', desc: 'Stream your favorite shows on modern smart televisions.' },
  { name: 'Washing Machine', desc: 'In-unit washer for laundry convenience during extended stays.' },
  { name: 'Equipped Kitchen', desc: 'Modern kitchens with all appliances for your cooking needs.' },
  { name: 'Coffee Maker', desc: 'Start your day right with premium coffee making facilities.' },
  { name: 'Hair Dryer', desc: 'Hair dryers provided in all bathrooms for your convenience.' },
  { name: 'Safe', desc: 'In-room safety deposit boxes to secure your valuables.' },
  { name: 'Balcony', desc: 'Private balconies with stunning Dubai skyline or waterfront views.' },
  { name: 'Smart Lock', desc: 'Keyless entry for secure and hassle-free check-in.' },
  { name: 'Swimming Pool', desc: 'Sparkling pools in select properties for relaxation and exercise.' },
  { name: 'Gym', desc: 'Well-equipped fitness centers to stay fit during your stay.' },
  { name: 'Parking', desc: 'Reserved parking spaces for your convenience and peace of mind.' },
  { name: '24-Hour Security', desc: 'Round-the-clock security for your safety and peace of mind.' },
];

const categories = [
  {
    title: 'Stay Essentials',
    items: allFacilities.filter(f =>
      ['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Washing Machine', 'Equipped Kitchen', 'Coffee Maker', 'Hair Dryer', 'Safe'].includes(f.name)
    ),
  },
  {
    title: 'Comfort & Convenience',
    items: allFacilities.filter(f =>
      ['Balcony', 'Smart Lock'].includes(f.name)
    ),
  },
  {
    title: 'Building & Security',
    items: allFacilities.filter(f =>
      ['Swimming Pool', 'Gym', 'Parking', '24-Hour Security'].includes(f.name)
    ),
  },
];

const featured = allFacilities.filter(f =>
  ['Swimming Pool', 'Gym', 'Parking', '24-Hour Security'].includes(f.name)
);

function FacilityCard({ name, desc }) {
  const Icon = iconMap[name] || MapPin;
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
  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1 style={{ color: 'white' }}>Facilities & Amenities</h1>
          <p>Thoughtfully selected comforts designed to make every stay convenient, relaxing, and memorable.</p>
        </div>
      </div>

      <section className="section contact-section">
        <div className="container">
          <AnimateSection>
            <Card variant="elevated" style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-8)', maxWidth: 700, margin: '0 auto' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', lineHeight: 1.8, margin: 0 }}>
                From fully equipped kitchens and high-speed Wi-Fi to swimming pools, fitness facilities,
                secure parking, and smart access — our properties are selected to provide everything guests
                need for a comfortable stay in Dubai.
              </p>
            </Card>
          </AnimateSection>

          {categories.map((cat, ci) => {
            const CatIcon = catIcons[cat.title] || Building2;
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
                    <AnimateSection key={f.name}>
                      <FacilityCard {...f} />
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
                Premium Facilities
              </h2>
              <p className="section-subtitle" style={{ marginBottom: 'var(--space-8)' }}>
                Select properties feature these premium amenities for an elevated experience.
              </p>
            </div>
          </AnimateSection>
          <div className="featured-grid">
            {featured.map((f) => {
              const Icon = iconMap[f.name] || MapPin;
              return (
                <AnimateSection key={f.name} threshold={0.1}>
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
              <h2 className="cta-title">Find Your Perfect Stay</h2>
              <p className="cta-sub">
                Explore our fully furnished holiday homes and discover properties
                with the facilities that matter most to you.
              </p>
              <div className="cta-actions">
                <Button variant="primary" size="xl" onClick={() => window.location.href = '/apartments'}>
                  Explore Apartments
                </Button>
                <Button variant="accent" size="xl" onClick={() => window.location.href = '/contact'}>
                  Contact Us <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </AnimateSection>
        </div>
      </section>
    </>
  );
}
