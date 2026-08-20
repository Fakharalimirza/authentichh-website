---
tags: [design-system, tokens, css, frontend, theming]
scope: frontend
files: [frontend/src/styles/tokens.css, frontend/src/styles/global.css, frontend/src/styles/index.css]
---

# Design System

> All design tokens defined in `frontend/src/styles/tokens.css`.

---

## 1. Brand Colors

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `--color-primary` | `#E31E24` | `#FF4D4D` | Primary actions, CTAs, red accents |
| `--color-primary-hover` | `#C41A1F` | `#FF6B6B` | Hover state for primary elements |
| `--color-primary-active` | `#A6161A` | `#FF8A8A` | Active/pressed state |
| `--color-primary-light` | `#FDE8E8` | `#2D1414` | Subtle backgrounds, badges |
| `--color-primary-ghost` | `rgba(227,30,36,0.08)` | `rgba(255,77,77,0.15)` | Ghost hover states |

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `--color-accent` | `#C9A96E` | `#D4B47A` | Gold highlights, luxury accents |
| `--color-accent-hover` | `#B89445` | `#DFC694` | Hover state for accent elements |
| `--color-accent-light` | `#F5EFE0` | `#2A241C` | Subtle gold backgrounds |
| `--color-accent-ghost` | `rgba(201,169,110,0.1)` | `rgba(212,180,122,0.12)` | Ghost hover states |

### Surface & Background

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-bg` | `#FAFAF8` | `#0A0A0A` | Page background |
| `--color-surface` | `#FFFFFF` | `#141414` | Card backgrounds, elevated surfaces |
| `--color-surface-secondary` | `#F5F5F5` | `#1C1C1C` | Secondary surfaces, inputs |
| `--color-surface-tertiary` | `#EEEEEE` | `#262626` | Tertiary surfaces |
| `--color-elevated` | `#FFFFFF` | `#262626` | Modal, dropdown backgrounds |

### Text

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-text` | `#1A1A1A` | `#F5F5F5` | Primary body text |
| `--color-text-secondary` | `#555555` | `#A3A3A3` | Secondary text, descriptions |
| `--color-text-muted` | `#888888` | `#737373` | Muted text, placeholders |
| `--color-text-disabled` | `#BBBBBB` | `#404040` | Disabled text |

### Borders

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-border` | `#E5E7EB` | `#2A2A2A` | Default borders |
| `--color-border-hover` | `#D1D5DB` | `#404040` | Hover state borders |
| `--color-border-strong` | `#9CA3AF` | `#525252` | Stronger borders |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#16A34A` / `#22C55E` | Success messages, checkmarks |
| `--color-success-light` | `#F0FDF4` / `#1A2E1A` | Success backgrounds |
| `--color-warning` | `#F59E0B` / `#FBBF24` | Warning text |
| `--color-warning-light` | `#FFFBEB` / `#2D2415` | Warning backgrounds |
| `--color-error` | `#DC2626` / `#EF4444` | Error text |
| `--color-error-light` | `#FEF2F2` / `#2D1414` | Error backgrounds |
| `--color-info` | `#2563EB` / `#60A5FA` | Info text |
| `--color-info-light` | `#EFF6FF` / `#142437` | Info backgrounds |

### Overlay & Special

| Token | Value | Usage |
|-------|-------|-------|
| `--color-overlay` | `rgba(0,0,0,0.5)` / `0.7` | Modal backdrops |
| `--color-ripple` | `rgba(227,30,36,0.12)` / `rgba(255,77,77,0.2)` | Ripple effect |
| `--color-hero-overlay` | `rgba(0,0,0,0.6)` / `0.75` | Hero section overlay |
| `--color-hero-gradient` | `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(180,20,25,0.55) 100%)` | Page header gradient |

### Backward-Compat Aliases (in global.css)

```
--gold         = --color-accent
--gold-dark    = --color-accent-hover
--gold-light   = --color-accent-light
--red          = --color-primary
--red-dark     = --color-primary-hover
--red-light    = --color-primary-light
--text         = --color-text
--text-light   = --color-text-secondary
--bg           = --color-bg
--white        = --color-surface
```

---

## 2. Typography

### Font Families

| Token | Font Stack | Usage |
|-------|------------|-------|
| `--font-sans` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif` | Body text, UI labels |
| `--font-sans-arabic` | `'Noto Sans Arabic', 'IBM Plex Sans Arabic', var(--font-sans)` | Arabic RTL support |
| `--font-display` | `'Playfair Display', Georgia, 'Times New Roman', serif` | Headings, display text |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', monospace` | Code, monospace |

### Font Sizes

