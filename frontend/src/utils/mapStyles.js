export const LIGHT_NAV_STYLES = [
  // Hide transit labels only
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  // Landscape / base
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#eef0f2' }] },
  // Water
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c8dbe9' }] },
  // Highways — warm highlight for navigation feel
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffd9a0' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#e0b270' }, { weight: 1.5 }] },
  // Arterial roads
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  // Local roads
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  // Road labels
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#5a6270' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 3 }] },
  // Administrative labels (country/region names)
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#7a838f' }] },
  { featureType: 'administrative.province', elementType: 'labels.text.fill', stylers: [{ color: '#7a838f' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#6a7280' }] },
  // Remove default green parks coloring, use same muted landscape
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#e2e6eb' }] },
];

export const DARK_NAV_STYLES = [
  // Hide transit labels only
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  // POI labels — brighter for readability on dark base
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d0d7de' }] },
  { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#0d1015' }, { weight: 4 }] },
  // POI icons — slightly brighter
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ saturation: -20 }, { lightness: 15 }] },
  // Base landscape — near black
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#14161c' }] },
  // Water — very dark
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1a26' }] },
  // Highways — dark amber (navigation night driving look)
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#3a2a12' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#4a3a20' }, { weight: 1.5 }] },
  // Arterial roads
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#2a2e38' }] },
  // Local roads
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#23262e' }] },
  // Road labels — brighter for readability
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#e8eef4' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#0d1015' }, { weight: 4 }] },
  // Administrative labels — brighter
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#d0d7de' }] },
  { featureType: 'administrative.province', elementType: 'labels.text.fill', stylers: [{ color: '#c4cbd5' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#b8c0cc' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels.text.fill', stylers: [{ color: '#a8b0bb' }] },
  // Man-made structures
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#1a1d24' }] },
];