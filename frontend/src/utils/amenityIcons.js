/**
 * @fileoverview Amenity icon mapping — maps icon slugs to lucide-react components.
 */

import { createElement } from 'react';
import {
  Wifi, Waves, Dumbbell, Car, Lock, Snowflake, Tv,
  Shirt, CookingPot, Building, ShieldCheck, LockKeyhole,
  Coffee, Wind, Shield, Check,
} from 'lucide-react';

export const AMENITY_ICON_MAP = {
  wifi: Wifi,
  pool: Waves,
  gym: Dumbbell,
  parking: Car,
  smartlock: Lock,
  ac: Snowflake,
  tv: Tv,
  washer: Shirt,
  kitchen: CookingPot,
  balcony: Building,
  security: ShieldCheck,
  safe: LockKeyhole,
  coffee: Coffee,
  hair: Wind,
};

/** Ordered amenity categories for grouped display. */
export const CATEGORIES = [
  'Kitchen',
  'Entertainment',
  'Fitness & Wellness',
  'Safety & Security',
  'Comfort',
  'Convenience',
  'Outdoor',
  'Building',
];

export const CATEGORY_MAP = {
  'Wi-Fi': 'Entertainment',
  'Swimming Pool': 'Fitness & Wellness',
  'Gym': 'Fitness & Wellness',
  'Parking': 'Convenience',
  'Smart Lock': 'Safety & Security',
  'Air Conditioning': 'Comfort',
  'TV': 'Entertainment',
  'Washing Machine': 'Convenience',
  'Equipped Kitchen': 'Kitchen',
  'Balcony': 'Outdoor',
  'Security': 'Safety & Security',
  'Safe': 'Safety & Security',
  'Coffee Maker': 'Kitchen',
  'Hair Dryer': 'Comfort',
};

export { Check };

export function getAmenityIcon(iconName) {
  return AMENITY_ICON_MAP[iconName] || Shield;
}

export const ICON_OPTIONS = Object.keys(AMENITY_ICON_MAP).map(key => ({
  value: key,
  component: AMENITY_ICON_MAP[key],
}));

/** Render a lucide icon by its slug name. Falls back to Check icon if not found. */
export function renderIcon(iconName, size = 16) {
  const IconComp = AMENITY_ICON_MAP[iconName] || Check;
  return createElement(IconComp, { size });
}