| Token | Value (rem) | Value (px) | Usage |
|-------|-------------|------------|-------|
| `--text-xs` | 0.75rem | 12px | Small labels, captions |
| `--text-sm` | 0.8125rem | 13px | Body small, meta |
| `--text-base` | 1rem | 16px | Body text |
| `--text-lg` | 1.125rem | 18px | Large body |
| `--text-xl` | 1.25rem | 20px | Small headings |
| `--text-2xl` | 1.5rem | 24px | Section headings |
| `--text-3xl` | 1.875rem | 30px | Page headings |
| `--text-4xl` | 2.25rem | 36px | Large headings |
| `--text-5xl` | 2.75rem | 44px | Hero headings |
| `--text-6xl` | 3.5rem | 56px | Display headings |
| `--text-7xl` | 4rem | 64px | Maximum display |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--leading-tight` | 1.15 | Headings |
| `--leading-snug` | 1.3 | Tight body |
| `--leading-normal` | 1.5 | Default body |
| `--leading-relaxed` | 1.65 | Readable body |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--weight-regular` | 400 | Body text |
| `--weight-medium` | 500 | Medium emphasis |
| `--weight-semibold` | 600 | Subheadings |
| `--weight-bold` | 700 | Headings, strong emphasis |

### Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--letter-spacing-tight` | -0.02em | Headings |
| `--letter-spacing-normal` | 0 | Body |
| `--letter-spacing-wide` | 0.03em | Uppercase labels |

---

## 3. Spacing Scale

| Token | Value (rem) | Value (px) |
|-------|-------------|------------|
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-5` | 1.25rem | 20px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-10` | 2.5rem | 40px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |
| `--space-20` | 5rem | 80px |
| `--space-24` | 6rem | 96px |

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small inputs, tags |
| `--radius-md` | 10px | Cards, buttons, sections |
| `--radius-lg` | 14px | Large cards, modals |
| `--radius-xl` | 18px | Extra-large containers |
| `--radius-2xl` | 24px | Jumbo containers |
| `--radius-pill` | 9999px | Pills, badges, rounded buttons |

---

## 5. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(24,32,29,0.04)` | Subtle depth |
| `--shadow-sm` | `0 1px 3px rgba(24,32,29,0.06), 0 1px 2px rgba(24,32,29,0.04)` | Cards |
| `--shadow-md` | `0 4px 12px rgba(24,32,29,0.08)` | Elevated cards |
| `--shadow-lg` | `0 8px 24px rgba(24,32,29,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 16px 48px rgba(24,32,29,0.12)` | Maximum elevation |

Dark mode shadows use rgba(0,0,0,...) with higher opacity values.

---

## 6. Motion

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Hovers, micro-interactions |
| `--duration-normal` | 250ms | Standard transitions |
| `--duration-slow` | 400ms | Accordeon, page transitions |

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default easing |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Fade transitions |
| `--ease-linear` | `linear` | Hover underlines |

---

## 7. Z-Index Scale

| Token | Value |
|-------|-------|
| `--z-base` | 1 |
| `--z-dropdown` | 100 |
| `--z-sticky` | 200 |
| `--z-navbar` | 300 |
| `--z-modal-backdrop` | 400 |
| `--z-modal` | 500 |
| `--z-toast` | 600 |
| `--z-tooltip` | 700 |

---

## 8. Layout

| Token | Value |
|-------|-------|
| `--max-width` | 1320px |
| `--max-width-narrow` | 840px |
| `--header-height` | 72px |
| `--header-height-scrolled` | 60px |
| `--admin-sidebar-width` | 260px |

---

## 9. Responsive Breakpoints

| Range | Label |
|-------|-------|
| 0 – 639px | **Mobile** |
| 640px – 1023px | **Tablet** |
| 1024px – 1439px | **Desktop** |
| 1440px+ | **Wide** |

---

## 10. Keyframes

### `pcardFadeIn`
Used on PropertyCard and carousel images for a subtle fade when the image source changes.
```css
@keyframes pcardFadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}
```

### `ringPulse`
Used on the contact review button (glowing CTA pulse rings) and on the floating sticky bar.
```css
@keyframes ringPulse {
  0%   { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.15); opacity: 0; }
}
```

### `bgDrift`
Used on the contact page section background for a slow-moving radial gradient.
```css
@keyframes bgDrift {
  0%   { background-position: 0% 50%; }
  25%  { background-position: 60% 30%; }
  50%  { background-position: 100% 60%; }
  75%  { background-position: 40% 80%; }
  100% { background-position: 0% 50%; }
}
```

### `shimmerSweep`
Used on the contact page for a gold shimmer sweep animation.
```css
@keyframes shimmerSweep {
  0%   { background-position: 100% 0; }
  50%  { background-position: 0% 0; }
  100% { background-position: 100% 0; }
}
```

---

## 11. Dark Mode Implementation

Dark mode is toggled by adding `data-theme="dark"` to the `<html>` element. All color tokens have dark variants defined under `[data-theme="dark"]`. Components use `var(--color-*)` tokens exclusively — no hardcoded colors in JSX.

Special dark-mode considerations:
- Maps: `filter: invert(0.88) hue-rotate(180deg)` on iframes
- Contact page backgrounds: adjusted opacity values for visibility
- Shadows: darker, higher opacity
- Surface colors: inverted from light to dark

---

### Related
- [[Component Library]], [[Pages]], [[Design Decisions]], [[File Map]], [[🏠 Home]]
