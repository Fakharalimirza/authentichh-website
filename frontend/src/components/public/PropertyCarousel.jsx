/**
 * @fileoverview Property image swipe carousel with counter, dots, arrows and a full-featured lightbox.
 * Single main picture layout on all screen sizes (matches the former mobile style).
 * Lightbox: full-screen dark, keyboard nav (←/→/Esc), grid view toggle, prev/next.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Grid, X, Maximize2 } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
import { useI18n } from '../../i18n/I18nContext';

const AUTO_PLAY_INTERVAL = 4000;

export default function PropertyCarousel({ images, title }) {
  const allImages = images && images.length > 0 ? images : [{ image_url: null }];
  const imgCount = allImages.length;
  const { t } = useI18n();

  // Carousel state
  const [imgIndex, setImgIndex] = useState(0);
  const touchStartRef = useRef(null);
  const hoverRef = useRef(false);

  // Lightbox state
  const [lightbox, setLightbox] = useState(null); // null = closed, number = open at index
  const [lightboxView, setLightboxView] = useState('single'); // 'single' | 'grid'
  const lightboxIndexRef = useRef(0);

  const prevImg = useCallback(() => {
    setImgIndex(i => (i === 0 ? imgCount - 1 : i - 1));
    if (lightbox !== null) {
      lightboxIndexRef.current = (lightboxIndexRef.current === 0 ? imgCount - 1 : lightboxIndexRef.current - 1);
      setLightbox(lightboxIndexRef.current);
    }
  }, [imgCount, lightbox]);

  const nextImg = useCallback(() => {
    setImgIndex(i => (i === imgCount - 1 ? 0 : i + 1));
    if (lightbox !== null) {
      lightboxIndexRef.current = (lightboxIndexRef.current === imgCount - 1 ? 0 : lightboxIndexRef.current + 1);
      setLightbox(lightboxIndexRef.current);
    }
  }, [imgCount, lightbox]);

  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) prevImg(); else nextImg();
    }
    touchStartRef.current = null;
  };

  const openLightbox = useCallback((index) => {
    lightboxIndexRef.current = index;
    setLightbox(index);
    setLightboxView('single');
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    setLightboxView('single');
    document.body.style.overflow = '';
  }, []);

  const goToInLightbox = useCallback((index) => {
    lightboxIndexRef.current = index;
    setLightbox(index);
    setLightboxView('single');
  }, []);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') prevImg();
      else if (e.key === 'ArrowRight') nextImg();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, closeLightbox, prevImg, nextImg]);

  // Auto-advance (loops forever). Pauses on hover and while the lightbox is open;
  // timer restarts after every image change (auto or manual), so user navigation resets it.
  useEffect(() => {
    if (imgCount <= 1 || lightbox !== null) return;
    const id = setInterval(() => {
      if (hoverRef.current) return;
      setImgIndex(i => (i + 1) % imgCount);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(id);
  }, [imgCount, lightbox, imgIndex]);

  // Lightbox content
  const lightboxContent = lightbox !== null ? (
    <div
      className="pd-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Property photos"
      onClick={closeLightbox}
    >
      <button
        className="pd-lightbox-close"
        onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
        aria-label={t('carousel.exit_grid')}
      >
        <X size={28} />
      </button>

      {imgCount > 1 && (
        <>
          <button
            className="pd-lightbox-nav pd-lightbox-nav--prev"
            onClick={(e) => { e.stopPropagation(); prevImg(); }}
            aria-label={t('carousel.prev_photo')}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            className="pd-lightbox-nav pd-lightbox-nav--next"
            onClick={(e) => { e.stopPropagation(); nextImg(); }}
            aria-label={t('carousel.next_photo')}
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {lightboxView === 'single' ? (
        <img
          src={getImageUrl(allImages[lightboxIndexRef.current]?.image_url, 'large')}
          alt={`${title} — Photo ${lightboxIndexRef.current + 1}`}
          className="pd-lightbox-img"
        />
      ) : (
        <div className="pd-lightbox-grid" role="list" aria-label="All photos">
          {allImages.map((img, i) => (
            <button
              key={i}
              className={`pd-lightbox-grid-item ${i === lightboxIndexRef.current ? 'pd-lightbox-grid-item--active' : ''}`}
              onClick={(e) => { e.stopPropagation(); goToInLightbox(i); }}
              role="listitem"
              aria-label={`Photo ${i + 1}`}
              aria-current={i === lightboxIndexRef.current ? 'true' : 'false'}
            >
              <img
                src={getImageUrl(img.image_url, 'medium')}
                alt=""
                loading="lazy"
              />
              {i === lightboxIndexRef.current && (
                <span className="pd-lightbox-grid-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="pd-lightbox-toolbar">
        <div className="pd-lightbox-counter">
          {lightboxIndexRef.current + 1} / {imgCount}
        </div>
        {imgCount > 1 && (
          <button
            className="pd-lightbox-grid-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxView(v => v === 'single' ? 'grid' : 'single');
            }}
            aria-label={lightboxView === 'single' ? t('carousel.grid_view') : t('carousel.exit_grid')}
            aria-pressed={lightboxView === 'grid'}
          >
            {lightboxView === 'single' ? <Grid size={20} /> : <Maximize2 size={20} />}
          </button>
        )}
      </div>
    </div>
  ) : null;

  // Main carousel
  return (
    <>
      {lightboxContent}
      <div
        className="pd-gallery"
        role="region"
        aria-label="Property photos"
        onMouseEnter={() => { hoverRef.current = true; }}
        onMouseLeave={() => { hoverRef.current = false; }}
      >
        {imgCount > 1 && (
          <div className="pd-gallery-nav-dots" aria-label="Photo navigation">
            {allImages.map((_, i) => (
              <button
                key={i}
                className={`pd-gallery-dot ${i === imgIndex ? 'pd-gallery-dot--active' : ''}`}
                onClick={() => setImgIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === imgIndex ? 'true' : 'false'}
                type="button"
              />
            ))}
          </div>
        )}
        <div
          className="pd-gallery-main"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => imgCount > 1 && openLightbox(imgIndex)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openLightbox(imgIndex);
            }
          }}
          aria-label={`${title}, photo ${imgIndex + 1} of ${imgCount}`}
        >
          <img
            key={imgIndex}
            src={getImageUrl(allImages[imgIndex]?.image_url, 'large')}
            alt={`${title} — Photo ${imgIndex + 1}`}
            className="pd-gallery-img"
          />
          {imgCount > 1 && (
            <>
              <button
                className="pd-gallery-arrow pd-gallery-arrow--prev"
                onClick={(e) => { e.stopPropagation(); prevImg(); }}
            aria-label={t('carousel.prev_photo')}
                type="button"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className="pd-gallery-arrow pd-gallery-arrow--next"
                onClick={(e) => { e.stopPropagation(); nextImg(); }}
            aria-label={t('carousel.next_photo')}
                type="button"
              >
                <ChevronRight size={24} />
              </button>
              <span className="pd-gallery-counter">{imgIndex + 1} / {imgCount}</span>
            </>
          )}
        </div>
        {imgCount > 1 && (
          <p className="pd-gallery-hint">{t('carousel.fullscreen_hint')}</p>
        )}
      </div>
    </>
  );
}