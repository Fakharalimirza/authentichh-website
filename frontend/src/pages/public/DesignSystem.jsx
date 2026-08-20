import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/public/Toast';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import Badge from '../../components/public/Badge';
import Input from '../../components/public/Input';
import Modal from '../../components/public/Modal';
import PropertyCard from '../../components/public/PropertyCard';
import { PropertyCardSkeleton, TableSkeleton } from '../../components/public/Skeleton';
import DirhamSymbol from '../../components/public/DirhamSymbol';

const DEMO_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80',
  property1: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  property2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  property3: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  property4: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
  property5: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80',
  property6: 'https://images.unsplash.com/photo-1600566753086-00f18fb7b0d2?w=800&q=80',
  interior: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80',
  pool: 'https://images.unsplash.com/photo-1576013551627-0cc20b8b5b5e?w=800&q=80',
  kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  balcony: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80',
  bedroom: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=800&q=80',
  living: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
};

const SAMPLE_PROPERTIES = [
  { id: 1, title: 'Binghatti Creek — One Bedroom', location: 'Dubai Creek', bedrooms: 1, bathrooms: 1, guests: 2, price: 450, featured: true, image: DEMO_IMAGES.property1, type: 'Apartment' },
  { id: 2, title: 'Marina Heights — Two Bedroom Suite', location: 'Dubai Marina', bedrooms: 2, bathrooms: 2, guests: 4, price: 780, featured: true, image: DEMO_IMAGES.property2, type: 'Apartment' },
  { id: 3, title: 'Palm Jumeirah — Luxury Villa', location: 'Palm Jumeirah', bedrooms: 4, bathrooms: 4, guests: 8, price: 2500, featured: false, image: DEMO_IMAGES.property3, type: 'Villa' },
  { id: 4, title: 'Downtown Dubai — Executive Suite', location: 'Downtown Dubai', bedrooms: 3, bathrooms: 3, guests: 6, price: 1200, featured: true, image: DEMO_IMAGES.property4, type: 'Apartment' },
  { id: 5, title: 'JBR Beachfront — Studio Apartment', location: 'JBR', bedrooms: 0, bathrooms: 1, guests: 2, price: 350, featured: false, image: DEMO_IMAGES.property5, type: 'Studio' },
  { id: 6, title: 'Business Bay — Penthouse', location: 'Business Bay', bedrooms: 2, bathrooms: 3, guests: 5, price: 1800, featured: false, image: DEMO_IMAGES.property6, type: 'Penthouse' },
];

