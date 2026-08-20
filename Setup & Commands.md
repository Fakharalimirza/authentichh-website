---
tags: [setup, commands, dev-environment, deployment]
scope: meta
files: [backend/.env, vite.config.js, database/schema.sql]
---

# Setup & Commands

> Development environment setup and common commands.

---

## Prerequisites

| Tool | Notes |
|------|-------|
| **Node.js** | Required for frontend + backend |
| **XAMPP** | Apache + MySQL (v3.x or 8.x) |
| **Git** | For version control |

---

## Environment Variables

### Frontend
No `.env` file needed — Vite dev server proxies `/api` to `http://localhost:5000` via `vite.config.js`.

### Backend
File: `backend/.env`

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=authentic_holiday_homes
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Important**: `DB_PASSWORD` must be empty (XAMPP MySQL default has no password for root).

---

## XAMPP Setup

1. Open XAMPP Control Panel
2. Start **Apache** (port 80)
3. Start **MySQL** (port 3306)
4. Verify MySQL is running (green indicator)

---

## Database Setup

```bash
# Option A: Run both files
mysql -u root < database/schema.sql
mysql -u root < database/seed.sql

# Option B: Run the Node seed script (creates schema + sets admin password)
node database/seed.js
```

Or use phpMyAdmin at `http://localhost/phpmyadmin` to import `schema.sql`.

---

## Admin Login

| Detail | Value |
|--------|-------|
| **URL** | `http://localhost:5173/admin/login` |
| **Email** | `admin@authenticholidayhomes.ae` |
| **Password** | `admin123` |

After running `node database/seed.js`, the admin password is reset to `admin123`.

---

## Running the Backend

```bash
cd backend
npm install
npm run dev
```

Starts on `http://localhost:5000` with `--watch` (auto-restart on file changes).

---

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Starts on `http://localhost:5173` with Vite dev server (HMR).

---

## Production Build

```bash
cd frontend
npx vite build
```

Output goes to `frontend/dist/` — HTML, CSS, JS bundles.

---

## Git Commands

```bash
# Status
git status

# Diff
git diff

# Commit
git add <files>
git commit -m "message"

# Push (requires SSH key setup)
git push origin main

# Log
git log --oneline -10
```

**SSH key** must be set up and added to GitHub account (already done for `git@github.com:Fakharalimirza/authentichh-website.git`).

---

## Common Issues & Fixes

### "Port 5000 already in use"
```bash
# Find process on port 5000
netstat -ano | findstr :5000
# Kill the process
taskkill /PID <PID> /F
```

### "ECONNREFUSED MySQL"
- Ensure XAMPP MySQL is running
- Check `.env` credentials (user: root, password: empty)
- MySQL must be on port 3306

### "Invalid 'pb' parameter" (Google Maps)
The `map_url` stored in the database is invalid. Update the property in the admin panel with a valid Google Maps embed URL starting with `https://www.google.com/maps/embed`.

### "CORS error"
Check that `FRONTEND_URL` in backend `.env` matches the frontend URL. The CORS config allows:
- `http://localhost:5173`
- LAN IPs at port 5173

---

### Related
- [[Tech Stack]], [[Database]], [[File Map]], [[🏠 Home]]
