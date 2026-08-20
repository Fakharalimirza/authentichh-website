# Pages (`frontend/src/pages/`)

Route-to-component mapping for the entire application.

## `public/` (customer-facing)

| Route | Component | File |
|-------|-----------|------|
| `/` | Home | `public/Home.jsx` |
| `/apartments` | Apartments | `public/Apartments.jsx` |
| `/apartments/:slug` | PropertyDetails | `public/PropertyDetails.jsx` |
| `/about` | About | `public/About.jsx` |
| `/facilities` | Facilities | `public/Facilities.jsx` |
| `/list-your-property` | ListProperty | `public/ListProperty.jsx` |
| `/contact` | Contact | `public/Contact.jsx` |
| `/terms` | Terms | `public/Terms.jsx` |
| `/privacy` | Privacy | `public/Privacy.jsx` |
| `/design-system` | DesignSystem | `public/DesignSystem.jsx` |

All public pages render inside `PublicLayout` (Header + main + Footer) defined in `App.jsx`.

## `admin/` (back-office)

| Route | Component | File |
|-------|-----------|------|
| `/admin/login` | AdminLogin | `admin/AdminLogin.jsx` |
| `/admin` | AdminDashboard | `admin/AdminDashboard.jsx` |
| `/admin/properties` | AdminProperties | `admin/AdminProperties.jsx` |
| `/admin/properties/new` | AdminPropertyWizard | `admin/AdminPropertyWizard.jsx` |
| `/admin/properties/edit/:id` | AdminPropertyWizard | `admin/AdminPropertyWizard.jsx` |
| `/admin/landlord-requests` | AdminLandlordRequests | `admin/AdminLandlordRequests.jsx` |
| `/admin/enquiries` | AdminEnquiries | `admin/AdminEnquiries.jsx` |
| `/admin/contact-messages` | AdminContactMessages | `admin/AdminContactMessages.jsx` |
| `/admin/amenities` | AdminAmenities | `admin/AdminAmenities.jsx` |
| `/admin/admins` | AdminUsers | `admin/AdminUsers.jsx` |
| `/admin/settings` | AdminSettings | `admin/AdminSettings.jsx` |

All admin pages (except login) render inside `AdminLayout` which provides sidebar, header, mobile nav.

## Wizard Steps

`AdminPropertyWizard` uses extracted step components in `admin/wizard/`:

| Step | Component | File |
|------|-----------|------|
| 0 — Type | TypeStep | `admin/wizard/TypeStep.jsx` |
| 1 — Building | BuildingStep | `admin/wizard/BuildingStep.jsx` |
| 2 — Basic Info | BasicInfoStep | `admin/wizard/BasicInfoStep.jsx` |
| 3 — Details | DetailsStep | `admin/wizard/DetailsStep.jsx` |
| 4 — Description | DescriptionStep | `admin/wizard/DescriptionStep.jsx` |
| 5 — Images | ImagesStep | `admin/wizard/ImagesStep.jsx` |
| 6 — Amenities | AmenitiesStep | `admin/wizard/AmenitiesStep.jsx` |
| 7 — SEO & Publish | SeoStep | `admin/wizard/SeoStep.jsx` |

> Location was removed — lat/lng/plus_code/address are auto-filled from the selected building or community on save.
