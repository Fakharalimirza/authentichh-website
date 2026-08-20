# Components (`frontend/src/components/`)

Three categories of React components.

## `public/` (formerly `ui/`)

Design system components shared across public pages. Reusable, prop-driven, minimal logic.

| Component | File | Used by |
|-----------|------|---------|
| Button | `public/Button.jsx` | All pages and admin pages |
| Card | `public/Card.jsx` | Public pages |
| Badge | `public/Badge.jsx` | Admin tables, property status |
| Input | `public/Input.jsx` | Forms (public + admin) |
| Modal | `public/Modal.jsx` | Public pages |
| Toast | `public/Toast.jsx` | App-wide via `ToastProvider` |
| Skeleton | `public/Skeleton.jsx` | Loading states (public + admin) |
| PropertyCard | `public/PropertyCard.jsx` | Home, Apartments pages |
| DirhamSymbol | `public/DirhamSymbol.jsx` | Price display (public + admin) |
| AgentAdminCard | `public/AgentAdminCard.jsx` | Admin landlord requests |
| index.js | `public/index.js` | Barrel exports |

## `admin/`

Admin panel components. Used only within admin pages (wrapped in `AdminLayout`).

| Component | File | Used by |
|-----------|------|---------|
| AdminLayout | `admin/AdminLayout.jsx` | All admin pages |
| AdminHeader | `admin/AdminHeader.jsx` | Inside AdminLayout |
| BottomTabBar | `admin/BottomTabBar.jsx` | Admin mobile via AdminLayout |
| MobileMoreSheet | `admin/MobileMoreSheet.jsx` | Admin mobile via AdminLayout |
| MobileCard | `admin/MobileCard.jsx` | MobileCardList |
| MobileCardList | `admin/MobileCardList.jsx` | Admin list pages |
| ConfirmDialog | `admin/ConfirmDialog.jsx` | Delete/confirm actions |
| IconPicker | `admin/IconPicker.jsx` | AdminAmenities |
| TableSkeleton | `admin/TableSkeleton.jsx` | Admin table loading states |

## `shared/`

Components shared between public and admin contexts.

| Component | File | Used by |
|-----------|------|---------|
| AdminSidebar | `shared/AdminSidebar.jsx` | AdminLayout (desktop) |
| Header | `shared/Header.jsx` | PublicLayout in App.jsx |
| Footer | `shared/Footer.jsx` | PublicLayout in App.jsx |
| DateRangePicker | `shared/DateRangePicker.jsx` | Public pages (enquiry form) |
| PropertyFilters | `shared/PropertyFilters.jsx` | Apartments page, listing layout |
