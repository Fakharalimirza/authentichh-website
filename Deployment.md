---
tags: [deployment, cpanel, vps, production, hosting]
scope: infrastructure
files: [backend/.env, frontend/public/robots.txt, frontend/public/sitemap.xml]
---

# Deployment Guide — cPanel VPS

> Step-by-step deploy for hosting.com Cloud VPS with cPanel + "Setup Node.js App".
> Works for any cPanel VPS: Hostinger, A2 Hosting, InMotion, SiteGround, etc.

---

## Auto-Deploy (recommended — push to master = live)

GitHub is the single source of truth (`Fakharalimirza/authentichh-website`, branch **`master`**).
Two workflows in `.github/workflows/` connect it to the VPS — no manual upload, no FTP.

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `deploy.yml` | push → `master` | SSH → `reset --hard origin/master` → backend `npm ci` → safe idempotent migration(s) → frontend `npm ci` + `vite build` → copy `dist` to docroot → `.htaccess` deny-block → Passenger restart → health-checks |
| `build-check.yml` | PR → `master` | Same build on GitHub runners, no deploy — broken code is caught before merge |

**Secrets** (repo Settings → Secrets → Actions): `CPANEL_SSH_KEY` (ed25519 private), `CPANEL_HOST`, `CPANEL_USER`. (`APP_PORT` is legacy/optional — the health check probes the public test URL via `--resolve`, exactly what visitors hit, because Passenger intercepts `listen()` and no app TCP port is bound on loopback.)

**Safety:** restart happens only after a successful build — green run = live (~2–3 min), red run = previous build keeps serving. Rollback = `git revert` + push. Destructive DB migrations are never auto-run.

**Manual steps below remain the fallback** (first-time server setup, disaster recovery).

---

## Architecture

```
https://your-domain.com
├── public_html/                    ← React build (frontend/dist) served by Apache
│   ├── index.html                  ← SPA entry
│   └── .htaccess                   ← proxy /api + /uploads to Node, SPA fallback
├── Node.js App (Express, port 5000) ← backend/ (cPanel Application Manager)
└── MySQL (cPanel phpMyAdmin)       ← authentic_holiday_homes (16 tables)
```

- **Apache** handles static files, `/sitemap.xml` (now dynamic), `/robots.txt`, images, JS/CSS.
- **Node.js** handles API (`/api/*`) and uploaded images (`/uploads/*`).
- **`.htaccess`** bridges the two via `RewriteRule` + `[P]` (mod_proxy).

---

## Step 1 — Get code on the server

SSH into your VPS (or use cPanel Terminal):

```bash
cd ~
git clone https://github.com/Fakharalimirza/authentichh-website.git
cd authenticchh-website/backend
npm install --omit=dev
```

> `--omit=dev` skips devDependencies (Vite, etc.) — lighter on the server.

---

## Step 2 — Database

### Option A — Export your local DB (recommended)

This is the safest way to guarantee an identical working schema:

1. **Local** (XAMPP/phpMyAdmin) → select `authentic_holiday_homes` → Export → SQL → Download.
2. **Server** → cPanel → phpMyAdmin → create empty DB `authentic_holiday_homes` → Import the SQL file.

Done — all 16 tables, migrations, seed data included.

### Option B — Fresh install from scratch

1. cPanel → **MySQL Databases** → create DB `authentic_holiday_homes` + user → grant **ALL privileges**.
2. phpMyAdmin → Import `database/schema.sql` (base tables).
3. Apply migrations in order (one-by-one via phpMyAdmin SQL tab):

```
database/migration-settings.sql
database/migration-communities.sql
database/migration-buildings-units-complete.sql
database/migration-units-listings-split.sql
database/migration-documents.sql
database/migration-document-number.sql
database/migration-ocr-data.sql
database/migration-articles.sql
database/migration-articles-arabic.sql
database/migration-reviews-cache.sql
database/migration-smtp-config.sql
database/migration-landlord-simplify.sql
database/migration-landlord-full-name-ar.sql
database/migration-dedupe-multiowner.sql
database/migration-parking-spots.sql
database/migration-plus-code.sql
database/migration-properties-arabic.sql
```

> ⚠️ `migration-buildings-units-complete.sql` and `migration-units-listings-split.sql` rename/drop columns. Only run on a fresh or dev DB.

4. Seed data:

```bash
node database/seed.js              # admin user (admin/admin123)
node database/seed-communities.js  # 248 Dubai communities
node database/seed-articles.js     # 9 area articles (EN/AR)
```

---

## Step 3 — Backend `.env`

Create `backend/.env` (gitignored — never committed):

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=aah_user
DB_PASSWORD=your-strong-db-password
DB_NAME=authentic_holiday_homes

# JWT (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-random-64-char-secret-here
NODE_ENV=production
PORT=5000

# URLs
FRONTEND_URL=https://your-test-domain.com
SITE_URL=https://your-test-domain.com

# SMTP (optional — app reads from DB settings first, .env is fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

> Replace `your-test-domain.com` with the actual test domain.

---

## Step 4 — cPanel Node.js App

