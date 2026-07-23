import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PropertyCard from '../components/ui/PropertyCard';
import { PropertyCardSkeleton } from '../components/ui/Skeleton';

const DEMO_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80',
  property1: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  property2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  property3: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  about: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
};

const benefits = [
  { icon: '🏢', title: 'Professionally Managed', desc: 'Fully managed holiday homes with professional standards and quality service.' },
  { icon: '📍', title: 'Prime Dubai Locations', desc: 'Properties in the most sought-after neighborhoods across Dubai.' },
  { icon: '💬', title: '24/7 Customer Support', desc: 'Dedicated customer support available around the clock.' },
  { icon: '🛋️', title: 'Fully Furnished', desc: 'Beautifully furnished apartments with modern interiors.' },
  { icon: '✨', title: 'Clean & Comfortable', desc: 'Professional cleaning and maintenance for every stay.' },
  { icon: '🔑', title: 'Secure Check-in', desc: 'Hassle-free secure check-in process with smart locks.' },
];

const facilities = [
  { icon: '🏊', name: 'Swimming Pool' },
  { icon: '🏋️', name: 'Gym' },
  { icon: '🅿️', name: 'Parking' },
  { icon: '📶', name: 'Wi-Fi' },
  { icon: '🔐', name: 'Smart Lock' },
  { icon: '🛡️', name: '24-Hour Security' },
  { icon: '🍳', name: 'Equipped Kitchen' },
  { icon: '❄️', name: 'Air Conditioning' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState({ location: '', bedrooms: '', guests: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/properties/featured').then(r => setFeatured(r.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.location) params.set('location', search.location);
    if (search.bedrooms) params.set('bedrooms', search.bedrooms);
    if (search.guests) params.set('guests', search.guests);
    navigate(`/apartments?${params.toString()}`);
  };

  const sectionTitle = (title) => (
    <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
      <hr className="divider-accent" style={{ margin: '0 auto var(--space-4)' }} />
      <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', marginBottom: 'var(--space-3)' }}>{title}</h2>
    </div>
  );

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src={DEMO_IMAGES.hero}
            alt="Dubai luxury"
            style={{ opacity: 0.55, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <Badge variant="accent" size="md" style={{ marginBottom: 'var(--space-4)' }}>
            ✦ Premium Holiday Homes
          </Badge>
          <h1 style={{ color: 'white', fontSize: 'clamp(2.25rem,6vw,4rem)', marginBottom: 'var(--space-4)', lineHeight: 1.08 }}>
            Your Perfect Stay in Dubai
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(1rem,2vw,1.2rem)', marginBottom: 'var(--space-8)', lineHeight: 1.7, maxWidth: 580 }}>
            Authentic Holiday Homes provides professionally managed holiday homes
            and luxury apartments in prime Dubai locations.
          </p>
          <div className="hero-buttons">
            <Link to="/apartments"><Button variant="primary" size="lg">Explore Apartments</Button></Link>
            <Link to="/list-your-property"><Button variant="secondary" size="lg" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', borderColor: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            >List Your Property</Button></Link>
          </div>

          <form onSubmit={handleSearch} style={{
            marginTop: 48,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 16,
            padding: 20,
          }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <select value={search.location} onChange={e => setSearch(s => ({ ...s, location: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 14, minWidth: 150, fontFamily: 'var(--font-sans)' }}>
                <option value="" style={{ color: '#333' }}>Location</option>
                <option value="Dubai Marina" style={{ color: '#333' }}>Dubai Marina</option>
                <option value="Downtown Dubai" style={{ color: '#333' }}>Downtown Dubai</option>
                <option value="Palm Jumeirah" style={{ color: '#333' }}>Palm Jumeirah</option>
                <option value="JBR" style={{ color: '#333' }}>JBR</option>
                <option value="Business Bay" style={{ color: '#333' }}>Business Bay</option>
              </select>
              <select value={search.bedrooms} onChange={e => setSearch(s => ({ ...s, bedrooms: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 14, minWidth: 150, fontFamily: 'var(--font-sans)' }}>
                <option value="" style={{ color: '#333' }}>Bedrooms</option>
                {[1,2,3,4].map(b => <option key={b} value={b} style={{ color: '#333' }}>{b} Bedroom{b > 1 ? 's' : ''}</option>)}
              </select>
              <select value={search.guests} onChange={e => setSearch(s => ({ ...s, guests: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 14, minWidth: 150, fontFamily: 'var(--font-sans)' }}>
                <option value="" style={{ color: '#333' }}>Guests</option>
                {[2,4,6,8].map(g => <option key={g} value={g} style={{ color: '#333' }}>{g} Guests</option>)}
              </select>
              <button type="submit" style={{
                padding: '10px 28px', borderRadius: 8, border: 'none',
                background: 'var(--color-primary)', color: 'white',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
                fontFamily: 'var(--font-sans)', transition: 'background 150ms ease-out',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ─── Featured Properties ───────────────────────── */}
      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          {sectionTitle('Featured Properties')}
          <p className="text-muted text-center" style={{ marginTop: 'calc(-1 * var(--space-8))', marginBottom: 'var(--space-10)' }}>
            Handpicked premium holiday homes in Dubai
          </p>

          {featured.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
              {[1,2,3].map(i => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
              {featured.map(p => <PropertyCard key={p.id} property={p} demoImg={DEMO_IMAGES.property1} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─── About ─────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--color-surface-secondary)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-12)',
            alignItems: 'center',
          }}>
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              height: 480,
              position: 'relative',
            }}>
              <img
                src={DEMO_IMAGES.about}
                alt="Luxury Dubai apartment"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 24,
                insetInlineStart: 24,
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4) var(--space-5)',
                boxShadow: 'var(--shadow-lg)',
              }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>5+</div>
                <div className="text-sm text-muted">Years of Excellence</div>
              </div>
            </div>
            <div>
              <hr className="divider-accent" style={{ marginBottom: 'var(--space-4)' }} />
              <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.5rem)', marginBottom: 'var(--space-4)' }}>
                About Authentic Holiday Homes
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Authentic Holiday Homes is a premier holiday home management company based in Dubai.
                We specialize in providing professionally managed, fully furnished luxury apartments
                and holiday homes in the most prestigious locations across the city.
              </p>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
                Our commitment to quality, attention to detail, and exceptional guest service sets
                us apart. Whether you are visiting Dubai for business or leisure, we ensure your
                stay is comfortable, memorable, and truly authentic.
              </p>
              <Link to="/about"><Button variant="primary">Learn More</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ─────────────────────────────── */}
      <section className="section">
        <div className="container">
          {sectionTitle('Why Choose Us')}
          <div className="feature-grid">
            {benefits.map((b, i) => (
              <Card key={i} variant="bordered" className="feature-card" style={{ background: 'var(--color-surface)' }}>
                <div className="feature-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Facilities Preview ────────────────────────── */}
      <section className="section" style={{ background: 'var(--color-surface-secondary)' }}>
        <div className="container">
          {sectionTitle('Facilities & Amenities')}
          <div className="facilities-grid">
            {facilities.map((f, i) => (
              <Card key={i} variant="flat" className="facility-card" style={{ background: 'var(--color-surface)' }}>
                <div className="facility-icon">{f.icon}</div>
                <h3>{f.name}</h3>
                <p>Available in select properties</p>
              </Card>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 'var(--space-8)' }}>
            <Link to="/facilities"><Button variant="secondary">View All Facilities</Button></Link>
          </div>
        </div>
      </section>

      {/* ─── Landlord CTA ──────────────────────────────── */}
      <section className="cta-section" style={{
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1C1C1C 100%)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container">
          <Badge variant="accent" size="md" style={{ marginBottom: 'var(--space-4)' }}>✦ For Property Owners</Badge>
          <h2 style={{ color: 'white', fontSize: 'clamp(1.5rem,3vw,2.5rem)', marginBottom: 'var(--space-4)' }}>
            Turn Your Property Into a Successful Holiday Home
          </h2>
          <p style={{ color: '#9CA3AF', maxWidth: 520, margin: '0 auto var(--space-6)' }}>
            Join our portfolio of professionally managed properties. Submit your details
            and our team will contact you to discuss property management solutions.
          </p>
          <Link to="/list-your-property"><Button variant="primary" size="lg">List Your Property</Button></Link>
        </div>
      </section>

      {/* ─── Contact CTA ────────────────────────────────── */}
      <section className="section">
        <div className="container">
          {sectionTitle('Get In Touch')}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            {[
              { icon: '📞', title: 'Call Us', value: '+971 50 000 0000', href: 'tel:+971500000000' },
              { icon: '💬', title: 'WhatsApp', value: 'Chat Now', href: 'https://wa.me/971500000000' },
              { icon: '✉️', title: 'Email', value: 'Send Email', href: 'mailto:info@authenticholidayhomes.ae' },
            ].map((item, i) => (
              <Card key={i} variant="bordered" style={{ padding: 'var(--space-8) var(--space-6)', textAlign: 'center', minWidth: 180 }} hover>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <h4 style={{ fontSize: 16, marginBottom: 8, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{item.title}</h4>
                <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                  {item.value}
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
