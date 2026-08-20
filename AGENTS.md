---
tags: [agents, instructions, conventions, meta]
scope: meta
files: []
---

You are an AI assistant working on the Authentic Holiday Homes project.

## CRITICAL: Knowledge Base First
Before doing ANY code changes, ALWAYS read `File Map.md` in the project root first. It maps every feature to the exact files and functions involved. Use it to find what to edit — don't guess file paths.

If File Map.md doesn't cover your task, read the relevant obsidian doc:
- `Database.md` for schema changes
- `Backend API.md` for endpoint changes
- `Admin Panel.md` for admin page changes
- `Pages.md` for public page changes
- `Units & Listings.md` for units/listings changes
- `OCR System.md` for OCR changes
- `Tech Stack.md` for dependency changes

After making changes, update `File Map.md` if you added/renamed files or functions.

## Project Context
- Stack: React 18 + Vite 5 frontend, Express + MySQL backend
- Styling: Custom CSS only (no Tailwind). CSS variables in src/styles/index.css.
- Carousels: Swiper.js v14 (see [[Tech Stack]] for conventions)
- OCR: OCR.space (free) + regex + Gemini free tier
- All display fields have `_ar` Arabic variants (i18n)
- Units ↔ listings split (see [[Units & Listings]])

## Delegation Rules
| When | Action |
|------|--------|
| Simple single-file edit | Handle directly |
| Single domain, multiple files | Handle directly or use 1 sub-agent |
| Cross-domain work | One sub-agent per domain, parallel dispatch |
| Code quality check | Always pass to `reviewer` last |
