import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, ArrowRight } from 'lucide-react';
import { api } from '../../utils/api';
import Card from '../../components/public/Card';
import Badge from '../../components/public/Badge';
import { Skeleton } from '../../components/public/Skeleton';
import { AnimateSection } from '../../hooks/useOnScreen';
import { useI18n } from '../../i18n/I18nContext';

export default function Areas() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t, locale } = useI18n();

  useEffect(() => {
    let cancelled = false;
    api.get('/articles/public')
      .then(res => { if (!cancelled) setArticles(res.data); })
      .catch(() => { if (!cancelled) setError('Failed to load areas'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('areas.title')}</title>
        <meta name="description" content={t('areas.subtitle')} />
        <meta property="og:title" content={t('areas.title')} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Dubai Areas',
          description: 'Explore neighbourhoods and communities in Dubai',
          url: 'https://authenticholidayhomes.ae/areas',
          itemListElement: articles.map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://authenticholidayhomes.ae/areas/${a.slug}`,
            name: a.title,
          })),
        })}</script>
      </Helmet>

      <div className="page-header">
        <div className="container">
          <h1>{t('areas.heading')}</h1>
          <p>{t('areas.subtitle')}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="areas-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} variant="bordered" style={{ padding: 0, overflow: 'hidden' }}>
                  <Skeleton height={180} borderRadius={0} />
                  <div style={{ padding: 'var(--space-4)' }}>
                    <Skeleton height={22} width="70%" style={{ marginBottom: 12 }} />
                    <Skeleton height={14} width="100%" style={{ marginBottom: 6 }} />
                    <Skeleton height={14} width="85%" style={{ marginBottom: 12 }} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Skeleton height={22} width={60} borderRadius={999} />
                      <Skeleton height={22} width={80} borderRadius={999} />
                      <Skeleton height={22} width={50} borderRadius={999} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="empty-state">
              <h3>{t('areas.load_error')}</h3>
              <p>{error}</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="empty-state">
              <h3>{t('areas.no_areas')}</h3>
              <p>{t('areas.coming_soon')}</p>
            </div>
          ) : (
            <div className="areas-grid">
              {articles.map(article => {
                const isAr = locale === 'ar';
                const title = isAr && article.title_ar ? article.title_ar : article.title;
                const subtitle = isAr && article.subtitle_ar ? article.subtitle_ar : article.subtitle;
                const idealFor = isAr && article.ideal_for_ar ? article.ideal_for_ar : article.ideal_for;
                const highlights = isAr && article.highlights_ar?.length ? article.highlights_ar : article.highlights;

                return (
                <AnimateSection key={article.slug}>
                  <Link to={`/areas/${article.slug}`} className="area-index-card-link">
                    <Card variant="bordered" className="area-index-card" hover style={{ padding: 0, overflow: 'hidden' }}>
                      <div className="area-index-card-image" style={{
                        height: 200,
                        backgroundImage: article.image_url
                          ? `linear-gradient(rgba(0,0,0,0.25),rgba(0,0,0,0.4)), url("${article.image_url}")`
                          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: 'var(--space-4)',
                      }}>
                        <div style={{ width: '100%' }}>
                          <Badge variant="accent" size="sm" style={{ marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} />
                            {idealFor ? idealFor.split(',')[0].trim() : (isAr ? 'رائج' : 'Popular')}
                          </Badge>
                          <h3 className="area-index-card-title">{title}</h3>
                        </div>
                      </div>
                      <div style={{ padding: 'var(--space-4)' }}>
                        <p className="area-index-card-subtitle">
                          {subtitle}
                        </p>
                        {highlights?.length > 0 && (
                          <div className="area-index-card-tags">
                            {highlights.slice(0, 3).map((h, j) => (
                              <span key={j} className="area-index-card-tag">{h}</span>
                            ))}
                            {highlights.length > 3 && (
                              <span className="area-index-card-tag">+{highlights.length - 3} {isAr ? 'المزيد' : 'more'}</span>
                            )}
                          </div>
                        )}
                        <span className="area-index-card-cta">
                          {isAr ? 'استكشف المنطقة' : 'Explore Area'} <ArrowRight size={14} strokeWidth={2.5} />
                        </span>
                      </div>
                    </Card>
                  </Link>
                </AnimateSection>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
