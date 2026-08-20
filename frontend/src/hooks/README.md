# Custom Hooks (`frontend/src/hooks/`)

| Hook | File | Purpose | Used by |
|------|------|---------|---------|
| `useAdminToast` | `useAdminToast.js` | Returns `{ success(msg), error(msg) }` methods. Wraps the Toast context to show notifications from admin pages. | Admin pages: Properties, Enquiries, LandlordRequests, ContactMessages, Amenities, Users, PropertyWizard |

All hooks follow React conventions: start with `use`, callable only from React function components.
