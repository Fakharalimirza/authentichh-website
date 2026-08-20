---
tags: [task-list, planning, admin, roadmap]
scope: meta
files: []
---

# Master Task List

> Authentic Holiday Homes Admin Panel Overhaul

## Phase 1: Foundation & Layout
### P1.1 — AdminLayout.jsx (component-builder)
- [ ] P1.1.1 Create `frontend/src/components/admin/AdminLayout.jsx` wrapper component
- [ ] P1.1.2 Integrate AdminSidebar, ToastProvider, and main content `<Outlet/>`
- [ ] P1.1.3 Add responsive class logic for sidebar toggle state
- [ ] P1.1.4 Export as default; update App.jsx routes to wrap admin routes in AdminLayout

### P1.2 — AdminAuthContext.jsx (admin-crafter)
- [ ] P1.2.1 Create `frontend/src/contexts/AdminAuthContext.jsx` with React context
- [ ] P1.2.2 Implement `login(email, password)` calling `adminApi.post('/login')`
- [ ] P1.2.3 Implement `logout()` clearing localStorage and redirecting
- [ ] P1.2.4 Implement `checkAuth()` calling `adminApi.get('/me')` on mount
- [ ] P1.2.5 Provide `{ user, loading, login, logout }` to children
- [ ] P1.2.6 Wrap admin routes with AdminAuthProvider in App.jsx

### P1.3 — useToast hook (component-builder)
- [ ] P1.3.1 Verify existing Toast.jsx works; no new hook needed (useToast already exists at `components/ui/Toast.jsx:89`)
- [ ] P1.3.2 (Optional) Add convenience wrappers `toast.success(msg)`, `toast.error(msg)` to existing useToast

### P1.4 — ConfirmDialog.jsx (component-builder)
- [ ] P1.4.1 Create `frontend/src/components/admin/ConfirmDialog.jsx` using existing Modal
- [ ] P1.4.2 Accept `isOpen`, `title`, `message`, `onConfirm`, `onCancel`, `confirmLabel`, `variant` props
- [ ] P1.4.3 Render danger/primary confirm button based on variant
- [ ] P1.4.4 Export as default

### P1.5 — TableSkeleton.jsx (component-builder)
- [ ] P1.5.1 Verify existing TableSkeleton in `Skeleton.jsx:33` — already adequate
- [ ] P1.5.2 (Optional) Add `pageSize` prop to TableSkeleton for more flexible row count

### P1.6 — AdminSidebar Redesign (css-architect + component-builder)
- [ ] P1.6.1 Rewrite `frontend/src/components/AdminSidebar.jsx` with Lucide icons (LayoutDashboard, Building2, PlusCircle, ClipboardList, MessageSquare, Mail, Settings, Users, Sparkles, LogOut, ExternalLink)
- [ ] P1.6.2 Add mobile hamburger toggle button (Menu/X icons)
- [ ] P1.6.3 Add collapsible state via prop or context
- [ ] P1.6.4 Add user profile section with avatar fallback
- [ ] P1.6.5 Add nav sections with dividers: Main Management, Requests & Messages, Settings
- [ ] P1.6.6 Add "Amenities" nav link to /admin/amenities
- [ ] P1.6.7 Add "Users" nav link to /admin/users
- [ ] P1.6.8 Add "Settings" nav link to /admin/settings

### P1.7 — Admin CSS (css-architect + frontend-designer)
- [ ] P1.7.1 Create `frontend/src/styles/admin.css` for all admin-specific styles
- [ ] P1.7.2 Define dark mode admin variables (`.admin-dark` theme)
- [ ] P1.7.3 Add `.admin-layout` grid (sidebar + main)
- [ ] P1.7.4 Style `.admin-sidebar` — fixed left, scrollable, z-index stack
- [ ] P1.7.5 Style `.admin-sidebar.collapsed` narrow mode (~64px)
- [ ] P1.7.6 Responsive: below 768px overlay sidebar with backdrop
- [ ] P1.7.7 Style `.admin-main` padding and scroll
- [ ] P1.7.8 Style `.admin-header` row with title + actions
- [ ] P1.7.9 Style `.admin-card` stat cards for dashboard
- [ ] P1.7.10 Style `.admin-table` wrapper, responsive horizontal scroll
- [ ] P1.7.11 Style `.admin-form` layout, form groups, form rows
- [ ] P1.7.12 Style pagination controls `.admin-pagination`
- [ ] P1.7.13 Style ConfirmDialog overlay and content
- [ ] P1.7.14 Import admin.css in main.jsx

