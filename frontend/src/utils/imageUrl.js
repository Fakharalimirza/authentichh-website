/**
 * @fileoverview Image URL resolution — handles relative paths, external URLs, and fallback placeholders.
 */

const PLACEHOLDER = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';

const IMAGE_SIZES = {
  thumb: { w: 150, h: 150 },
  small: { w: 400, h: 300 },
  medium: { w: 800, h: 600 },
  large: { w: 1920, h: 1080 },
};

/** Resolve a property image path to a full URL. Falls back to placeholder if no path given. */
export function getImageUrl(basePath, size) {
  if (!basePath) return PLACEHOLDER;
  if (typeof basePath !== 'string') return PLACEHOLDER;
  if (basePath.startsWith('http')) return basePath;
  if (/\.\w+$/.test(basePath)) return '/' + basePath;
  return `/${basePath}-${size || 'medium'}.webp`;
}

export { PLACEHOLDER, PLACEHOLDER as PLACEHOLDER_IMG, IMAGE_SIZES };