1. cPanel → **Setup Node.js App** → **Create Application**
   - Node.js version: **18.x** (or 20.x if available)
   - Application root: `~/authenticchh-website/backend`
   - Application URL: `/api` (or leave blank and note the port)
   - Application startup file: `server.js`
   - Application mode: **Production**
2. Click **Create** → note the assigned port (e.g., `30000`).
3. Go to **Environment Variables** → set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `NODE_ENV=production`, `SITE_URL`, `FRONTEND_URL` (or the `.env` file already handles this).
4. Click **Start** — the app starts on port 30000.

### Verify Node is running

```bash
curl http://127.0.0.1:30000/api/health
# → {"status":"ok","timestamp":"..."}
```

---

## Step 5 — Frontend build + serve

### Build

```bash
cd ~/authenticchh-website/frontend
npm install
npx vite build
# → frontend/dist/ (HTML + JS + CSS + images)
```

### Serve

Upload `frontend/dist/*` contents into `public_html/` (cPanel File Manager → Upload, or rsync/scp):

```bash
cp -r ~/authenticchh-website/frontend/dist/* ~/public_html/
```

### `.htaccess` (in `public_html/`)

Create `public_html/.htaccess`:

```apache
RewriteEngine On

# ---- Proxy API + uploads to Node app (change PORT below) ----
RewriteRule ^api(.*)$  http://127.0.0.1:30000/api$1  [P,L]
RewriteRule ^uploads(.*)$  http://127.0.0.1:30000/uploads$1  [P,L]

# ---- SPA fallback (all non-file, non-directory → index.html) ----
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

> Replace `30000` with the actual port cPanel assigned to your Node.js app.
> `mod_proxy` must be enabled (usually is on hosting.com cPanel). If you get 500 errors, contact support to enable it.

### Verify

```
https://your-test-domain.com/              → React app loads
https://your-test-domain.com/api/health    → {"status":"ok"}
https://your-test-domain.com/sitemap.xml   → XML (dynamic)
https://your-test-domain.com/robots.txt    → Disallow /admin + /api/
https://your-test-domain.com/admin/login   → Admin panel
```

---

## Step 6 — Post-deploy

### SSL

cPanel → **SSL/TLS** → **AutoSSL** → Enable (free Let's Encrypt).
All HTTP → HTTPS redirects.

### Admin password

Log into `/admin` → Settings → change from `admin123` to a strong password.

### OCR keys

Admin → **Settings → OCR** → paste your keys:
- OCR.space API Key (free tier: 25k req/month)
- Gemini API Key (free tier: 15 rpm)
- Set **Method** to "Auto"

### SMTP (if using contact/enquiry emails)

Admin → **Settings** → SMTP config:
- Host: `smtp.gmail.com`
- Port: `587`
- User: `your-email@gmail.com`
- Password: Gmail app password (not your real password)

### Reviews cron (7 days)

cPanel → **Cron Jobs** → add:

```bash
# Weekly: every Sunday at 3am
0 3 * * 0 curl -s "https://your-test-domain.com/api/reviews/refresh" >/dev/null 2>&1
```

Or run every 7 days (adjust the cron expression for your preference).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `/api/health` returns 502 or timeout | Node.js app isn't running. cPanel → Setup Node.js App → Start. |
| `.htaccess` gives 500 error | `mod_proxy` not enabled. Contact hosting.com support. |
| CORS error in admin | Set `FRONTEND_URL` env var to exact production domain (`https://your-test-domain.com`). |
| `ECONNREFUSED MySQL` | DB_USER/DB_PASSWORD wrong, or MySQL isn't on localhost:3306. |
| `/sitemap.xml` returns old static file | Apache is serving `public_html/sitemap.xml` before Node's `/sitemap.xml` route. Delete the static `public_html/sitemap.xml` (the Node dynamic one takes over). |
| `node --check` fails after deploy | Transfer issue — re-upload `server.js` and `controllers/*.js`. Ensure LF line endings. |
| 404 on area article pages | Check `area_articles` table has rows (`SELECT COUNT(*) FROM area_articles`). |
| Guest PDFs fail to upload | Run `node backend/run-document-number-migration.js` once. |

---

## Test domain checklist

- [ ] Git cloned to VPS
- [ ] Database imported (Option A or B)
- [ ] `backend/.env` configured with test domain URL
- [ ] Node.js app started in cPanel (note port)
- [ ] `curl localhost:PORT/api/health` → ok
- [ ] Frontend built (`npx vite build`) and copied to `public_html/`
- [ ] `.htaccess` created with correct port number
- [ ] `https://your-test-domain.com/` loads the React app
- [ ] `https://your-test-domain.com/api/health` returns ok
- [ ] `https://your-test-domain.com/sitemap.xml` returns dynamic XML
- [ ] Admin login works (`/admin/login`)
- [ ] OCR settings filled (OCR.space + Gemini keys)
- [ ] SSL enabled (AutoSSL / Let's Encrypt)

---

### Related
- [[Tech Stack]], [[Setup & Commands]], [[Backend API]], [[🏠 Home]]
