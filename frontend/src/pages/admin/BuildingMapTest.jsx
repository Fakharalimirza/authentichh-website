/**
 * Building Map Test Page
 * Standalone full-screen Google Map showing all buildings as pins.
 * - Markers cluster at zoom levels where buildings are close together
 * - Click a marker to see building details + apartment list in an InfoWindow
 * - Favicon used as custom marker icon
 * - Auto-refreshes when buildings are added/removed (re-fetch on page load)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMaps } from '../../utils/loadGoogleMaps';
import { api } from '../../utils/api';
import { MapPin, Building2, Home, ChevronRight, X } from 'lucide-react';
import { MarkerClusterer, GridAlgorithm } from '@googlemaps/markerclusterer';

/* ─── Pin SVG with AHH favicon inside ─── */
function createPinSVG() {
  return encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
      <defs>
        <filter id="ds" x="-20%" y="-15%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M20 0C8.95 0 0 8.95 0 20c0 15.2 20 32 20 32s20-16.8 20-32C40 8.95 31.05 0 20 0z" fill="#E31E24" filter="url(#ds)"/>
      <circle cx="20" cy="18" r="11" fill="#fff"/>
    </svg>
  `);
}

/* ─── Cluster icon: red circle with count ─── */
function createClusterSVG(count) {
  return encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill="#E31E24" stroke="#fff" stroke-width="3"/>
      <text x="24" y="29" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${count >= 100 ? 14 : 16}" font-weight="700" fill="#fff">${count}</text>
    </svg>
  `);
}

