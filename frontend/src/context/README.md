# Context Providers (`frontend/src/context/`)

| File | Provider | Purpose | Consumed by |
|------|----------|---------|-------------|
| `AdminAuthContext.jsx` | `AdminAuthProvider` | JWT-based admin authentication. Manages login, logout, token storage in localStorage. Exposes `isAuthenticated`, `loading`, `user`, `login()`, `logout()`. | `App.jsx` wraps admin routes. `AdminLogin.jsx`, `AdminLayout.jsx` consume via `useAdminAuth()`. |

## Note

`ThemeContext` lives in `contexts/ThemeContext.jsx` (plural) for legacy reasons. Provides `theme`, `changePreference()` for dark/light/system mode. Consumed by `App.jsx` via `ThemeProvider` and by `AdminSidebar.jsx`, `AdminLogin.jsx` via `useTheme()`.
