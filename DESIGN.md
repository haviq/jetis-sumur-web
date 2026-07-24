# DESIGN.md — Jetis Sumur Pendataan

**Product:** Sistem Pendataan Warga  
**Tone:** Operational SaaS for desa — calm, trustworthy, dense-data friendly  
**Not:** Tourism landing / gold luxury (that’s Plosorejo)

---

## 1. Brand

| Token | Value |
|-------|-------|
| Product name | Jetis Sumur Data |
| Padukuhan | Padukuhan Jetis Sumur |
| Tagline | Pendataan warga yang rapi, bisa diaudit di spreadsheet |

---

## 2. Color (CSS variables)

```css
:root, [data-theme="dark"] {
  --bg: #0b1220;
  --bg2: #111827;
  --surface: #151f32;
  --surface-soft: #1a2740;
  --border: #243044;
  --text: #e8eef7;
  --muted: #94a3b8;
  --muted2: #64748b;
  --accent: #34d399;      /* emerald-400 */
  --accent-2: #10b981;    /* emerald-500 */
  --accent-dim: rgba(52, 211, 153, 0.15);
  --danger: #f87171;
  --warn: #fbbf24;
  --info: #38bdf8;
  --radius: 14px;
  --font: var(--font-inter), system-ui, sans-serif;
  --font-display: var(--font-display), var(--font), sans-serif;
}

[data-theme="light"] {
  --bg: #f4f7fb;
  --bg2: #ffffff;
  --surface: #ffffff;
  --surface-soft: #eef2f7;
  --border: #dbe3ee;
  --text: #0f172a;
  --muted: #475569;
  --muted2: #64748b;
  --accent: #059669;
  --accent-2: #047857;
  --accent-dim: rgba(5, 150, 105, 0.12);
}
```

---

## 3. Typography

- **UI / tables:** Inter 400/500/600/700  
- **Display (hero only):** "DM Sans" or "Plus Jakarta Sans" bold  
- Table density: 13–14px body, 11–12px meta  
- Never use decorative script fonts

---

## 4. Layout

### Public
- Max width content: 1120px  
- Hero: 2-col on desktop (copy + stats card stack)  
- CTA primary: “Masuk operator” only if we decide — **default: no public link to /ops**

### Admin `/ops`
- Full-width app shell  
- Top bar: product mark + stats chips + logout  
- Main: search sticky + table  
- Detail: drawer or `/ops/kk/[id]` page  
- Touch targets ≥ 44px

---

## 5. Components

| Component | Notes |
|-----------|-------|
| `StatCard` | Label + big number + subtle accent bar |
| `DataTable` | Horizontal scroll mobile; sticky first col optional |
| `SearchBar` | Debounced 200ms |
| `FilterChips` | RT + status |
| `FormField` | Label + error + helper |
| `Badge` | status aktif/pindah/meninggal |
| `EmptyState` | illustration text only |
| `LoginCard` | centered, minimal |

---

## 6. Status colors

| Status | Color |
|--------|-------|
| aktif | accent |
| pindah | info |
| meninggal / nonaktif | muted |
| pending pengajuan | warn |

---

## 7. Motion

- Prefer 150–250ms ease  
- No long preloader (ops tool)  
- Route transitions optional/off for admin

---

## 8. Assets

- Favicon: monogram **JS** in rounded square emerald  
- OG image: dark card “Pendataan Warga · Jetis Sumur”  
- No stock tourist photos required for V1

---

## 9. Do / Don’t

**Do:** dense tables, clear hierarchy, spreadsheet honesty in copy  
**Don’t:** gold luxury theme, public admin links, show full NIK on public pages