/* ─── InfoWindow HTML for a selected building ─── */
function buildInfoWindowHTML(building) {
  const statusColors = {
    available: '#16a34a',
    occupied: '#dc2626',
    maintenance: '#f59e0b',
    reserved: '#6366f1',
  };

  const unitsHTML = building.units && building.units.length > 0
    ? building.units.map(u => {
        const color = statusColors[u.status] || '#6b7280';
        return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;background:${color}12;color:${color};font-size:11px;font-weight:500;border:1px solid ${color}30;">
          ${u.apartment_number || 'N/A'}
        </span>`;
      }).join('')
    : '<span style="color:#9ca3af;font-size:12px;">No units registered</span>';

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:320px;min-width:240px;padding:0;">
      <div style="padding:14px 16px 10px;border-bottom:1px solid #f0f0f0;">
        <div style="font-size:15px;font-weight:700;color:#1a1a1a;line-height:1.3;">${building.name}</div>
        ${building.name_ar ? `<div style="font-size:13px;color:#6b7280;margin-top:2px;" dir="rtl">${building.name_ar}</div>` : ''}
        ${building.address ? `<div style="font-size:12px;color:#9ca3af;margin-top:4px;">${building.address}, ${building.city || 'Dubai'}</div>` : ''}
      </div>
      <div style="padding:10px 16px;display:flex;gap:16px;font-size:12px;color:#6b7280;">
        <div><strong style="color:#1a1a1a;">${building.unit_count}</strong> units</div>
        ${building.plus_code ? `<div style="color:#9ca3af;">${building.plus_code}</div>` : ''}
      </div>
      ${building.units && building.units.length > 0 ? `
        <div style="padding:8px 16px 14px;">
          <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Apartments</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">${unitsHTML}</div>
        </div>
      ` : ''}
    </div>
  `;
}

/* ─── Custom cluster renderer ─── */
class FaviconClusterRenderer {
  render({ count, position }, _stats, map) {
    const div = document.createElement('div');
    div.style.cssText = 'width:48px;height:48px;cursor:pointer;transform:translate(-50%,-50%);transition:transform 0.2s ease;';
    div.onmouseenter = () => { div.style.transform = 'translate(-50%,-50%) scale(1.15)'; };
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

export default function BuildingMapTest() {
  const containerRef = useRef(null);
  const googleRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const clustererRef = useRef(null);
  const infoWindowRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [stats, setStats] = useState({ total: 0, totalUnits: 0 });

  const initMap = useCallback(async (apiKey, mapId) => {
    const google = await loadGoogleMaps(apiKey);
    googleRef.current = google;

    const map = new google.maps.Map(containerRef.current, {
      center: { lat: 25.2048, lng: 55.2708 },
      zoom: 11,
      gestureHandling: 'cooperative',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT,
      },
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#eef0f2' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c8dbe9' }] },
        { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffd9a0' }] },
        { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#e0b270' }, { weight: 1.5 }] },
        { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#5a6270' }] },
        { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 3 }] },
      ],
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

    // Clear existing markers
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
      pinEl.innerHTML = `<img src="data:image/svg+xml;charset=UTF-8,${createPinSVG()}" style="width:40px;height:52px;cursor:pointer;" />`;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        map,
        title: b.name,
        content: pinEl,
      });

      marker.addEventListener('gmp-click', () => {
        infoWindowRef.current.setContent(buildInfoWindowHTML(b));
        infoWindowRef.current.open({ anchor: marker, map });
        setSelectedBuilding(b);
      });

      markers.push(marker);
      bounds.extend(position);
    }

    markersRef.current = markers;

    // Set up clustering
    clustererRef.current = new MarkerClusterer({
      map,
      markers,
      algorithm: new GridAlgorithm({ gridSize: 60 }),
      renderer: new FaviconClusterRenderer(),
    });

    // Fit bounds to show all markers
    if (markers.length > 0) {
      if (markers.length === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(15);
      } else {
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      }
    }
  }, []);

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

        const map = await initMap(apiKey, mapId);
        if (cancelled) return;

        addMarkers(buildingData);
        setStatus('ready');
      } catch (err) {
        if (!cancelled) {
          console.error('Map init error:', err);
          setStatus('error');
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      // Clean up markers
      markersRef.current.forEach(m => { m.map = null; });
      markersRef.current = [];
      if (clustererRef.current) {
        clustererRef.current.setMap(null);
        clustererRef.current.clearMarkers();
      }
      // Clean up map listeners
      const google = googleRef.current;
      if (google && mapRef.current) {
        google.maps.event.clearInstanceListeners(mapRef.current);
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
      mapRef.current = null;
      googleRef.current = null;
    };
  }, [initMap, addMarkers]);

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-bg, #f5f5f5)' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', background: 'var(--color-surface, #fff)',
        borderBottom: '1px solid var(--color-border, #e5e7eb)',
        zIndex: 10, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Building2 size={20} style={{ color: 'var(--color-primary, #E31E24)' }} />
          <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text, #1a1a1a)' }}>
            Buildings Map
          </h1>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 12,
            background: 'var(--color-primary, #E31E24)', color: '#fff', fontWeight: 600,
          }}>
            TEST
          </span>
        </div>
        {status === 'ready' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--color-text-muted, #6b7280)' }}>
            <span><strong>{stats.total}</strong> buildings</span>
            <span><strong>{stats.totalUnits}</strong> units</span>
          </div>
        )}
      </div>

      {/* Map container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

        {/* Loading overlay */}
        {status === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            background: 'rgba(255,255,255,0.9)', zIndex: 5,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid #e5e7eb', borderTopColor: '#E31E24',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: 13, color: '#6b7280' }}>Loading map data...</span>
          </div>
        )}

        {/* Error overlay */}
        {status === 'error' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            background: 'rgba(255,255,255,0.95)', zIndex: 5,
          }}>
            <MapPin size={40} style={{ color: '#dc2626' }} />
            <span style={{ fontSize: 14, color: '#dc2626', fontWeight: 600 }}>Failed to load map</span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Check console for details. Make sure the API key is configured.</span>
          </div>
        )}
      </div>

      {/* Selected building panel (bottom) */}
      {selectedBuilding && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'var(--color-surface, #fff)',
          borderTop: '1px solid var(--color-border, #e5e7eb)',
          padding: '12px 20px', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text, #1a1a1a)' }}>
              {selectedBuilding.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted, #6b7280)', marginTop: 2 }}>
              {selectedBuilding.address}{selectedBuilding.address && selectedBuilding.city ? ', ' : ''}{selectedBuilding.city || 'Dubai'}
              {' '}&middot;{' '}{selectedBuilding.unit_count} units
            </div>
          </div>
          <a
            href={`/admin/listings?building_id=${selectedBuilding.id}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '6px 14px', borderRadius: 8,
              background: 'var(--color-primary, #E31E24)', color: '#fff',
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <Home size={14} />
            View Units
            <ChevronRight size={14} />
          </a>
          <button
            onClick={() => setSelectedBuilding(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, color: 'var(--color-text-muted, #6b7280)',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
