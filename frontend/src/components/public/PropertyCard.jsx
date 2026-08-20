import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Users, ChevronLeft, ChevronRight, ArrowRight, Heart } from 'lucide-react';
import DirhamSymbol from './DirhamSymbol';
import { useFavorites } from '../../context/FavoritesContext';
import { useI18n } from '../../i18n/I18nContext';
import { getImageUrl, PLACEHOLDER_IMG } from '../../utils/imageUrl';

const PREVIEW_COUNT = 3;

function getNextIndex(i, len) {
  return i + 1 >= len ? 0 : i + 1;
}

function getPrevIndex(i, len) {
  return i - 1 < 0 ? len - 1 : i - 1;
}

export default function PropertyCard({ property, demoImg }) {
  const images = property.images?.length
    ? property.images.map(i => getImageUrl(typeof i === 'string' ? i : i.image_url, 'small'))
    : property.cover_image
      ? [getImageUrl(property.cover_image, 'small')]
      : demoImg
        ? [getImageUrl(demoImg)]
        : [PLACEHOLDER_IMG];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(null);
  const multiImage = images.length > 1;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useI18n();
  const isFav = isFavorite(property.id);

  /* Preload next image only */
  useEffect(() => {
    if (!multiImage) return;
    const nextIdx = getNextIndex(currentIndex, images.length);
    const img = new Image();
    img.src = images[nextIdx];
  }, [currentIndex, images, multiImage]);

  const goTo = useCallback((i) => {
    setCurrentIndex(i);
  }, []);

  const prev = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex(i => getPrevIndex(i, images.length));
  }, [images.length]);

  const next = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex(i => getNextIndex(i, images.length));
  }, [images.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCurrentIndex(i => getPrevIndex(i, images.length));
      else setCurrentIndex(i => getNextIndex(i, images.length));
    }
    touchStartX.current = null;
  };

  const handleFav = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(property.id);
  };

  const slug = property.slug || property.id;
  const linkTo = `/apartments/${slug}`;

  /* Build preview list: next N images after currentIndex */
  const previewImages = [];
  if (multiImage) {
    let idx = getNextIndex(currentIndex, images.length);
    for (let i = 0; i < Math.min(PREVIEW_COUNT, images.length - 1); i++) {
      previewImages.push({ index: idx, src: images[idx] });
      idx = getNextIndex(idx, images.length);
    }
  }

  return (
    <article
      className="pcard"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ─── Media ─── */}
      <Link to={linkTo} className="pcard-media" aria-label={property.title}>
        <div
          className="pcard-carousel"
          onTouchStart={multiImage ? handleTouchStart : undefined}
          onTouchEnd={multiImage ? handleTouchEnd : undefined}
        >
          {/* Single current image — only one <img> in DOM */}
          <img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${property.title} — ${property.location || ''}`}
            loading="eager"
            className="pcard-img"
          />
        </div>

        {/* Badges */}
        {property.is_featured && (
          <span className="pcard-badge">{t('property_card.featured')}</span>
        )}

        {/* Favorite */}
        <button
          className={`pcard-fav ${isFav ? 'pcard-fav--active' : ''}`}
          onClick={handleFav}
          aria-label={isFav ? t('property_card.fav_remove') : t('property_card.fav_add')}
          type="button"
        >
          <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
        </button>

        {/* Carousel arrows */}
        {multiImage && (
          <div className={`pcard-arrows ${isHovered ? 'pcard-arrows--visible' : ''}`}>
            <button className="pcard-arrow pcard-arrow--prev" onClick={prev} aria-label={t('property_card.prev_image')} type="button">
              <ChevronLeft size={20} />
            </button>
            <button className="pcard-arrow pcard-arrow--next" onClick={next} aria-label={t('property_card.next_image')} type="button">
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Image counter */}
        {multiImage && (
          <span className="pcard-counter">{currentIndex + 1} / {images.length}</span>
        )}

        {/* Thumbnail preview strip (next 3 images) */}
        {multiImage && (
          <div className="pcard-preview">
            {previewImages.map((p) => (
              <button
                key={p.index}
                className="pcard-preview-thumb"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); goTo(p.index); }}
                aria-label={`Go to image ${p.index + 1}`}
                type="button"
              >
                <img src={p.src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </Link>

      {/* ─── Content ─── */}
      <div className="pcard-body">
        {/* Location */}
        <div className="pcard-location">
          <MapPin size={13} className="pcard-location-icon" />
          <span>{property.location || 'Dubai'}</span>
        </div>

        {/* Title */}
        <Link to={linkTo} className="pcard-title-link">
          <h3 className="pcard-title">{property.title}</h3>
        </Link>

        {/* Meta */}
        <div className="pcard-meta">
          <span className="pcard-meta-item">
            <BedDouble size={15} />
            {property.bedrooms} {property.bedrooms === 1 ? t('property_card.bed') : t('property_card.beds')}
          </span>
          <span className="pcard-meta-item">
            <Bath size={15} />
            {property.bathrooms} {property.bathrooms === 1 ? t('property_card.bath') : t('property_card.baths')}
          </span>
          <span className="pcard-meta-item">
            <Users size={15} />
            {property.max_guests} {property.max_guests === 1 ? t('property_card.guest') : t('property_card.guests')}
          </span>
        </div>

        {/* Footer */}
        <div className="pcard-footer">
          <div className="pcard-price">
            <DirhamSymbol size="1em" />
            <span className="pcard-price-value">{parseFloat(property.price_per_night).toLocaleString()}</span>
            <span className="pcard-price-period"> {t('property_card.per_night')}</span>
          </div>
          <Link to={linkTo} className={`pcard-cta ${isHovered ? 'pcard-cta--hovered' : ''}`}>
            <span>{t('property_card.view')}</span>
            <ArrowRight size={16} className="pcard-cta-icon" />
          </Link>
        </div>
      </div>
    </article>
  );
}