### P1.8 — App.jsx Route Updates (page-builder)
- [ ] P1.8.1 Wrap admin routes in AdminLayout + AdminAuthProvider
- [ ] P1.8.2 Add routes: /admin/amenities, /admin/users, /admin/settings
- [ ] P1.8.3 Lazy-load admin page components with React.lazy + Suspense

---

## Phase 2: Admin Login
### P2.1 — AdminLogin.jsx Redesign (admin-crafter)
- [ ] P2.1.1 Create `frontend/src/pages/admin/AdminLogin.jsx` redesign
- [ ] P2.1.2 Full-screen centered layout with auth card
- [ ] P2.1.3 Use AdminAuthContext login method instead of direct adminApi call
- [ ] P2.1.4 Add "Forgot password?" link (placeholder route)
- [ ] P2.1.5 Add branding logo and tagline
- [ ] P2.1.6 Add loading spinner state on submit
- [ ] P2.1.7 Show validation errors inline
- [ ] P2.1.8 Redirect to /admin on success
- [ ] P2.1.9 Auto-redirect if already authenticated

### P2.2 — Admin Login CSS (css-architect)
- [ ] P2.2.1 Style `.admin-login-container` fullscreen centered
- [ ] P2.2.2 Style `.admin-login-card` with shadow, rounded corners
- [ ] P2.2.3 Style `.admin-login-header` with logo + title
- [ ] P2.2.4 Style `.admin-login-form` inputs and button
- [ ] P2.2.5 Style `.admin-error-message` and `.admin-success-message`
- [ ] P2.2.6 Responsive: mobile full-width card

---

## Phase 3: Admin Dashboard
### P3.1 — AdminDashboard.jsx Overhaul (admin-crafter)
- [ ] P3.1.1 Create `frontend/src/pages/admin/AdminDashboard.jsx` redesign
- [ ] P3.1.2 Remove inline AdminSidebar import (use AdminLayout wrapper)
- [ ] P3.1.3 Fetch summary data via AdminAuthContext + adminApi
- [ ] P3.1.4 Display stat cards: Properties, Published, Draft, Enquiries, Landlord Requests, Contact Messages
- [ ] P3.1.5 Add "New" badges on stat cards for unread counts
- [ ] P3.1.6 Add "Recent Enquiries" mini-table section (last 5)
- [ ] P3.1.7 Add "Recent Landlord Requests" mini-table section (last 5)
- [ ] P3.1.8 Add "Quick Actions" button row
- [ ] P3.1.9 Add loading skeleton state while fetching
- [ ] P3.1.10 Add error state with retry button

### P3.2 — Dashboard CSS (css-architect)
- [ ] P3.2.1 Style stat card grid (responsive columns)
- [ ] P3.2.2 Style mini-table sections with section headers
- [ ] P3.2.3 Style quick actions row
- [ ] P3.2.4 Stat card hover effects

### P3.3 — Backend: Recent Data Endpoints (backend-plumber)
- [ ] P3.3.1 Add `GET /api/admin/dashboard/recent-enquiries` — last 5 enquiries with property name
- [ ] P3.3.2 Add `GET /api/admin/dashboard/recent-landlord-requests` — last 5 requests
- [ ] P3.3.3 Update dashboardController.js with recent data queries

---

## Phase 4: Properties Management
### P4.1 — AdminProperties.jsx Enhancements (admin-crafter)
- [ ] P4.1.1 Create `frontend/src/pages/admin/AdminProperties.jsx` redesign
- [ ] P4.1.2 Remove inline AdminSidebar import (use AdminLayout)
- [ ] P4.1.3 Replace `window.confirm` with ConfirmDialog component
- [ ] P4.1.4 Replace `alert` with useToast notifications
- [ ] P4.1.5 Add pagination controls (page, limit, total pages)
- [ ] P4.1.6 Add status filter dropdown (All / Published / Draft / Unpublished)
- [ ] P4.1.7 Add search input for property title/location
- [ ] P4.1.8 Use TableSkeleton component for loading state
- [ ] P4.1.9 Show empty state with CTA to add first property
- [ ] P4.1.10 Add "View on site" link for published properties
- [ ] P4.1.11 Add bulk actions: select checkboxes + "Delete Selected" button

