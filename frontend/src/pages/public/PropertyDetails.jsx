import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ChevronDown, Building2, Bed, Bath, Maximize2, Car } from 'lucide-react';
import { api } from '../../utils/api';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import DirhamSymbol from '../../components/public/DirhamSymbol';
import PropertyCarousel from '../../components/public/PropertyCarousel';
import PropertyEnquiryCard from '../../components/public/PropertyEnquiryCard';
import PropertyMap from '../../components/public/PropertyMap';
import PropertyCard from '../../components/public/PropertyCard';
import { renderIcon, Check } from '../../utils/amenityIcons';

const HIGHLIGHT_AMENITIES = ['wifi', 'pool', 'gym', 'kitchen', 'parking'];

export default function PropertyDetails() {
  const { slug } = useParams();
  const { t } = useI18n();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [similarProperties, setSimilarProperties] = useState([]);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [enquiryMaxHeight, setEnquiryMaxHeight] = useState(null);

  const carouselRef = useRef(null);
  const enquiryRef = useRef(null);

  const toggleAccordion = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/properties/${slug}`)
      .then(r => setProperty(r.data))
      .catch(() => setError(t('property_details.not_found')))
      .finally(() => setLoading(false));
  }, [slug]);

  // Ensure scroll-to-top when navigating between properties via related carousel
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Fetch similar properties (same location, exclude current)
  useEffect(() => {
    if (!property) return;
    api.get('/properties/published')
      .then(r => {
        const filtered = r.data.properties
          .filter(p => p.slug !== slug && p.location === property.location && p.status === 'published')
          .slice(0, 6);
        setSimilarProperties(filtered);
      })
      .catch(() => {});
  }, [property, slug]);

  // Match the enquiry panel's height to the main picture (desktop side-by-side only)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const el = carouselRef.current;
    if (!el) return;
    const update = () => {
      setEnquiryMaxHeight(mq.matches ? el.offsetHeight : null);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [property]);

  // Show the sticky bar only after the user scrolls past the enquiry panel
  useEffect(() => {
    const onScroll = () => {
      const el = enquiryRef.current;
      if (!el) return;
      setShowStickyBar(el.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [property]);

  if (loading) {
    return (
      <div className="page-header">
        <div className="container">
          <div style={{ height: 40, width: 300, margin: '0 auto', background: 'var(--color-skeleton)', borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="page-header">
        <div className="container">
          <h1 style={{ color: 'white' }}>{t('property_details.not_found')}</h1>
          <p style={{ marginTop: 20 }}><Link to="/apartments"><Button variant="primary">{t('property_details.browse')}</Button></Link></p>
        </div>
      </div>
    );
  }

  const allImages = property.images && property.images.length > 0
    ? property.images
    : [{ image_url: null }];

  // Separate highlights from rest
  const allAmenitiesFlat = property.amenities || [];
  const highlights = allAmenitiesFlat.filter(a => HIGHLIGHT_AMENITIES.includes(a.icon));
  const regularAmenities = allAmenitiesFlat.filter(a => !HIGHLIGHT_AMENITIES.includes(a.icon));
  const displayAmenities = showAllAmenities ? regularAmenities : regularAmenities.slice(0, 8);
  const hasMoreAmenities = regularAmenities.length > 8;

  return (
    <>
      <Helmet>
        <title>{property?.title || t('property_details.details_title')} | Authentic Holiday Homes Dubai</title>
        <meta name="description" content={property ? t('property_details.meta_description', { title: property.title, location: property.location || 'Dubai', bedrooms: property.bedrooms, bathrooms: property.bathrooms }) : t('property_details.meta_description_fallback')} />
        <meta name="keywords" content={`${property?.title || ''}, ${property?.location || 'Dubai'} ${t('property_details.keyword_holiday_home')}, ${t('property_details.keyword_short_term')}, ${property?.property_type || 'apartment'} Dubai, Authentic Holiday Homes`} />
        <meta property="og:title" content={`${property?.title || t('property_details.details_title')} | Authentic Holiday Homes Dubai`} />
        <meta property="og:description" content={property ? t('property_details.og_description', { title: property.title, location: property.location || 'Dubai', bedrooms: property.bedrooms }) : t('property_details.og_description_fallback')} />
        {property?.images?.[0]?.image_url && <meta property="og:image" content={`https://authenticholidayhomes.ae${property.images[0].image_url}`} />}
      </Helmet>

      <div className="page-header" style={{ paddingBlock: 'calc(var(--header-height) + var(--space-6)) var(--space-6)' }}>
        <div className="container">
          <h1 style={{ color: 'white', margin: 0, fontSize: 'var(--text-3xl)', textAlign: 'center', fontWeight: 700 }}>{property.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: 'var(--space-2) 0 0', fontSize: 'var(--text-sm)', textAlign: 'center', maxWidth: 'none' }}>
            📍 {property.location}{property.building_name ? ` — ${property.building_name}` : ''}
          </p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 24, paddingBottom: 120 }}>
        <div className="container">
          <div className="pd-narrow">
            <div className="pd-top-row">
              <div ref={carouselRef}>
                <PropertyCarousel images={allImages} title={property.title} />
              </div>
              <div ref={enquiryRef}>
                <PropertyEnquiryCard property={property} api={api} maxHeight={enquiryMaxHeight} />
              </div>
            </div>

            <div>
              <Card variant="bordered" padding style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-xl)', fontWeight: 600 }}>{t('property_details.details_title')}</h2>
                <div className="pd-stats-row">
                  {[
                    { icon: Building2, label: t('property_details.type'), value: property.property_type || 'Apartment' },
                    { icon: Bed, label: t('property_details.bedrooms'), value: property.bedrooms },
                    { icon: Bath, label: t('property_details.bathrooms'), value: property.bathrooms },
                    { icon: Car, label: t('property_details.parking'), value: property.parking_spots || 0 },
                    ...(property.size_sqft ? [{ icon: Maximize2, label: t('property_details.size'), value: `${property.size_sqft} ${t('property_details.sqft')}` }] : []),
                    { icon: DirhamSymbol, label: t('property_details.price_night'), value: <><DirhamSymbol size="1em" /> {parseFloat(property.price_per_night).toLocaleString()}</>, highlight: true },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: 'var(--space-4)', background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-2)', color: item.highlight ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                        <item.icon size={20} />
                      </div>
                      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: item.highlight ? 'var(--color-primary)' : 'var(--color-text)', marginBottom: 2 }}>{item.value}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card variant="bordered" padding style={{ marginBottom: 'var(--space-6)' }}>
                <div onClick={() => toggleAccordion('location')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                  <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 600 }}>{t('property_details.location_title')}</h2>
                  <ChevronDown size={18} className="pd-accordion-chevron" style={{ transform: expanded.location ? 'rotate(180deg)' : '', transition: 'transform 0.2s', color: 'var(--color-text-muted)' }} />
                </div>
                <div className={`pd-accordion-body${expanded.location ? ' pd-accordion-body--open' : ''}`} style={{ marginTop: 12 }}>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                    <strong>{t('property_details.area')}:</strong> {property.location}<br />
                    {property.building_name && <><strong>{t('property_details.building')}:</strong> {property.building_name}<br /></>}
                    {property.address && <><strong>{t('property_details.address')}:</strong> {property.address}</>}
                  </p>
                  <PropertyMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                    plusCode={property.plus_code}
                    title={property.title}
                    location={property.location}
                    address={property.address}
                    active={!!expanded.location}
                  />
                </div>
              </Card>

              {property.amenities && property.amenities.length > 0 && (
                <Card variant="bordered" padding style={{ marginBottom: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 600 }}>{t('property_details.amenities_count', { count: property.amenities.length })}</h2>
                  </div>

                  {/* Highlights row */}
                  {highlights.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                      {highlights.map(a => (
                        <span key={a.id} className="pd-amenity-tile pd-amenity-highlight">
                          {renderIcon(a.icon, 20) || <Check size={20} />}
                          {a.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Regular amenities grid */}
                  <div className="pd-amenities-grid">
                    {displayAmenities.map(a => (
                      <span key={a.id} className="pd-amenity-tile">
                        {renderIcon(a.icon, 18) || <Check size={18} />}
                        {a.name}
                      </span>
                    ))}
                  </div>

                  {hasMoreAmenities && (
                    <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                      <button
                        className="pd-amenities-show-all"
                        onClick={() => setShowAllAmenities(v => !v)}
                        aria-expanded={showAllAmenities}
                      >
                        {showAllAmenities ? (
                          <>
                            <ChevronDown size={16} style={{ transform: 'rotate(180deg)' }} />
                            {t('property_details.show_fewer')}
                          </>
                        ) : (
                          <>
                            {t('property_details.show_all', { count: regularAmenities.length })}
                            <ChevronDown size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </Card>
              )}

              {property.description && (
                <Card variant="bordered" padding>
                  <div onClick={() => toggleAccordion('description')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                    <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 600 }}>{t('property_details.description_title')}</h2>
                    <ChevronDown size={18} className="pd-accordion-chevron" style={{ transform: expanded.description ? 'rotate(180deg)' : '', transition: 'transform 0.2s', color: 'var(--color-text-muted)' }} />
                  </div>
                  <div className={`pd-accordion-body${expanded.description ? ' pd-accordion-body--open' : ''}`} style={{ marginTop: 12, lineHeight: 1.8, color: 'var(--color-text-secondary)' }}>
                    {property.description.split('\n').map((p, i) => (<p key={i} style={{ marginBottom: 12 }}>{p}</p>))}
                  </div>
                </Card>
              )}

              {/* Similar Properties */}
              {similarProperties.length > 0 && (
                <div className="pd-related" style={{ marginTop: 'var(--space-10)' }}>
                  <h2 style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-2xl)', fontWeight: 600 }}>{t('property_details.related_title')}</h2>
                  <div className="pd-related-swiper-wrap">
                    <Swiper
                      modules={[Navigation]}
                      navigation
                      speed={500}
                      loop={similarProperties.length > 3}
                      slidesPerView={1.15}
                      spaceBetween={16}
                      breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 18 },
                        1024: { slidesPerView: 3, spaceBetween: 20 },
                      }}
                      observer
                      observeParents
                      className="pd-related-swiper"
                    >
                      {similarProperties.map(p => (
                        <SwiperSlide key={p.id} className="pd-related-slide">
                          <PropertyCard property={p} />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`pd-sticky-bar${showStickyBar ? ' pd-sticky-bar--visible' : ''}`}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 2 }}>{t('property_details.per_night')}</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}><DirhamSymbol size="1em" /> {parseFloat(property.price_per_night).toLocaleString()}</div>
            </div>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-lg)', padding: '12px 28px', fontWeight: 600, fontSize: 'var(--text-base)', cursor: 'pointer', minHeight: 48 }}>
              {t('property_details.check_availability')}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}