export default function DesignSystem() {
  const { theme, preference, changePreference } = useTheme();
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [dir, setDir] = useState('ltr');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);

  const isRTL = dir === 'rtl';

  return (
    <div style={{ paddingBottom: 'var(--space-24)' }}>
      {/* ─── Demo Header ───────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 var(--space-6)',
        height: 'var(--header-height)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--color-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 15, fontFamily: "'Playfair Display', serif"
          }}>AH</div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text)' }}>Design System 2026</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Dir switcher */}
          <div className="theme-switcher">
            <button className={`theme-option ${!isRTL ? 'active' : ''}`} onClick={() => setDir('ltr')} title="LTR" style={{ width: 44, fontSize: 13, fontWeight: 600 }}>EN</button>
            <button className={`theme-option ${isRTL ? 'active' : ''}`} onClick={() => setDir('rtl')} title="RTL" style={{ width: 44, fontSize: 13, fontWeight: 600 }}>AR</button>
          </div>

          {/* Theme Switcher */}
          <div className="theme-switcher">
            {['light', 'dark', 'system'].map(p => (
              <button
                key={p}
                className={`theme-option ${preference === p ? 'active' : ''}`}
                onClick={() => changePreference(p)}
                title={p}
              >
                {p === 'light' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                ) : p === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingBlock: 'var(--space-10)' }}>
        {/* ─── Hero Section ────────────────────────────── */}
        <section className="hero" style={{ minHeight: '80vh', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-16)' }}>
          <div className="hero-bg" style={{ borderRadius: 'var(--radius-xl)' }}>
            <img src={DEMO_IMAGES.hero} alt="Dubai skyline" style={{ opacity: 0.6 }} />
          </div>
          <div className="hero-overlay" style={{ borderRadius: 'var(--radius-xl)' }} />
          <div className="hero-content">
            <span className="badge badge-accent" style={{ marginBottom: 'var(--space-4)' }}>✦ Premium Holiday Homes</span>
            <h1>Your Perfect Stay in Dubai</h1>
            <p>Authentic Holiday Homes offers professionally managed luxury apartments and villas in the most prestigious locations across Dubai.</p>
            <div className="hero-buttons">
              <Button variant="primary" size="lg">Explore Apartments</Button>
              <Button variant="secondary" size="lg">List Your Property</Button>
            </div>
          </div>
        </section>

        {/* ─── Color Palette ───────────────────────────── */}
        <section className="section" id="colors">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Color System</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Semantic color tokens used throughout the design system.</p>

          <div className="grid grid-cols-4" style={{ gap: 'var(--space-4)' }}>
            {[
              { label: 'Primary', token: '--color-primary', var: '#E31E24' },
              { label: 'Primary Hover', token: '--color-primary-hover', var: '#C41A1F' },
              { label: 'Primary Light', token: '--color-primary-light', var: '#E7F1ED' },
              { label: 'Accent', token: '--color-accent', var: '#C9A96E' },
              { label: 'Accent Hover', token: '--color-accent-hover', var: '#B89445' },
              { label: 'Accent Light', token: '--color-accent-light', var: '#F5EFE0' },
              { label: 'Background', token: '--color-bg', var: '#FAFAF8' },
              { label: 'Surface', token: '--color-surface', var: '#FFFFFF' },
              { label: 'Surface Secondary', token: '--color-surface-secondary', var: '#F5F6F4' },
              { label: 'Text Primary', token: '--color-text', var: '#18201D' },
              { label: 'Text Secondary', token: '--color-text-secondary', var: '#53605A' },
              { label: 'Text Muted', token: '--color-text-muted', var: '#89938E' },
              { label: 'Border', token: '--color-border', var: '#E4E8E5' },
              { label: 'Success', token: '--color-success', var: '#2E7D32' },
              { label: 'Error', token: '--color-error', var: '#C62828' },
              { label: 'Warning', token: '--color-warning', var: '#ED6C02' },
            ].map(c => (
              <Card key={c.label} variant="bordered" padding={false}>
                <div style={{
                  height: 80,
                  background: `var(${c.token})`,
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'flex-end', padding: 'var(--space-3)',
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: ['--color-bg', '--color-surface', '--color-surface-secondary', '--color-primary-light', '--color-accent-light'].includes(c.token) ? '#18201D' : 'white',
                    background: ['--color-bg', '--color-surface', '--color-surface-secondary', '--color-primary-light', '--color-accent-light'].includes(c.token) ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.15)',
                    padding: '2px 8px', borderRadius: 4,
                  }}>
                    {c.token.replace('--color-', '')}
                  </span>
                </div>
                <div style={{ padding: 'var(--space-3)' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{c.var}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── Typography ──────────────────────────────── */}
        <section className="section" id="typography">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Typography</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Inter + Playfair Display for English, Noto Sans Arabic for Arabic.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
            <div>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <p className="text-muted text-sm" style={{ marginBottom: 4 }}>Display / 64px</p>
                <h1 style={{ fontSize: 'var(--text-7xl)' }}>The ultimate stay</h1>
              </div>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <p className="text-muted text-sm" style={{ marginBottom: 4 }}>H1 / 44px</p>
                <h2 style={{ fontSize: 'var(--text-5xl)' }}>Luxury awaits you</h2>
              </div>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <p className="text-muted text-sm" style={{ marginBottom: 4 }}>H2 / 36px</p>
                <h2 style={{ fontSize: 'var(--text-4xl)' }}>Premium properties</h2>
              </div>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <p className="text-muted text-sm" style={{ marginBottom: 4 }}>H3 / 30px</p>
                <h3>Featured apartments</h3>
              </div>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <p className="text-muted text-sm" style={{ marginBottom: 4 }}>H4 / 24px</p>
                <h4>Property details</h4>
              </div>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <p className="text-muted text-sm" style={{ marginBottom: 4 }}>Body / 16px</p>
                <p style={{ fontSize: 'var(--text-base)', maxWidth: 480 }}>
                  Authentic Holiday Homes offers professionally managed holiday homes and luxury
                  apartments in prime Dubai locations. Experience the finest hospitality.
                </p>
              </div>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <p className="text-muted text-sm" style={{ marginBottom: 4 }}>Small / 14px</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  Located in Dubai Marina with stunning water views.
                </p>
              </div>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <p className="text-muted text-sm" style={{ marginBottom: 4 }}>Caption / 12px</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Added 15 June 2026
                </p>
              </div>
            </div>

            <div dir="rtl" style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <p className="text-muted text-sm" style={{ marginBottom: 4 }}>العرض / 64px</p>
                <h1 style={{ fontSize: 'var(--text-7xl)', fontFamily: "'Noto Sans Arabic', sans-serif" }}>إقامة فاخرة</h1>
              </div>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <p className="text-muted text-sm" style={{ marginBottom: 4 }}>العنوان الرئيسي / 44px</p>
                <h2 style={{ fontSize: 'var(--text-5xl)', fontFamily: "'Noto Sans Arabic', sans-serif" }}>الفخامة في انتظارك</h2>
              </div>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <p className="text-muted text-sm" style={{ marginBottom: 4 }}>نص عام / 16px</p>
                <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.7, maxWidth: 480 }}>
                  تقدم أوثنتيك هوليدي هومز منازل عطلات مُدارة بشكل احترافي وشقق فاخرة
                  في أفضل المواقع في دبي. استمتع بأرقى مستويات الضيافة والراحة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Buttons ─────────────────────────────────── */}
        <section className="section" id="buttons">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Buttons</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Five variants × four sizes, plus loading and icon states.</p>

          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-3)' }}>Variants</p>
              <div className="flex flex-wrap" style={{ gap: 'var(--space-3)' }}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-8)' }}>
              <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-3)' }}>Sizes</p>
              <div className="flex flex-wrap items-center" style={{ gap: 'var(--space-3)' }}>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-8)' }}>
              <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-3)' }}>States</p>
              <div className="flex flex-wrap items-center" style={{ gap: 'var(--space-3)' }}>
                <Button variant="primary" loading>Saving...</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="secondary" disabled>Disabled</Button>
                <Button variant="primary" icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                }>With Icon</Button>
                <Button variant="secondary" fullWidth style={{ maxWidth: 200 }}>Full Width</Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-3)' }}>Icon Buttons</p>
              <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
                <button className="btn-icon-only" aria-label="Search">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </button>
                <button className="btn-icon-only" aria-label="Heart">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
                <button className="btn-icon-only" aria-label="Close">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
                <button className="btn-icon-only" aria-label="Settings">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Badges ──────────────────────────────────── */}
        <section className="section" id="badges">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Badges</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Semantic badges for statuses, labels, and tags.</p>

          <Card style={{ padding: 'var(--space-8)' }}>
            <div className="flex flex-wrap" style={{ gap: 'var(--space-3)', alignItems: 'center' }}>
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="accent" size="md">✦ Featured</Badge>
              <Badge variant="success" size="lg">Published</Badge>
              <Badge variant="warning" size="md">Draft</Badge>
            </div>
          </Card>
        </section>

        {/* ─── Form Elements ───────────────────────────── */}
        <section className="section" id="forms">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Form Elements</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Clean, accessible inputs with labels, validation, and help text.</p>

          <Card style={{ padding: 'var(--space-8)', maxWidth: 640 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Input label="Full Name" placeholder="Enter your full name" required />
              <Input label="Email Address" type="email" placeholder="your@email.com" helpText="We'll never share your email." />
              <Input label="Phone Number" type="tel" placeholder="+971 50 000 0000" prefix={<span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>🇦🇪</span>} />
              <Input label="Password" type="password" placeholder="••••••••" error="Password must be at least 8 characters." />
              <div className="form-group">
                <label className="input-label" style={{ marginBottom: 'var(--space-1)' }}>Message</label>
                <div className="input-field" style={{ alignItems: 'flex-start' }}>
                  <textarea className="input-element" placeholder="Write your message..." style={{ minHeight: 120, padding: '0.75rem 0.875rem' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="input-label" style={{ marginBottom: 'var(--space-1)' }}>Property Type</label>
                <div className="input-field">
                  <select className="input-element" defaultValue="">
                    <option value="" disabled>Select type...</option>
                    <option value="apartment">Apartment</option>
                    <option value="studio">Studio</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="villa">Villa</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ─── Property Cards ──────────────────────────── */}
        <section className="section" id="cards">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Property Cards</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Modern premium property cards with image carousel, favorite button, and responsive grid.</p>

          <div className="property-grid">
            {SAMPLE_PROPERTIES.map(p => (
              <PropertyCard key={p.id} property={{
                id: p.id,
                slug: p.title.toLowerCase().replace(/\s+/g, '-'),
                title: p.title,
                location: p.location,
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                max_guests: p.guests,
                price_per_night: p.price,
                is_featured: p.featured,
                cover_image: p.image,
                images: [{ image_url: p.image }],
              }} />
            ))}
          </div>
        </section>

        {/* ─── Loading States ──────────────────────────── */}
        <section className="section" id="loading">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Loading States</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Skeleton loaders for cards, tables, and content placeholders.</p>

          <div style={{ marginBottom: 'var(--space-8)' }}>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-3)' }}>Property Card Skeletons</p>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </div>
          </div>

          <div>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-3)' }}>Table Skeletons</p>
            <TableSkeleton rows={4} cols={6} />
          </div>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-3)' }}>Inline Loading</p>
            <div className="flex" style={{ gap: 'var(--space-3)' }}>
              <Button variant="primary" loading>Loading...</Button>
              <Button variant="secondary" loading>Processing...</Button>
            </div>
          </div>
        </section>

        {/* ─── Modal ───────────────────────────────────── */}
        <section className="section" id="modal">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Modal</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Centered dialog with backdrop, accessible focus management, and escape-to-close.</p>

          <Button variant="primary" onClick={() => setModalOpen(true)}>Open Modal</Button>

          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Property Enquiry">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input label="Full Name" placeholder="Your name" required />
              <Input label="Email" type="email" placeholder="your@email.com" required />
              <Input label="Phone" type="tel" placeholder="+971 50 000 0000" />
              <Input label="Number of Guests" type="number" placeholder="2" />
              <div className="form-group">
                <label className="input-label" style={{ marginBottom: 'var(--space-1)' }}>Message</label>
                <div className="input-field" style={{ alignItems: 'flex-start' }}>
                  <textarea className="input-element" placeholder="I'm interested in..." style={{ minHeight: 100, padding: '0.75rem 0.875rem' }} />
                </div>
              </div>
              <div className="flex" style={{ gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => { addToast({ type: 'success', title: 'Enquiry Sent', message: 'We will contact you within 24 hours.' }); setModalOpen(false); }}>Send Enquiry</Button>
              </div>
            </div>
          </Modal>
        </section>

        {/* ─── Toast Notifications ─────────────────────── */}
        <section className="section" id="toasts">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Toast Notifications</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Non-intrusive feedback messages for actions.</p>

          <Card style={{ padding: 'var(--space-8)' }}>
            <div className="flex flex-wrap" style={{ gap: 'var(--space-3)' }}>
              <Button variant="primary" onClick={() => addToast({ type: 'success', title: 'Success', message: 'Property published successfully.' })}>Success Toast</Button>
              <Button variant="danger" onClick={() => addToast({ type: 'error', title: 'Error', message: 'Unable to delete property. Please try again.' })}>Error Toast</Button>
              <Button variant="secondary" onClick={() => addToast({ type: 'warning', title: 'Warning', message: 'Your session is about to expire.' })}>Warning Toast</Button>
              <Button variant="ghost" onClick={() => addToast({ type: 'info', title: 'Info', message: 'New landlord request received.' })}>Info Toast</Button>
            </div>
          </Card>
        </section>

        {/* ─── Badge Showcase ──────────────────────────── */}
        <section className="section" id="badges-demo">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Status Badges</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Admin status indicators.</p>

          <Card style={{ padding: 'var(--space-8)' }}>
            <div className="flex flex-wrap" style={{ gap: 'var(--space-3)', alignItems: 'center' }}>
              <Badge variant="info" size="md">New</Badge>
              <Badge variant="warning" size="md">Draft</Badge>
              <Badge variant="success" size="md">Published</Badge>
              <Badge variant="error" size="md">Unpublished</Badge>
              <Badge variant="warning" size="md">Contacted</Badge>
              <Badge variant="primary" size="md">In Discussion</Badge>
              <Badge variant="success" size="md">Approved</Badge>
              <Badge variant="error" size="md">Rejected</Badge>
              <Badge variant="default" size="md">Read</Badge>
              <Badge variant="default" size="md">Closed</Badge>
            </div>
          </Card>
        </section>

        {/* ─── Card Variants ───────────────────────────── */}
        <section className="section" id="card-variants">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Card Variants</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Default, elevated, bordered, and flat card styles.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
            <Card variant="default" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Default</p>
              <p className="text-sm text-muted">With subtle border</p>
            </Card>
            <Card variant="elevated" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Elevated</p>
              <p className="text-sm text-muted">With soft shadow</p>
            </Card>
            <Card variant="bordered" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Bordered</p>
              <p className="text-sm text-muted">Stronger border</p>
            </Card>
            <Card variant="flat" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Flat</p>
              <p className="text-sm text-muted">Secondary background</p>
            </Card>
          </div>
        </section>

        {/* ─── Spacing Showcase ────────────────────────── */}
        <section className="section" id="spacing">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Spacing Scale</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Consistent 4px-based spacing system.</p>

          <Card style={{ padding: 'var(--space-8)' }}>
            {[
              { name: 'space-1', value: '4px' },
              { name: 'space-2', value: '8px' },
              { name: 'space-3', value: '12px' },
              { name: 'space-4', value: '16px' },
              { name: 'space-5', value: '20px' },
              { name: 'space-6', value: '24px' },
              { name: 'space-8', value: '32px' },
              { name: 'space-10', value: '40px' },
              { name: 'space-12', value: '48px' },
              { name: 'space-16', value: '64px' },
              { name: 'space-20', value: '80px' },
              { name: 'space-24', value: '96px' },
            ].map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <span style={{ width: 80, fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{s.name}</span>
                <span style={{ width: 40, fontSize: 12, color: 'var(--color-text-muted)' }}>{s.value}</span>
                <div style={{ height: 12, width: `var(--${s.name})`, background: 'var(--color-primary)', borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
            ))}
          </Card>
        </section>

        {/* ─── RTL Demo ────────────────────────────────── */}
        <section className="section" id="rtl">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>RTL Support</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Toggle EN/AR in the header to see RTL in action. All components adapt automatically.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            <Card style={{ padding: 'var(--space-6)' }}>
              <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>LTR (English)</p>
              <div dir="ltr" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge variant="primary">Home</Badge>
                <Badge variant="default">Apartments</Badge>
                <Badge variant="default">About</Badge>
                <Badge variant="default">Contact</Badge>
              </div>
              <div className="flex" style={{ gap: 8, marginTop: 'var(--space-4)' }}>
                <Button size="sm">← Back</Button>
                <Button size="sm" variant="secondary">Next →</Button>
              </div>
            </Card>

            <Card style={{ padding: 'var(--space-6)' }}>
              <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>RTL (العربية)</p>
              <div dir="rtl" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge variant="primary">الرئيسية</Badge>
                <Badge variant="default">الشقق</Badge>
                <Badge variant="default">عننا</Badge>
                <Badge variant="default">اتصل بنا</Badge>
              </div>
              <div className="flex" style={{ gap: 8, marginTop: 'var(--space-4)' }} dir="rtl">
                <Button size="sm">→ رجوع</Button>
                <Button size="sm" variant="secondary">التالي ←</Button>
              </div>
            </Card>
          </div>
        </section>

        {/* ─── Section Spacing Demo ────────────────────── */}
        <section className="section" id="section-demo">
          <hr className="divider-accent" style={{ marginBottom: 'var(--space-3)' }} />
          <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>Section Spacing</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Consistent section padding for all major page sections.</p>

          <Card variant="bordered" style={{ overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-12)', textAlign: 'center', background: 'var(--color-surface-secondary)' }}>
              <p className="text-sm text-muted">Section padding: 80px desktop / 48px mobile</p>
              <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-primary)' }}>section {`{ padding-block: var(--space-16); }`}</p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
