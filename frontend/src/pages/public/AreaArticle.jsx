import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import Button from '../../components/public/Button';
import Badge from '../../components/public/Badge';
import { AnimateSection } from '../../hooks/useOnScreen';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Skeleton } from '../../components/public/Skeleton';
import { useI18n } from '../../i18n/I18nContext';

function ArticleSkeleton() {
  return (
    <main style={{ paddingTop: 'var(--header-height)' }}>
      <section className="article-skeleton-hero">
        <div style={{ textAlign: 'center', width: '100%', maxWidth: 600 }}>
          <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 20, margin: '0 auto 16px' }} />
          <div className="skeleton" style={{ width: '70%', height: 36, margin: '0 auto 8px' }} />
          <div className="skeleton" style={{ width: '50%', height: 16, margin: '0 auto' }} />
        </div>
      </section>
      <div className="container">
        <div className="skeleton" style={{ width: 200, height: 14, marginBottom: 8 }} />
      </div>
      <div className="article-skeleton-body">
        <div className="container">
          <div className="article-skeleton-layout">
            <div className="article-skeleton-main">
              <div className="skeleton" style={{ width: '40%', height: 28, marginBottom: 16 }} />
              <div className="skeleton" style={{ width: '100%', height: 16, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '100%', height: 16, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '75%', height: 16, marginBottom: 24 }} />
              <div className="skeleton" style={{ width: '30%', height: 28, marginBottom: 16 }} />
              <div className="skeleton" style={{ width: '100%', height: 16, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '60%', height: 16, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '85%', height: 16 }} />
            </div>
            <aside className="article-skeleton-sidebar">
              <div className="skeleton" style={{ width: '100%', height: 160, borderRadius: 14 }} />
              <div className="skeleton" style={{ width: '100%', height: 120, borderRadius: 14 }} />
              <div className="skeleton" style={{ width: '100%', height: 80, borderRadius: 14 }} />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AreaArticle() {
  const { slug } = useParams();
  const { t, locale } = useI18n();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/articles/public/${slug}`).then(({ data }) => {
      setArticle(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <ArticleSkeleton />;

  if (!article) {
    return (
      <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh' }}>
        <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
          <h1>{t('area_article.not_found')}</h1>
          <Link to="/"><Button variant="primary">{t('area_article.back_home')}</Button></Link>
        </div>
      </main>
    );
  }

  // Locale-aware content: prefer Arabic when locale is 'ar', fallback to English
  const isAr = locale === 'ar';
  const title = isAr && article.title_ar ? article.title_ar : article.title;
  const subtitle = isAr && article.subtitle_ar ? article.subtitle_ar : article.subtitle;
  const content = isAr && article.content_ar ? article.content_ar : article.content;
  const highlights = isAr && article.highlights_ar?.length ? article.highlights_ar : article.highlights;
  const idealFor = isAr && article.ideal_for_ar ? article.ideal_for_ar : article.ideal_for;
  const whyInDemand = isAr && article.why_in_demand_ar ? article.why_in_demand_ar : article.why_in_demand;
  const keywords = isAr && article.keywords_ar ? article.keywords_ar : article.keywords;

  // For the location query param, always use the English title prefix
  const locationQuery = article.title.split(' (')[0] || article.title;

  return (
    <>
      <Helmet>
        <title>{title} | Authentic Holiday Homes</title>
        <meta name="description" content={subtitle} />
        <meta name="keywords" content={keywords || ''} />
        <link rel="canonical" href={`https://authenticholidayhomes.ae/areas/${article.slug}`} />
        <meta property="og:title" content={`${title} | Authentic Holiday Homes`} />
        <meta property="og:description" content={subtitle} />
        {article.image_url && <meta property="og:image" content={`https://authenticholidayhomes.ae${article.image_url}`} />}
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description: subtitle,
          image: article.image_url,
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://authenticholidayhomes.ae/' },
            { '@type': 'ListItem', position: 2, name: 'Areas', item: 'https://authenticholidayhomes.ae/' },
            { '@type': 'ListItem', position: 3, name: title, item: `https://authenticholidayhomes.ae/areas/${article.slug}` },
          ],
        })}</script>
      </Helmet>

      <main style={{ paddingTop: 'var(--header-height)' }}>
        {/* Hero */}
        <section className="area-hero">
          <img
            className="area-hero-img"
            src={article.image_url || ''}
            alt={`${title} — ${subtitle}`}
            loading="eager"
          />
          <div className="area-hero-overlay" />
          <div className="container">
            <Badge variant="accent" size="md">{t('area_article.explore_badge')}</Badge>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{t('area_article.breadcrumb_home')}</Link>
            <ChevronRight size={12} />
            <span>{title}</span>
          </nav>
        </div>

        {/* Content + Sidebar */}
        <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>
          <div className="area-layout">
            {/* Main content */}
            <AnimateSection>
              <div className="area-content" dangerouslySetInnerHTML={{ __html: content }} />
            </AnimateSection>

            {/* Sidebar cards */}
            <aside className="area-sidebar">
              <AnimateSection>
                {highlights && highlights.length > 0 && (
                  <div className="area-card">
                    <h3>{t('area_article.highlights')}</h3>
                    <div className="area-highlights-grid">
                      {highlights.map((h, i) => (
                        <div key={i} className="area-highlight-item">
                          <CheckCircle size={16} />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {idealFor && (
                  <div className="area-card">
                    <h3>{t('area_article.ideal_for')}</h3>
                    <p className="area-card-text">{idealFor}</p>
                  </div>
                )}

                {whyInDemand && (
                  <div className="area-card">
                    <h3>{t('area_article.why_in_demand')}</h3>
                    <p className="area-card-text">{whyInDemand}</p>
                  </div>
                )}

                <Link
                  to={`/apartments?location=${encodeURIComponent(locationQuery)}`}
                  className="area-cta-btn"
                >
                  {t('area_article.view_apartments')}
                  <ChevronRight size={22} strokeWidth={2.5} />
                </Link>
              </AnimateSection>
            </aside>
          </div>

          <Link
            to={`/apartments?location=${encodeURIComponent(locationQuery)}`}
            className="area-cta-btn area-cta-btn--bottom"
          >
            {t('area_article.view_apartments')}
            <ChevronRight size={22} strokeWidth={2.5} />
          </Link>
        </div>
      </main>
    </>
  );
}