### P4.2 — AdminPropertyWizard.jsx Enhancements (admin-crafter)
- [ ] P4.2.1 Create `frontend/src/pages/admin/AdminPropertyWizard.jsx` redesign
- [ ] P4.2.2 Remove inline AdminSidebar import (use AdminLayout)
- [ ] P4.2.3 Replace `window.confirm` with ConfirmDialog
- [ ] P4.2.4 Replace `alert` with useToast notifications
- [ ] P4.2.5 Add loading skeleton during edit fetch
- [ ] P4.2.6 Add unsaved changes warning on navigation away
- [ ] P4.2.7 Persist form state with localStorage draft backup
- [ ] P4.2.8 Add slug preview/edit field in SEO step
- [ ] P4.2.9 Add drag-and-drop image reordering (react-sortable-hoc or native HTML5 DnD)
- [ ] P4.2.10 Add image upload progress indicator
- [ ] P4.2.11 Clearer step validation: highlight incomplete steps
- [ ] P4.2.12 Add "Save as Draft" button at each step

### P4.3 — Backend: Paginated Admin Properties Endpoint (backend-plumber)
- [ ] P4.3.1 Add pagination support to `GET /api/admin/properties` (query params: page, limit, status, search)
- [ ] P4.3.2 Update propertyController.getAll to accept pagination for admin route
- [ ] P4.3.3 Return `{ properties, pagination: { page, limit, total, totalPages } }`
- [ ] P4.3.4 Add search filtering by title and location
- [ ] P4.3.5 Add bulk delete endpoint `POST /api/admin/properties/bulk-delete`
- [ ] P4.3.6 Add duplicate property endpoint `POST /api/admin/properties/:id/duplicate`

---

## Phase 5: Enquiries, Landlord Requests & Contact Messages
### P5.1 — AdminEnquiries.jsx Enhancements (admin-crafter)
- [ ] P5.1.1 Create `frontend/src/pages/admin/AdminEnquiries.jsx` redesign
- [ ] P5.1.2 Remove inline AdminSidebar (use AdminLayout)
- [ ] P5.1.3 Replace `alert` with useToast
- [ ] P5.1.4 Add TableSkeleton for loading
- [ ] P5.1.5 Add quick status filter tabs (All / New / Contacted / Closed)
- [ ] P5.1.6 Show enquiry detail in slide-out panel or expanded row
- [ ] P5.1.7 Add click-to-email and click-to-call links
- [ ] P5.1.8 Add status update with confirmation via ConfirmDialog
- [ ] P5.1.9 Responsive card view on mobile < 768px

### P5.2 — AdminLandlordRequests.jsx Enhancements (admin-crafter)
- [ ] P5.2.1 Create `frontend/src/pages/admin/AdminLandlordRequests.jsx` redesign
- [ ] P5.2.2 Remove inline AdminSidebar (use AdminLayout)
- [ ] P5.2.3 Replace `alert` with useToast
- [ ] P5.2.4 Add TableSkeleton for loading
- [ ] P5.2.5 Add status filter tabs
- [ ] P5.2.6 Show detail in slide-out panel or inline expand
- [ ] P5.2.7 Add status update with confirmation
- [ ] P5.2.8 Add "Convert to Property" action (pre-fills wizard with landlord data)
- [ ] P5.2.9 Responsive card view on mobile

### P5.3 — AdminContactMessages.jsx Enhancements (admin-crafter)
- [ ] P5.3.1 Create `frontend/src/pages/admin/AdminContactMessages.jsx` redesign
- [ ] P5.3.2 Remove inline AdminSidebar (use AdminLayout)
- [ ] P5.3.3 Replace `alert` with useToast
- [ ] P5.3.4 Add TableSkeleton for loading
- [ ] P5.3.5 Add status filter tabs
- [ ] P5.3.6 Show message detail in slide-out panel
- [ ] P5.3.7 Add reply placeholder (mailto: link)
- [ ] P5.3.8 Responsive card view on mobile

### P5.4 — Phase 5 CSS (css-architect)
- [ ] P5.4.1 Style filter tabs row
- [ ] P5.4.2 Style slide-out detail panel
- [ ] P5.4.3 Style expanded/inline detail row
- [ ] P5.4.4 Style responsive card view for tables

---

## Phase 6.1: Admin Amenities Page
### P6.1 — AdminAmenities.jsx (admin-crafter)
- [ ] P6.1.1 Create `frontend/src/pages/admin/AdminAmenities.jsx`
- [ ] P6.1.2 Fetch amenities via `adminApi.get('/amenities/admin')`
- [ ] P6.1.3 Display amenities in a table: Name, Icon, Description, Active status, Actions
- [ ] P6.1.4 Add "Create Amenity" button → opens Modal with form (name, icon, description)
- [ ] P6.1.5 Add inline edit capability (Modal pre-filled)
- [ ] P6.1.6 Add toggle active/inactive switch
- [ ] P6.1.7 Add delete with ConfirmDialog
- [ ] P6.1.8 Use useToast for success/error feedback
- [ ] P6.1.9 Use TableSkeleton for loading state

