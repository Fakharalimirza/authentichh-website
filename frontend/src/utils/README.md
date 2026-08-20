# Utilities (`frontend/src/utils/`)

| File | Exports | Purpose |
|------|---------|---------|
| `api.js` | `api`, `adminApi` | Axios instances. `api` for public endpoints (`/api/...`). `adminApi` for admin endpoints (`/api/admin/...`) with JWT Bearer token injected via interceptor. Auto-redirects to `/admin/login` on 401/403. |
| `imageUrl.js` | `getImageUrl`, `PLACEHOLDER_IMG` | Transforms image paths to full URLs with size variants (thumb/small/medium/large). Handles relative paths, absolute URLs, and missing data gracefully (returns placeholder). |
| `amenityIcons.js` | `amenityIcons`, `CATEGORIES`, `renderIcon` | Maps amenity names to Lucide icons. `CATEGORIES` array for grouping. `renderIcon(iconName, size)` returns a React element. Used in wizard step, property details, and admin amenities page. |
| `format.js` | Various formatters | Number/currency formatting, date formatting utilities. |
