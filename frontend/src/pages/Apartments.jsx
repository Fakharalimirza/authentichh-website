import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import PropertyCard from '../components/ui/PropertyCard';
import PropertyFilters from '../components/PropertyFilters';
import { PropertyCardSkeleton } from '../components/ui/Skeleton';

const defaultFilters = {
  location: '', property_type: '', bedrooms: '', guests: '',
  min_price: '', max_price: '', sort: 'newest',
};

export default function Apartments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    ...defaultFilters,
    location: searchParams.get('location') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    property_type: searchParams.get('property_type') || '',
    guests: searchParams.get('guests') || '',
  });

  const fetchProperties = () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set('page', searchParams.get('page') || '1');
    params.set('limit', '12');

    api.get(`/properties/published?${params.toString()}`)
      .then(r => {
        setProperties(r.data.properties);
        setPagination(r.data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearchParams({});
  };

  const changePage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setSort = (value) => {
    setFilters(prev => ({ ...prev, sort: value }));
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1 style={{ color: 'white' }}>Our Apartments</h1>
          <p>Browse our collection of premium holiday homes in Dubai</p>
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
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h3>No Properties Found</h3>
              <p>Try adjusting your filters to find available properties.</p>
              <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="listing-layout">
              <PropertyFilters
                filters={filters}
                onChange={setFilters}
                onApply={applyFilters}
                onClear={clearFilters}
                count={pagination.total}
              />
              <div>
                <div className="listing-results-bar">
                  <div className="listing-results-count">
                    <strong>{pagination.total}</strong> {pagination.total === 1 ? 'property' : 'properties'} found
                  </div>
                  <div className="listing-sort">
                    <label>Sort by</label>
                    <select value={filters.sort} onChange={e => setSort(e.target.value)}>
                      <option value="newest">Newest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="featured">Featured</option>
                    </select>
                  </div>
                </div>

                <div className="property-grid">
                  {properties.map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="pagination" style={{ marginTop: 'var(--space-10)' }}>
                    <button className="pagination-btn" disabled={pagination.page <= 1} onClick={() => changePage(pagination.page - 1)}>
                      ← Previous
                    </button>
                    {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`pagination-btn ${pagination.page === p ? 'active' : ''}`} onClick={() => changePage(p)}>{p}</button>
                    ))}
                    {pagination.totalPages > 7 && <span className="pagination-btn" style={{ cursor: 'default', border: 'none' }}>...</span>}
                    <button className="pagination-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => changePage(pagination.page + 1)}>
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
