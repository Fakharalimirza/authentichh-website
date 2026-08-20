/**
 * BuildingMapSection — Embedded map section for the homepage.
 * Shows all buildings as pins on a contained Google Map.
 * Supports dark/light mode, clustering, and InfoWindow popups.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { loadGoogleMaps } from '../../utils/loadGoogleMaps';
import { api } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from '../../i18n/I18nContext';
import { AnimateSection } from '../../hooks/useOnScreen';
import { LIGHT_NAV_STYLES, DARK_NAV_STYLES } from '../../utils/mapStyles';
import { Building2, ChevronRight } from 'lucide-react';
import { MarkerClusterer, GridAlgorithm } from '@googlemaps/markerclusterer';

/* ─── Cluster icon: red circle with count ─── */
function createClusterSVG(count) {
  return encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="20" fill="#E31E24" stroke="#fff" stroke-width="2.5"/>
      <text x="22" y="27" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${count >= 100 ? 13 : 15}" font-weight="700" fill="#fff">${count}</text>
    </svg>
  `);
}

/* ─── Pin SVG (red AHH pin) ─── */
function createPinSVG() {
  return encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
      <defs>
        <filter id="pds" x="-20%" y="-15%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M18 0C8.05 0 0 8.05 0 18c0 13.68 18 28.8 18 28.8s18-15.12 18-28.8C36 8.05 27.95 0 18 0z" fill="#E31E24" filter="url(#pds)"/>
      <circle cx="18" cy="17" r="9" fill="#fff"/>
    </svg>
  `);
}

