import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { api } from '../../utils/api';
import { Star, X } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

function Avatar({ src, name }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || '?').charAt(0).toUpperCase();

  return (
    <div className="review-card-avatar-wrap">
      {!failed && src && (
        <img src={src} alt={name} className="review-card-avatar" onError={() => setFailed(true)} />
      )}
      {(failed || !src) && (
        <div className="review-card-avatar review-card-avatar--fallback">{initial}</div>
      )}
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div className="skeleton" style={{ width: 220, height: 28, margin: '0 auto 8px' }} />
          <div className="skeleton" style={{ width: 140, height: 16, margin: '0 auto' }} />
        </div>
        <div className="reviews-strip" style={{ justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="review-card" style={{ pointerEvents: 'none', border: 'none', background: 'transparent' }}>
              <div className="review-card-header" style={{ pointerEvents: 'none' }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                <div className="skeleton" style={{ width: 70, height: 12 }} />
              </div>
              <div className="skeleton" style={{ width: 54, height: 10, alignSelf: 'flex-start' }} />
              <div style={{ flex: 1, width: '100%' }}>
                <div className="skeleton" style={{ width: '100%', height: 100, borderRadius: 4 }} />
              </div>
              <div className="skeleton" style={{ width: 60, height: 8 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Reviews({ compact }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const { t } = useI18n();

  useEffect(() => {
    api.get('/reviews')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ReviewsSkeleton />;
  if (!data || !data.reviews || !data.reviews.length) return null;

  const displayed = compact ? data.reviews.slice(0, 3) : data.reviews;
  const reviewCarouselSlides = displayed.length > 1
    ? [...displayed, ...displayed]
    : displayed;

  return (
    <section className="section reviews-section">
      <div className="container">
        <div className="reviews-header">
          <h2>{t('reviews.heading')}</h2>
          <div className="reviews-rating-badge">
            <Star size={20} fill="currentColor" stroke="none" />
            <span>{data.rating}</span>
            <span className="reviews-total">· {data.total_ratings} reviews</span>
          </div>
        </div>

        <Swiper
          key={displayed.length}
          modules={[Autoplay]}
          autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          speed={700}
          loop={reviewCarouselSlides.length > 1}
          centeredSlides={true}
          slideToClickedSlide={true}
          slidesPerView={1.15}
          spaceBetween={12}
          breakpoints={{
            480: { slidesPerView: 1.4, spaceBetween: 12 },
            768: { slidesPerView: 2.2, spaceBetween: 14 },
            1024: { slidesPerView: 3, spaceBetween: 16 },
            1440: { slidesPerView: 5, spaceBetween: 20 },
          }}
          observer
          observeParents
          observeSlideChildren
          watchSlidesProgress
          className="reviews-swiper"
        >
          {reviewCarouselSlides.map((review, i) => {
            const realIndex = i % displayed.length;
            return (
              <SwiperSlide key={`review-${i}`} className="review-slide">
                {({ isActive }) => (
                  <button
                    className={`review-card${isActive ? ' review-card--active' : ''}`}
                    onClick={() => setExpanded(current => current === realIndex ? null : realIndex)}
                  >
                    <div className="review-card-header">
                      <Avatar src={review.profile_photo_url} name={review.author_name} />
                      <span className="review-card-name">{review.author_name}</span>
                    </div>
                    <div className="review-card-stars">
                      {[1, 2, 3, 4, 5].map(j => (
                        <Star key={j} size={14} fill="var(--color-accent)" stroke="var(--color-accent)" strokeWidth={0} />
                      ))}
                    </div>
                    {review.text && (
                      <div className="review-card-text-wrap">
                        <p className="review-card-preview">{review.text}</p>
                        <span className="review-card-read-more">{t('reviews.tap_more')}</span>
                      </div>
                    )}
                    {review.relative_time_description && (
                      <span className="review-card-time">{review.relative_time_description}</span>
                    )}
                  </button>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>

        {expanded !== null && displayed[expanded] && (
          <div className="review-expanded">
            <div className="review-expanded-header">
              <Avatar src={displayed[expanded].profile_photo_url} name={displayed[expanded].author_name} />
              <div>
                <strong>{displayed[expanded].author_name}</strong>
                <div className="review-expanded-stars">
                  {[1, 2, 3, 4, 5].map(j => (
                    <Star key={j} size={14} fill="var(--color-accent)" stroke="none" />
                  ))}
                </div>
              </div>
              <span className="review-expanded-time">{displayed[expanded].relative_time_description}</span>
              <button className="review-expanded-close" onClick={() => setExpanded(null)} aria-label={t('modal.close')}>
                <X size={18} />
              </button>
            </div>
            <p className="review-expanded-text">{displayed[expanded].text}</p>
          </div>
        )}
      </div>
    </section>
  );
}
