import { useEffect, useRef, useState, useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../utils/api';
import { loadGoogleMaps } from '../../utils/loadGoogleMaps';
import { LIGHT_NAV_STYLES, DARK_NAV_STYLES } from '../../utils/mapStyles';
import { useI18n } from '../../i18n/I18nContext';

const MOBILE_QUERY = '(min-width: 640px)';

/* ─── Pin SVG (red AHH pin — matches homepage) ─── */
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

/* ─── InfoWindow HTML (consistent with homepage building popups) ─── */
function buildInfoWindowHTML(title, location, address) {
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:260px;min-width:160px;">
      <div style="padding:10px 12px;">
        <div style="font-size:14px;font-weight:700;color:#1a1a1a;line-height:1.3;">${title || ''}</div>
        ${location ? `<div style="font-size:12px;color:#6b7280;margin-top:3px;">${location}</div>` : ''}
        ${address ? `<div style="font-size:11px;color:#9ca3af;margin-top:3px;">${address}</div>` : ''}
      </div>
    </div>
  `;
}

/* ─── Fallback when no coordinates: Dubai default + "Open in Maps" button ─── */
function NoCoordsFallback({ title, location }) {
  const { t } = useI18n();
  const query = encodeURIComponent(`${title || ''} ${location || ''} Dubai`.trim());
  return (
    <div className="pd-map-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-surface-secondary)', flexDirection: 'column', gap: 12,
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
      }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, textAlign: 'center' }}>
          {t('map.no_location') || 'Exact location not available'}
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pd-map-open-btn"
        >
          <ExternalLink size={14} />
          <span>{t('map.open_google_maps') || 'Open in Google Maps'}</span>
        </a>
      </div>
    </div>
  );
}

export default function PropertyMap({ latitude, longitude, plusCode, title, location, address, active }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia(MOBILE_QUERY).matches;
  });

  const { isDark } = useTheme();
  const { t } = useI18n();

  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const isDarkRef = useRef(isDark);

  useEffect(() => { isDarkRef.current = isDark; }, [isDark]);

  const hasCoords = !!(latitude && longitude);
  const mapVisible = isDesktop || active;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const initMap = useCallback(async (apiKey, mapId, isCancelled) => {
    const google = await loadGoogleMaps(apiKey);
    if (isCancelled() || !containerRef.current) return null;

    containerRef.current.innerHTML = '';
    const position = { lat: Number(latitude), lng: Number(longitude) };

    const map = new google.maps.Map(containerRef.current, {
      center: position,
      zoom: 15,
      gestureHandling: 'cooperative',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: isDarkRef.current ? DARK_NAV_STYLES : LIGHT_NAV_STYLES,
      ...(mapId ? { mapId } : {}),
    });

    // AdvancedMarkerElement with custom pin (matches homepage)
    const pinEl = document.createElement('div');
    pinEl.innerHTML = `<img src="data:image/svg+xml;charset=UTF-8,${createPinSVG()}" style="width:36px;height:48px;cursor:pointer;" />`;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      map,
      title: `${title} — ${location || 'Dubai'}`,
      content: pinEl,
    });

    // InfoWindow on click
    const infoWindow = new google.maps.InfoWindow({
      content: buildInfoWindowHTML(title, location, address),
    });
    marker.addEventListener('gmp-click', () => {
      infoWindow.open({ anchor: marker, map });
    });

    markerRef.current = marker;
    infoWindowRef.current = infoWindow;

    return { map, google };
  }, [latitude, longitude, title, location, address]);

  useEffect(() => {
    if (!hasCoords) {
      setStatus('no-coords');
      return;
    }
    if (!mapVisible) return;

    let cancelled = false;
    let mapObj = null;
    let googleObj = null;

    setStatus('loading');

    api.get('/config')
      .then(res => {
        const apiKey = res.data.mapsApiKey;
        const mapId = res.data.mapId;
        if (!apiKey) throw new Error('Maps API key missing');
        return initMap(apiKey, mapId, () => cancelled);
      })
      .then(result => {
        if (cancelled || !result) return;
        mapObj = result.map;
        googleObj = result.google;
        mapInstanceRef.current = result.map;
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
      if (infoWindowRef.current) infoWindowRef.current.close();
      if (mapObj && googleObj) googleObj.maps.event.clearInstanceListeners(mapObj);
      mapInstanceRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [hasCoords, mapVisible, initMap]);

  // Live theme switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setOptions({ styles: isDark ? DARK_NAV_STYLES : LIGHT_NAV_STYLES });
    }
  }, [isDark]);

  if (status === 'no-coords') {
    return <NoCoordsFallback title={title} location={location} />;
  }

  return (
    <div className="pd-map-container" role="region" aria-label={`Map showing the location of ${title || 'this property'}`}>
      <div ref={containerRef} className="pd-map-iframe" />

      {status === 'loading' && (
        <div className="pd-map-status" aria-live="polite">{t('map.loading')}</div>
      )}
      {status === 'error' && (
        <div className="pd-map-status" aria-live="polite">{t('map.error')}</div>
      )}
    </div>
  );
}
