import { useState, useEffect, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../../utils/api';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import Badge from '../../components/public/Badge';
import PropertyCard from '../../components/public/PropertyCard';
import { PropertyCardSkeleton } from '../../components/public/Skeleton';
import { AnimateSection } from '../../hooks/useOnScreen';
import SearchableSelect from '../../components/shared/SearchableSelect';
import { MapPin, CheckCircle, ArrowRight, Phone, Mail, Clock } from 'lucide-react';
import Reviews from '../../components/public/Reviews';
import BuildingMapSection from '../../components/public/BuildingMapSection';
import { useI18n } from '../../i18n/I18nContext';

function WhatsAppIcon({ size = 32 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
    </svg>
  );
}

const HERO_IMAGES = [
  '/images/hero/hero-1.jpg',
  '/images/hero/hero-2.jpg',
  '/images/hero/hero-3.jpg',
  '/images/hero/hero-4.jpg',
  '/images/hero/hero-5.jpg',
  '/images/hero/hero-6.jpg',
];

const DEMO_IMAGES = {
  property1: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  property2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  property3: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  about: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
};

function StatCounter({ target, suffix = '', label }) {
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
          const duration = 1500;
          const start = performance.now();
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>{count}{suffix}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
}

export default function Home() {
  const { t, locale } = useI18n();

  const HERO_PHRASES = [t('hero.phrase_1'), t('hero.phrase_2'), t('hero.phrase_3')];

  const facilities = [
    { icon: '🏊', name: t('facilities.pool') },
    { icon: '🏋️', name: t('facilities.gym') },
    { icon: '🅿️', name: t('facilities.parking') },
    { icon: '📶', name: t('facilities.wifi') },
    { icon: '🔐', name: t('facilities.smartlock') },
    { icon: '🛡️', name: t('facilities.security') },
    { icon: '🍳', name: t('facilities.kitchen') },
    { icon: '❄️', name: t('facilities.ac') },
  ];

  const contactItems = [
    {
      icon: MapPin,
      title: t('home.contact_address'),
      lines: [t('home.address_line_1'), t('home.address_line_2')],
      link: { href: 'https://maps.app.goo.gl/YwPSX4KLSB2rrRmV8', label: t('home.link_view_map') },
    },
    {
      icon: Phone,
      title: t('home.contact_phone'),
      lines: [t('home.phone_line_1'), t('home.phone_line_2')],
      link: { href: 'tel:+97142866788', label: t('home.link_call_now') },
    },
    {
      icon: WhatsAppIcon,
      title: t('home.contact_whatsapp'),
      lines: [t('home.whatsapp_line')],
      link: { href: 'https://wa.me/971569969332', label: t('home.link_chat_whatsapp'), target: '_blank' },
    },
    {
      icon: Mail,
      title: t('home.contact_email'),
      lines: ['info@authenticholidayhomes.ae'],
      link: { href: 'mailto:info@authenticholidayhomes.ae', label: t('home.link_send_email') },
    },
    {
      icon: Clock,
      title: t('home.contact_hours'),
      lines: [t('footer.hours_mon_fri'), t('footer.hours_sat'), t('footer.hours_sun')],
    },
  ];

  const [featured, setFeatured] = useState([]);
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState({ location: '', bedrooms: '' });
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();
  const heroBgRef = useRef(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [dotHovered, setDotHovered] = useState(false);
  const intervalRef = useRef(null);
  const idleTimerRef = useRef(null);
  useEffect(() => {
    api.get('/properties/featured').then(r => {
      setFeatured(r.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/communities/public').then(({ data }) => {
      if (Array.isArray(data)) setLocations(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/articles/public').then(({ data }) => {
      if (Array.isArray(data)) setArticles(data);
    }).catch(() => {});
  }, []);

  /* Hero parallax */
  useEffect(() => {
    const handleScroll = () => {
      if (!heroBgRef.current) return;
      heroBgRef.current.style.transform = `translateY(${Math.min(window.scrollY * 0.3, 120)}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Hero image auto-rotation — pause on dot hover */
  const startInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_IMAGES.length);
    }, 8000);
  }, []);

  useEffect(() => {
    if (dotHovered) {
      clearInterval(intervalRef.current);
    } else {
      startInterval();
    }
    return () => clearInterval(intervalRef.current);
  }, [dotHovered, startInterval]);

  /* Phrase rotation for subtitle — 8s cycle: 2s in, 4s visible, 2s out */
  useEffect(() => {
    const t = setInterval(() => setPhraseIndex(i => (i + 1) % HERO_PHRASES.length), 8000);
    return () => clearInterval(t);
  }, []);

  const goToImage = (i) => {
    setHeroIndex(i);
    clearInterval(intervalRef.current);
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => startInterval(), 8000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.location) params.set('location', search.location);
    if (search.bedrooms) params.set('bedrooms', search.bedrooms);
    navigate(`/apartments?${params.toString()}`);
  };

  const sectionTitle = (title) => (
    <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
      <hr className="divider-accent" style={{ margin: '0 auto var(--space-4)' }} />
      <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', marginBottom: 'var(--space-3)' }}>{title}</h2>
    </div>
  );

  const areaArticles = articles.slice(0, 8);
  const areaCarouselSlides = areaArticles.length > 1
    ? [...areaArticles, ...areaArticles]
    : areaArticles;
  const featuredArticles = featured.slice(0, 8);
  const featuredCarouselSlides = featuredArticles.length > 1
    ? [...featuredArticles, ...featuredArticles]
    : featuredArticles;


  return (
    <>
      <Helmet>
        <title>{t('home.seo_title')}</title>
        <meta name="description" content={t('home.seo_description')} />
        <meta name="keywords" content={t('home.seo_keywords')} />
        <meta property="og:title" content={t('home.seo_title')} />
        <meta property="og:description" content={t('home.seo_description')} />
        <meta property="og:image" content="https://authenticholidayhomes.ae/images/hero/hero-1.jpg" />
      </Helmet>
      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg hero-bg-parallax" ref={heroBgRef}>
          {HERO_IMAGES.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              aria-hidden="true"
              className="hero-carousel-img"
              style={{
                opacity: i === heroIndex ? 1 : 0,
                transition: 'opacity 1.5s ease-in-out',
              }}
            />
          ))}
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <Badge variant="accent" size="md" style={{ marginBottom: 'var(--space-4)' }}>
            ✦ {t('hero.badge')}
          </Badge>
          <h1 className="hero-title-shimmer" style={{ color: 'white', fontSize: 'clamp(2.25rem,6vw,4rem)', marginBottom: 'var(--space-4)', lineHeight: 1.08 }}>
            {t('hero.title')}
          </h1>
          <p key={phraseIndex} style={{
            color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(1rem,2vw,1.2rem)',
            margin: '0 auto var(--space-8)', lineHeight: 1.7, maxWidth: 580,
            animation: 'heroPhraseCycle 8s ease-out',
          }}>
            {HERO_PHRASES[phraseIndex]}
          </p>
          <div className="hero-buttons">
            <Link to="/apartments"><Button variant="primary" size="lg">{t('hero.explore_apartments')}</Button></Link>
            <Link to="/list-your-property"><Button variant="secondary" size="lg" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', borderColor: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            >{t('hero.list_property')}</Button></Link>
          </div>

          <form onSubmit={handleSearch} style={{
            marginTop: 24,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 16,
            padding: 20,
            maxWidth: 640,
            marginInline: 'auto',
          }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ minWidth: 200 }}>
                <SearchableSelect
                  options={locations}
                  value={search.location}
                  onChange={v => setSearch(s => ({ ...s, location: v }))}
                  placeholder={t('search.search_location')}
                />
              </div>
              <select value={search.bedrooms} onChange={e => setSearch(s => ({ ...s, bedrooms: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 14, minWidth: 150, fontFamily: 'var(--font-sans)' }}>
                <option value="" style={{ color: '#333' }}>{t('search.bedrooms')}</option>
                {[1,2,3,4].map(b => <option key={b} value={b} style={{ color: '#333' }}>{b} {t(b > 1 ? 'search.bedroom_other' : 'search.bedroom_one')}</option>)}
              </select>
              <button type="submit" style={{
                padding: '10px 28px', borderRadius: 8, border: 'none',
                background: 'var(--color-primary)', color: 'white',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
                fontFamily: 'var(--font-sans)', transition: 'background 150ms ease-out',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
              >{t('search.search_btn')}</button>
            </div>
          </form>
        </div>

        <div className="hero-dots" onMouseEnter={() => setDotHovered(true)} onMouseLeave={() => setDotHovered(false)}>
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === heroIndex ? ' active' : ''}`}
              onClick={() => goToImage(i)}
              aria-label={t('home.image_aria', { count: i + 1 })}
            />
          ))}
        </div>
      </section>

      {/* ─── Featured Properties ───────────────────────── */}
      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          <AnimateSection>
            {sectionTitle(t('home.featured_title'))}
            <p className="text-muted text-center" style={{ marginTop: 'calc(-1 * var(--space-8))', marginBottom: 'var(--space-10)' }}>
              {t('home.featured_subtitle')}
            </p>
          </AnimateSection>

          {featured.length === 0 ? (
            <div className="carousel-strip" style={{ justifyContent: 'center' }}>
              {[1,2,3].map(i => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : (
            <Swiper
              key={featuredArticles.map(p => p.id).join('-')}
              modules={[Autoplay]}
              autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              speed={700}
              loop={featuredCarouselSlides.length > 1}
              centeredSlides={true}
              slideToClickedSlide={true}
              slidesPerView={1.15}
              spaceBetween={16}
              breakpoints={{
                480: { slidesPerView: 1.15, spaceBetween: 16 },
                768: { slidesPerView: 2.2, spaceBetween: 18 },
                1024: { slidesPerView: 3, spaceBetween: 20 },
                1440: { slidesPerView: 5, spaceBetween: 24 },
              }}
              observer
              observeParents
              observeSlideChildren
              watchSlidesProgress
              className="featured-swiper"
            >
              {featuredCarouselSlides.map((p, index) => (
                <SwiperSlide key={`${p.id}-${index}`} className="featured-slide">
                  {({ isActive }) => (
                    <div className={`featured-slide-inner${isActive ? ' featured-slide-inner--active' : ''}`}>
                      <PropertyCard property={p} demoImg={DEMO_IMAGES.property1} />
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          <div className="carousel-footer">
            <Link to="/apartments"><Button variant="primary" size="lg">{t('home.show_more')}</Button></Link>
          </div>
        </div>
      </section>

      {/* ─── Building Map ───────────────────────────────── */}
      <BuildingMapSection />

      {/* ─── About ─────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--color-surface-secondary)' }}>
        <div className="container">
          <div className="about-home-grid">
            <AnimateSection>
              <div className="about-home-image-wrap">
                <img
                  src={DEMO_IMAGES.about}
                  alt={t('home.about_image_alt')}
                  className="about-home-image"
                />
                <div className="about-home-stat">
                  <StatCounter target={5} suffix="+" label={t('home.years_excellence')} />
                </div>
              </div>
            </AnimateSection>
            <AnimateSection>
              <div>
                <hr className="divider-accent" style={{ marginBottom: 'var(--space-4)' }} />
                <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.5rem)', marginBottom: 'var(--space-4)' }}>
                  {t('home.about_title')}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
                  {t('home.about_text')}
                </p>
                <Link to="/about"><Button variant="primary">{t('home.learn_more')}</Button></Link>
              </div>
            </AnimateSection>
          </div>
        </div>
      </section>

      {/* ─── Explore Dubai Areas ──────────────────────────── */}
      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          <AnimateSection>
            {sectionTitle(t('home.areas_title'))}
            <p className="text-muted text-center" style={{ marginTop: 'calc(-1 * var(--space-8))', marginBottom: 'var(--space-10)' }}>
              {t('home.areas_subtitle')}
            </p>
          </AnimateSection>

          <Swiper
            key={areaArticles.map(a => a.slug).join('-')}
            modules={[Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            speed={700}
            loop={areaCarouselSlides.length > 1}
            centeredSlides={true}
            slideToClickedSlide={true}
            slidesPerView={1.15}
            spaceBetween={16}
            breakpoints={{
              480: { slidesPerView: 1.4, spaceBetween: 16 },
              768: { slidesPerView: 2.2, spaceBetween: 18 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
              1440: { slidesPerView: 5, spaceBetween: 24 },
            }}
            observer
            observeParents
            observeSlideChildren
            watchSlidesProgress
            className="area-swiper"
          >
            {areaCarouselSlides.map((a, index) => (
              <SwiperSlide key={`${a.slug}-${index}`} className="area-slide">
                {({ isActive }) => (
                  <Link to={`/areas/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                    <Card variant="bordered" className={`hover-lift${isActive ? ' area-card--active' : ''}`} style={{ height: '100%', padding: 0, overflow: 'hidden' }}>
                      <div style={{
                        height: 180,
                        backgroundImage: a.image_url
                          ? `linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.3)), url("${a.image_url}")`
                          : 'linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.5))',
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        display: 'flex', alignItems: 'flex-end', padding: 'var(--space-4)',
                      }}>
                        <div>
                          <Badge variant="accent" size="sm" style={{ marginBottom: 6 }}>
                            <MapPin size={12} style={{ marginRight: 4 }} />
                            {a.ideal_for ? a.ideal_for.split(',')[0].trim() : t('home.popular')}
                          </Badge>
                          <h3 style={{ color: 'white', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{a.title}</h3>
                        </div>
                      </div>
                    <div style={{ padding: 'var(--space-4)' }}>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>
                        {a.subtitle}
                      </p>
                      {a.highlights?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 'var(--space-3)' }}>
                          {a.highlights.slice(0, 3).map((h, j) => (
                            <span key={`${a.slug}-h-${j}`} style={{
                              fontSize: 11, padding: '2px 8px', borderRadius: 999,
                              background: 'var(--color-surface-secondary)', color: 'var(--color-muted)',
                            }}>{h}</span>
                          ))}
                          {a.highlights.length > 3 && (
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--color-surface-secondary)', color: 'var(--color-muted)' }}>
                              +{a.highlights.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      <span style={{ color: 'var(--color-primary)', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {t('home.learn_more')} <ArrowRight size={14} />
                      </span>
                    </div>
                  </Card>
                </Link>
              )}
            </SwiperSlide>
            ))}
          </Swiper>
          <div className="carousel-footer">
            <Link to="/areas"><Button variant="primary" size="lg">{t('home.explore_all_areas')}</Button></Link>
          </div>
        </div>
      </section>

      {/* ─── Facilities Preview ────────────────────────── */}
      <section className="section" style={{ background: 'var(--color-surface-secondary)' }}>
        <div className="container">
          <AnimateSection>{sectionTitle(t('home.facilities_title'))}</AnimateSection>
          <div className="facilities-home-grid">
            {facilities.map((f, i) => (
              <Card key={i} variant="flat" className="facility-card" style={{ background: 'var(--color-surface)' }}>
                <div className="facility-icon">{f.icon}</div>
                <h3>{f.name}</h3>
                <p>{t('home.facilities_available')}</p>
              </Card>
            ))}
          </div>
          <AnimateSection>
            <div className="text-center" style={{ marginTop: 'var(--space-8)' }}>
              <Link to="/facilities"><Button variant="secondary">{t('home.view_all_facilities')}</Button></Link>
            </div>
          </AnimateSection>
        </div>
      </section>

      {/* ─── Landlord CTA ──────────────────────────────── */}
      <section className="cta-section" style={{
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1C1C1C 100%)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container">
          <AnimateSection>
            <Badge variant="accent" size="md" style={{ marginBottom: 'var(--space-4)' }}>✦ {t('home.owners_badge')}</Badge>
            <h2 style={{ color: 'white', fontSize: 'clamp(1.5rem,3vw,2.5rem)', marginBottom: 'var(--space-4)' }}>
              {t('home.cta_title')}
            </h2>
            <p style={{ color: '#9CA3AF', maxWidth: 520, margin: '0 auto var(--space-6)' }}>
              {t('home.cta_text')}
            </p>
            <Link to="/list-your-property" className="area-cta-btn area-cta-btn--inline">{t('home.list_your_property')}</Link>
          </AnimateSection>
        </div>
      </section>

      <Reviews />
      {/* ─── Contact CTA ────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <AnimateSection>{sectionTitle(t('home.contact_title'))}</AnimateSection>
          <div className="contact-home-grid">
            {contactItems.map((item, i) => (
              <Card key={i} variant="bordered" className="contact-home-card" hover>
                <div className="contact-home-card-icon"><item.icon size={28} /></div>
                <h4 className="contact-home-card-title">{item.title}</h4>
                {item.lines.map((line, j) => (
                  <p key={j} className="contact-home-card-line">{line}</p>
                ))}
                {item.link && (
                  <a href={item.link.href} target={item.link.target || '_self'} rel={item.link.target === '_blank' ? 'noopener noreferrer' : undefined} className="contact-home-card-link">
                    {item.link.label}
                  </a>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
