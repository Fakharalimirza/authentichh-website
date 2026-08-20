# Controllers (`backend/controllers/`)

Each controller handles HTTP request/response logic for one resource. All controllers use the MySQL connection pool from `config/db.js`.

| File | Handles routes from | Key methods |
|------|--------------------|-------------|
| `propertyController.js` | `routes/properties.js` | `getAll`, `getDetail`, `create`, `update`, `delete`, `uploadImages`, `deleteImage`, `setCover`, `reorderImages`, `exportCsv`, `bulkPriceUpdate` |
| `amenityController.js` | `routes/amenities.js` | `getAll`, `getAllAdmin`, `create`, `update` |
| `authController.js` | `routes/auth.js` | `login` (JWT generation) |
| `contactController.js` | `routes/contact.js` | `submit`, `getAll`, `updateStatus` |
| `enquiryController.js` | `routes/enquiries.js` | `submit`, `getAll`, `updateStatus` |
| `landlordController.js` | `routes/landlord.js` | `submit`, `getAll`, `updateStatus` |
| `dashboardController.js` | `routes/dashboard.js` | `getStats` (aggregated counts) |
| `adminUserController.js` | `routes/adminUsers.js` | `getAll`, `create`, `update`, `delete` |
| `settingsController.js` | `routes/settings.js` | `get`, `update` |
