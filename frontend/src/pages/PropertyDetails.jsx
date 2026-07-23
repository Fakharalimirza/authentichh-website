import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Phone, MessageCircle } from 'lucide-react';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import DirhamSymbol from '../components/ui/DirhamSymbol';
import DateRangePicker from '../components/DateRangePicker';

export default function PropertyDetails() {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [enquiry, setEnquiry] = useState({ name: '', phone: '' });
  const [dates, setDates] = useState({ checkIn: null, checkOut: null });

  const [imgIndex, setImgIndex] = useState(0);
  const [carouselHovered, setCarouselHovered] = useState(false);
  const imgCount = property?.images?.length || 1;

  const prevImg = useCallback(() => {
    setImgIndex(i => (i === 0 ? imgCount - 1 : i - 1));
  }, [imgCount]);

  const nextImg = useCallback(() => {
    setImgIndex(i => (i === imgCount - 1 ? 0 : i + 1));
  }, [imgCount]);

  /* Auto-infinite scroll every 4s, pauses on hover */
  useEffect(() => {
    if (imgCount <= 1 || carouselHovered) return;
    const timer = setInterval(nextImg, 4000);
    return () => clearInterval(timer);
  }, [imgCount, carouselHovered, nextImg]);

  useEffect(() => {
    setLoading(true);
    api.get(`/properties/${slug}`)
      .then(r => setProperty(r.data))
      .catch(() => setError('Property not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/property-enquiries', {
        name: enquiry.name,
        phone: enquiry.phone,
        property_id: property.id,
        check_in: dates.checkIn ? dates.checkIn.toISOString().slice(0, 10) : '',
        check_out: dates.checkOut ? dates.checkOut.toISOString().slice(0, 10) : '',
      });
      setSubmitted(true);
      setEnquiry({ name: '', phone: '' });
      setDates({ checkIn: null, checkOut: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const DEMO_IMG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8,
    border: '1.5px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: 13, fontFamily: 'var(--font-sans)',
    outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

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
          <h1 style={{ color: 'white' }}>Property Not Found</h1>
          <p style={{ marginTop: 20 }}><Link to="/apartments"><Button variant="primary">Browse Apartments</Button></Link></p>
        </div>
      </div>
    );
  }

  const allImages = property.images && property.images.length > 0
    ? property.images
    : [{ image_url: null }];

  function imgUrl(img) {
    if (!img || !img.image_url) return DEMO_IMG;
    return img.image_url.startsWith('http') ? img.image_url : `/${img.image_url}`;
  }

  return (
    <>
      {lightbox !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.92)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }} onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} style={{
            position: 'absolute', top: 20, insetInlineEnd: 24, background: 'none',
            border: 'none', color: 'white', fontSize: 32, cursor: 'pointer',
            lineHeight: 1,
          }}>×</button>
          <img
            src={imgUrl(allImages[lightbox === true ? imgIndex : lightbox])}
            alt="" style={{
              maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12,
              objectFit: 'contain', cursor: 'default',
            }} onClick={e => e.stopPropagation()}
          />
          {allImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImg(); }} style={{
                position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                width: 48, height: 48, borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}><ChevronLeft size={28} /></button>
              <button onClick={(e) => { e.stopPropagation(); nextImg(); }} style={{
                position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                width: 48, height: 48, borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}><ChevronRight size={28} /></button>
              <div style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.6)', borderRadius: 20,
                padding: '6px 16px', color: 'white', fontSize: 14, fontWeight: 600,
              }}>
                {imgIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>
      )}

      <div className="page-header">
        <div className="container">
          <h1 style={{ color: 'white' }}>{property.title}</h1>
          <p>📍 {property.location}{property.building_name ? ` — ${property.building_name}` : ''}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* ─── Carousel — left thumbs + 4:3 main ─── */}
          <div
            className="detail-carousel"
            onMouseEnter={() => setCarouselHovered(true)}
            onMouseLeave={() => setCarouselHovered(false)}
          >
            {allImages.length > 1 && (
              <div className="detail-carousel-thumbs">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    className={`detail-carousel-thumb ${i === imgIndex ? 'detail-carousel-thumb--active' : ''}`}
                    onClick={() => { setImgIndex(i); setCarouselHovered(true); setTimeout(() => setCarouselHovered(false), 1000); }}
                    type="button"
                  >
                    <img src={imgUrl(img)} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            <div className="detail-carousel-main">
              <button className="detail-carousel-arrow detail-carousel-arrow--prev" onClick={prevImg} aria-label="Previous image" type="button">
                <ChevronLeft size={24} />
              </button>
              <img
                key={imgIndex}
                src={imgUrl(allImages[imgIndex])}
                alt={`${property.title} — Image ${imgIndex + 1}`}
                className="detail-carousel-img"
                onClick={() => setLightbox(true)}
              />
              <button className="detail-carousel-arrow detail-carousel-arrow--next" onClick={nextImg} aria-label="Next image" type="button">
                <ChevronRight size={24} />
              </button>
              {allImages.length > 1 && (
                <span className="detail-carousel-counter">{imgIndex + 1} / {allImages.length}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, alignItems: 'start' }}>
            <div>
              <Card variant="bordered" padding style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{ marginBottom: 'var(--space-4)', fontSize: 18 }}>Property Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Property Type', value: property.property_type || 'Apartment' },
                    { label: 'Bedrooms', value: property.bedrooms },
                    { label: 'Bathrooms', value: property.bathrooms },
                    { label: 'Max Guests', value: property.max_guests },
                    ...(property.size_sqft ? [{ label: 'Size', value: `${property.size_sqft} sqft` }] : []),
                    { label: 'Price', value: <><DirhamSymbol size="1.1em" /> {parseFloat(property.price_per_night).toLocaleString()}</>, highlight: true },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: 'var(--space-3) var(--space-4)',
                      background: 'var(--color-bg)',
                      borderRadius: 8,
                    }}>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{
                        fontWeight: 600, fontSize: 15,
                        color: item.highlight ? 'var(--color-primary)' : 'var(--color-text)',
                      }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {property.description && (
                <Card variant="bordered" padding style={{ marginBottom: 'var(--space-6)' }}>
                  <h2 style={{ marginBottom: 'var(--space-4)', fontSize: 18 }}>Description</h2>
                  <div style={{ lineHeight: 1.8, color: 'var(--color-text-secondary)' }}>
                    {property.description.split('\n').map((p, i) => (
                      <p key={i} style={{ marginBottom: 12 }}>{p}</p>
                    ))}
                  </div>
                </Card>
              )}

              {property.amenities && property.amenities.length > 0 && (
                <Card variant="bordered" padding style={{ marginBottom: 'var(--space-6)' }}>
                  <h2 style={{ marginBottom: 'var(--space-4)', fontSize: 18 }}>Amenities</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {property.amenities.map(a => (
                      <Badge key={a.id} variant="outline" size="md">
                        {getIcon(a.icon)} {a.name}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              <Card variant="bordered" padding>
                <h2 style={{ marginBottom: 'var(--space-4)', fontSize: 18 }}>Location</h2>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                  <strong>Area:</strong> {property.location}<br />
                  {property.building_name && <><strong>Building:</strong> {property.building_name}<br /></>}
                  {property.address && <><strong>Address:</strong> {property.address}</>}
                </p>
                {property.map_url && (
                  <div style={{ marginTop: 15, borderRadius: 10, overflow: 'hidden', height: 300 }}>
                    <iframe
                      src={property.map_url}
                      width="100%" height="100%"
                      style={{ border: 0 }}
                      allowFullScreen="" loading="lazy"
                      title="Property Location"
                    />
                  </div>
                )}
              </Card>
            </div>

            <div>
              <Card variant="elevated" padding style={{ position: 'sticky', top: 100 }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Enquire Now</h3>

                {submitted ? (
                  <div style={{
                    padding: 'var(--space-4)', borderRadius: 8,
                    background: 'rgba(46, 213, 115, 0.1)', color: 'var(--color-success)',
                    fontSize: 14, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✓</div>
                    Thank you! We'll contact you shortly.
                  </div>
                ) : (
                  <>
                    {/* Quick actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                      <a href={`https://wa.me/971500000000?text=Hello%2C%20I%27m%20interested%20in%20${encodeURIComponent(property.title)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '10px 0', borderRadius: 10,
                          background: '#25D366', color: 'white', textDecoration: 'none',
                          fontWeight: 600, fontSize: 14, transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        <MessageCircle size={18} /> WhatsApp
                      </a>
                      <a href="tel:+971500000000"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '10px 0', borderRadius: 10,
                          background: 'var(--color-primary)', color: 'white', textDecoration: 'none',
                          fontWeight: 600, fontSize: 14, transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        <Phone size={18} /> Call Us
                      </a>
                    </div>

                    {/* Check Availability divider */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      marginBottom: 14, color: 'var(--color-text-muted)', fontSize: 11,
                    }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                      <span style={{ whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 12 }}>
                        Check Availability
                      </span>
                      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                    </div>

                    {dates.checkIn && dates.checkOut ? (
                      /* Form shown after dates selected */
                      <form onSubmit={handleEnquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {error && <div style={{ padding: 8, borderRadius: 6, background: 'rgba(227, 30, 36, 0.1)', color: 'var(--color-primary)', fontSize: 13 }}>{error}</div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            {dates.checkIn.toLocaleDateString('en-GB')} → {dates.checkOut.toLocaleDateString('en-GB')}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDates({ checkIn: null, checkOut: null })}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--color-primary)', fontSize: 11, fontWeight: 600,
                              padding: 0, textDecoration: 'underline',
                            }}
                          >
                            Change
                          </button>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--color-text-secondary)' }}>Name *</label>
                          <input
                            required value={enquiry.name}
                            onChange={e => setEnquiry(f => ({ ...f, name: e.target.value }))}
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--color-text-secondary)' }}>Phone *</label>
                          <input
                            type="tel" required value={enquiry.phone}
                            onChange={e => setEnquiry(f => ({ ...f, phone: e.target.value }))}
                            style={inputStyle}
                          />
                        </div>
                        <Button type="submit" variant="primary" fullWidth disabled={submitting} style={{ marginTop: 4 }}>
                          {submitting ? 'Sending...' : 'Send Enquiry'}
                        </Button>
                      </form>
                    ) : (
                      /* Calendar shown until both dates selected */
                      <div style={{ marginBottom: 4 }}>
                        <DateRangePicker
                          checkIn={dates.checkIn}
                          checkOut={dates.checkOut}
                          onChange={setDates}
                        />
                      </div>
                    )}
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function getIcon(icon) {
  const icons = {
    wifi: '📶', pool: '🏊', gym: '🏋️', parking: '🅿️', smartlock: '🔐',
    ac: '❄️', tv: '📺', washer: '🧺', kitchen: '🍳', balcony: '🏙️',
    security: '🛡️', safe: '🔒', coffee: '☕', hair: '💇',
  };
  return icons[icon] || '✓';
}
