# Plan — Jetis Sumur Pendataan Warga

**Date:** 2026-07-25  
**Slug:** jetis-sumur-pendataan  
**Mode:** PRD approved path → execute MVP  
**Workspace:** `/opt/data/jetis-sumur-web`

## Goal

Ship a **premium-looking** Next.js web app for **Padukuhan Jetis Sumur** citizen registry with **Google Sheets as DB**, GitHub push, and README that looks commercial-grade.

## Assumptions (until Hans overrides)

- Repo name: `jetis-sumur-web`
- Admin URL: `/ops` (secret/unlisted)
- Theme: dark + emerald (ops product, not Plosorejo gold)
- RT: 01–04 configurable
- Start with **demo seed data** (no real NIK)
- Sheets credentials provided later via env; until then mock mode / JSON fallback for local UI

## Approach

1. PRD (done) → DESIGN.md  
2. Scaffold Next.js + Tailwind  
3. Sheets abstraction with **mock store fallback** so UI works before Google credentials  
4. Admin CRUD + stats + export  
5. Public landing + optional pengajuan form  
6. Premium README + push GitHub  

## Step-by-step execution plan

### Task 1 — Design tokens & site content
- Write `DESIGN.md` (colors, type, components)
- `content/site.json` (nama padukuhan, alamat placeholder, RT list)

### Task 2 — Scaffold
```bash
cd /opt/data && npx create-next-app@latest jetis-sumur-web --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm --turbopack
# or manual package.json if create-next-app constrained
```
- Add deps: `googleapis` (or fetch REST), `zod`
- Base layout, globals dark theme

### Task 3 — Data layer
- `lib/types.ts` — KK, Warga, Pengajuan
- `lib/db/mock-store.ts` — in-memory + seed
- `lib/db/sheets.ts` — Google Sheets adapter
- `lib/db/index.ts` — pick sheets if env set else mock
- `content/seed-kk.json`, `seed-warga.json`

### Task 4 — Auth
- `lib/admin-auth.ts` — PIN cookie (pattern proven)
- `app/api/auth/login/route.ts`
- Gate all mutating APIs

### Task 5 — Admin UI `/ops`
- Login screen
- Dashboard stats cards
- KK table + search
- KK detail + anggota list
- Forms create/edit

### Task 6 — Public pages
- `/` landing premium
- `/pendataan` explainer
- `/ajukan` form → API
- `/privasi`

### Task 7 — Export
- `GET /api/export?type=kk|warga|flat` → CSV

### Task 8 — Docs & ship
- README premium (badges, screenshots placeholders, architecture diagram ASCII, setup Sheets step-by-step)
- SOP-ADMIN.md
- `.env.example`
- `git init` + GitHub create/push
- Optional Vercel (needs user login)

## Files (expected)

```
/opt/data/jetis-sumur-web/
  PRD.md
  DESIGN.md
  README.md
  SOP-ADMIN.md
  package.json
  app/layout.tsx
  app/page.tsx
  app/ops/page.tsx
  app/ajukan/page.tsx
  app/api/**/*
  components/**
  lib/**
  content/**
```

## Validation

- `tsc --noEmit`
- Manual: login → create KK → muncul di list → export CSV
- With Sheets env: row appears in spreadsheet
- No `/ops` in sitemap/nav

## Risks

| Risk | Mitigation |
|------|------------|
| No Google creds yet | Mock DB mode default |
| Sheets API complexity | Thin wrapper; batch values.update |
| Scope creep | Stick to P0 FR only for first push |

## Open questions (non-blocking for scaffold)

See PRD §18 — defaults applied if unanswered.