### P6.2 — Amenities CSS (css-architect)
- [ ] P6.2.1 Style amenity form modal
- [ ] P6.2.2 Style toggle switch for active/inactive

---

## Phase 6.2: Admin Users Page
### P6.2 — AdminUsers.jsx (admin-crafter)
- [ ] P6.2.1 Create `frontend/src/pages/admin/AdminUsers.jsx`
- [ ] P6.2.2 Display admin users in a table (id, name, email, role, active status, created_at)
- [ ] P6.2.3 Add "Create User" modal with form (name, email, password, role select)
- [ ] P6.2.4 Add inline edit modal (name, email, role, optional password)
- [ ] P6.2.5 Add toggle active/inactive
- [ ] P6.2.6 Add delete with ConfirmDialog (prevent self-deletion)
- [ ] P6.2.7 Use useToast for feedback
- [ ] P6.2.8 Use TableSkeleton for loading

### P6.2.9 — Backend: Admin Users CRUD (backend-plumber)
- [ ] P6.2.9.1 Create `backend/controllers/adminUserController.js`
- [ ] P6.2.9.2 `GET /api/admin/admin-users` — list all admin users
- [ ] P6.2.9.3 `GET /api/admin/admin-users/:id` — get single user
- [ ] P6.2.9.4 `POST /api/admin/admin-users` — create user (hash password with bcrypt)
- [ ] P6.2.9.5 `PUT /api/admin/admin-users/:id` — update user (optional password hash)
- [ ] P6.2.9.6 `DELETE /api/admin/admin-users/:id` — delete user (prevent self-delete)
- [ ] P6.2.9.7 Create `backend/routes/adminUsers.js`
- [ ] P6.2.9.8 Register routes in server.js under `/api/admin/admin-users`
- [ ] P6.2.9.9 Add superadmin-only middleware check for user management

---

## Phase 6.3: Admin Settings Page
### P6.3 — AdminSettings.jsx (admin-crafter)
- [ ] P6.3.1 Create `frontend/src/pages/admin/AdminSettings.jsx`
- [ ] P6.3.2 Fetch settings via `adminApi.get('/settings')`
- [ ] P6.3.3 Display settings grouped by category (General, Contact, SEO, Email)
- [ ] P6.3.4 Edit-in-place or modal for each setting
- [ ] P6.3.5 Save with `adminApi.put('/settings', { key, value })`
- [ ] P6.3.6 Use useToast for feedback
- [ ] P6.3.7 Add loading skeleton while fetching

### P6.3.8 — Backend: Settings CRUD (backend-plumber + db-architect)
- [ ] P6.3.8.1 Create `settings` table migration in schema.sql:
  ```sql
  CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_group VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
  ```
- [ ] P6.3.8.2 Seed default settings (site_name, site_description, contact_email, contact_phone, address, social_links)
- [ ] P6.3.8.3 Create `backend/controllers/settingController.js`
- [ ] P6.3.8.4 `GET /api/admin/settings` — list all settings
- [ ] P6.3.8.5 `PUT /api/admin/settings/:key` — update single setting value
- [ ] P6.3.8.6 `PUT /api/admin/settings/bulk` — bulk update settings
- [ ] P6.3.8.7 Create `backend/routes/settings.js`
- [ ] P6.3.8.8 Register routes in server.js under `/api/admin/settings`

---

## Phase 2-6 Cross-cutting
### X.1 — Route Registration in server.js (backend-plumber)
- [ ] X.1.1 Register adminUsers routes
- [ ] X.1.2 Register settings routes

### X.2 — App.jsx Route Registration (page-builder)
- [ ] X.2.1 Add import + route for AdminAmenities
- [ ] X.2.2 Add import + route for AdminUsers
- [ ] X.2.3 Add import + route for AdminSettings

### X.3 — Final QA & Documentation (reviewer + doc-writer)
- [ ] X.3.1 Run `npm run build` on frontend to verify no errors
- [ ] X.3.2 Check all imports resolve correctly
- [ ] X.3.3 Validate responsive behavior at 375px, 768px, 1024px, 1440px
- [ ] X.3.4 Validate dark mode toggle works on admin pages
- [ ] X.3.5 Update TEAM.md with completion status
- [ ] X.3.6 Create/update Obsidian docs in /obsidian/ directory

---

### Related
- [[TEAM]], [[Session Log]], [[Admin Panel]], [[🏠 Home]]
