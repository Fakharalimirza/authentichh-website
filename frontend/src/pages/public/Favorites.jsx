import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import Button from '../../components/public/Button';
import PropertyCard from '../../components/public/PropertyCard';
import { PropertyCardSkeleton } from '../../components/public/Skeleton';
import { useFavorites } from '../../context/FavoritesContext';
import { useI18n } from '../../i18n/I18nContext';

export default function Favorites() {
  const { favorites } = useFavorites();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    if (favorites.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get('/properties/published?limit=100')
      .then(r => {
        const byId = r.data.properties.filter(p => favorites.includes(Number(p.id)));
        setProperties(byId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <>
      <Helmet>
        <title>{t('favorites.title')}</title>
        <meta name="description" content={t('favorites.subtitle')} />
        <meta property="og:title" content={t('favorites.title')} />
      </Helmet>
      <div className="page-header">
        <div className="container">
          <h1 style={{ color: 'white' }}>{t('favorites.heading')}</h1>
          <p>{t('favorites.subtitle')}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="property-grid">
              {[1,2,3,4,5,6].map(i => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <h3>{t('favorites.empty_title')}</h3>
              <p>{t('favorites.empty_text')}</p>
              <Link to="/apartments"><Button variant="primary">{t('favorites.browse')}</Button></Link>
            </div>
          ) : (
            <div className="property-grid">
              {properties.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