/* ─── InfoWindow HTML ─── */
function buildInfoWindowHTML(building, t) {
  const unitsHTML = building.units && building.units.length > 0
    ? building.units.slice(0, 12).map(u =>
        `<span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;">${u.apartment_number || 'N/A'}</span>`
      ).join('') + (building.units.length > 12 ? `<span style="font-size:10px;color:#9ca3af;">+${building.units.length - 12} more</span>` : '')
    : `<span style="color:#9ca3af;font-size:11px;">No units yet</span>`;

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:280px;min-width:200px;">
      <div style="padding:10px 12px 8px;border-bottom:1px solid #f0f0f0;">
        <div style="font-size:14px;font-weight:700;color:#1a1a1a;line-height:1.3;">${building.name}</div>
        ${building.name_ar ? `<div style="font-size:12px;color:#6b7280;margin-top:1px;" dir="rtl">${building.name_ar}</div>` : ''}
        ${building.address ? `<div style="font-size:11px;color:#9ca3af;margin-top:3px;">${building.address}, ${building.city || 'Dubai'}</div>` : ''}
      </div>
      <div style="padding:8px 12px;display:flex;gap:12px;font-size:11px;color:#6b7280;">
        <div><strong style="color:#1a1a1a;">${building.unit_count}</strong> ${t('home.map_units')}</div>
      </div>
      ${building.units && building.units.length > 0 ? `
        <div style="padding:6px 12px 10px;">
          <div style="display:flex;flex-wrap:wrap;gap:3px;">${unitsHTML}</div>
        </div>
      ` : ''}
      <div style="padding:6px 12px 10px;border-top:1px solid #f0f0f0;">
        <a href="/apartments?building_id=${building.id}" style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:#E31E24;text-decoration:none;">
          ${t('home.map_view_units')} →
        </a>
      </div>
    </div>
  `;
}

/* ─── Custom cluster renderer ─── */
class HomeClusterRenderer {
  render({ count, position }, _stats, map) {
    const div = document.createElement('div');
    div.style.cssText = 'width:44px;height:44px;cursor:pointer;transform:translate(-50%,-50%);transition:transform 0.2s ease;';
    div.onmouseenter = () => { div.style.transform = 'translate(-50%,-50%) scale(1.12)'; };
    div.onmouseleave = () => { div.style.transform = 'translate(-50%,-50%) scale(1)'; };
    const img = document.createElement('img');
    img.src = `data:image/svg+xml;charset=UTF-8,${createClusterSVG(count)}`;
    img.style.cssText = 'width:100%;height:100%;pointer-events:none;';
    div.appendChild(img);
    return new google.maps.marker.AdvancedMarkerElement({
      position,
      content: div,
      map,
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
      title: `Cluster of ${count} buildings`,
    });
  }
}

export default function BuildingMapSection() {
  const containerRef = useRef(null);
  const googleRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const clustererRef = useRef(null);
  const infoWindowRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [stats, setStats] = useState({ total: 0, totalUnits: 0 });
  const { isDark } = useTheme();
  const { t } = useI18n();
  const isDarkRef = useRef(isDark);

  useEffect(() => { isDarkRef.current = isDark; }, [isDark]);

  const initMap = useCallback(async (apiKey, mapId) => {
    const google = await loadGoogleMaps(apiKey);
    googleRef.current = google;

    const map = new google.maps.Map(containerRef.current, {
      center: { lat: 25.2048, lng: 55.2708 },
      zoom: 11,
      gestureHandling: 'cooperative',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: isDarkRef.current ? DARK_NAV_STYLES : LIGHT_NAV_STYLES,
      ...(mapId ? { mapId } : {}),
    });

    mapRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();
    return map;
  }, []);

  const addMarkers = useCallback((buildingData) => {
    const google = googleRef.current;
    const map = mapRef.current;
    if (!google || !map) return;

    markersRef.current.forEach(m => { m.map = null; });
    markersRef.current = [];
    if (clustererRef.current) {
      clustererRef.current.setMap(null);
      clustererRef.current.clearMarkers();
    }

    const bounds = new google.maps.LatLngBounds();
    const markers = [];

    for (const b of buildingData) {
      const position = { lat: b.latitude, lng: b.longitude };

      // Create AdvancedMarkerElement with custom pin content
      const pinEl = document.createElement('div');
      pinEl.innerHTML = `<img src="data:image/svg+xml;charset=UTF-8,${createPinSVG()}" style="width:36px;height:48px;cursor:pointer;" />`;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        map,
        title: b.name,
        content: pinEl,
      });

      marker.addEventListener('gmp-click', () => {
        infoWindowRef.current.setContent(buildInfoWindowHTML(b, t));
        infoWindowRef.current.open({ anchor: marker, map });
      });

      markers.push(marker);
      bounds.extend(position);
    }

    markersRef.current = markers;

    clustererRef.current = new MarkerClusterer({
      map,
      markers,
      algorithm: new GridAlgorithm({ gridSize: 60 }),
      renderer: new HomeClusterRenderer(),
    });

    if (markers.length > 0) {
      if (markers.length === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(15);
      } else {
        map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
      }
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setStatus('loading');
      try {
        const configRes = await api.get('/config');
        const apiKey = configRes.data.mapsApiKey;
        const mapId = configRes.data.mapId;
        if (!apiKey) throw new Error('Maps API key missing');

        const { data: buildingData } = await api.get('/buildings/map-data');
        if (cancelled) return;

        const totalUnits = buildingData.reduce((sum, b) => sum + (b.unit_count || 0), 0);
        setStats({ total: buildingData.length, totalUnits });

        await initMap(apiKey, mapId);
        if (cancelled) return;

        addMarkers(buildingData);
        setStatus('ready');
      } catch (err) {
        if (!cancelled) {
          console.error('Building map error:', err);
          setStatus('error');
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      markersRef.current.forEach(m => { m.map = null; });
      markersRef.current = [];
      if (clustererRef.current) {
        clustererRef.current.setMap(null);
        clustererRef.current.clearMarkers();
      }
      const google = googleRef.current;
      if (google && mapRef.current) {
        google.maps.event.clearInstanceListeners(mapRef.current);
      }
      if (infoWindowRef.current) infoWindowRef.current.close();
      mapRef.current = null;
      googleRef.current = null;
    };
  }, [initMap, addMarkers]);

  // Live theme switch
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      map.setOptions({ styles: isDark ? DARK_NAV_STYLES : LIGHT_NAV_STYLES });
    }
  }, [isDark]);

  return (
    <section className="section home-map-section" style={{ background: 'var(--color-bg)' }}>
      <div className="container">
        <AnimateSection>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <hr className="divider-accent" style={{ margin: '0 auto var(--space-4)' }} />
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Building2 size={32} style={{ color: 'var(--color-primary)' }} />
              {t('home.map_title')}
            </h2>
            <p className="text-muted text-center" style={{ marginTop: 'var(--space-2)' }}>
              {t('home.map_subtitle')}
            </p>
          </div>
        </AnimateSection>

        <div className="home-map-wrap">
          <div ref={containerRef} className="home-map-container" />

          {status === 'loading' && (
            <div className="home-map-overlay">
              <div className="home-map-spinner" />
              <span style={{ fontSize: 13, color: '#6b7280' }}>{t('map.loading')}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="home-map-overlay">
              <span style={{ fontSize: 14, color: '#dc2626', fontWeight: 600 }}>{t('map.error')}</span>
            </div>
          )}
        </div>

        {status === 'ready' && stats.total > 0 && (
          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 13, color: 'var(--color-text-muted)' }}>
            <strong>{stats.total}</strong> {t('home.map_buildings')} &middot; <strong>{stats.totalUnits}</strong> {t('home.map_units')}
            <Link to="/apartments" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 16, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              {t('home.show_more')} <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
