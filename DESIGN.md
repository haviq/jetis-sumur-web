---
version: alpha
name: Jetis Sumur
description: Cinematic dark padukuhan UI — void green base, emerald accent, film-grain atmosphere, editorial type. Inspired by portfolio motion (haviq.dev) + government trust.
colors:
  bg: "#070c0a"
  bg2: "#0c1310"
  surface: "#121a16"
  surface-soft: "#1a2420"
  border: "#24332c"
  text: "#e8f0eb"
  muted: "#8fa39a"
  muted2: "#667a70"
  accent: "#3f9d6c"
  accent-2: "#2d7a52"
  accent-bright: "#5ecf8f"
  accent-dim: "rgba(63, 157, 108, 0.14)"
  accent-glow: "rgba(63, 157, 108, 0.22)"
  danger: "#c45c5c"
  warn: "#c4923a"
  ok: "#3f9d6c"
  noise: "rgba(255, 255, 255, 0.035)"
  glow: "rgba(255, 255, 255, 0.04)"
typography:
  display:
    fontFamily: Source Serif 4
    fontSize: 2.6rem
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  h1:
    fontFamily: Source Serif 4
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: Source Sans 3
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.55
  caption:
    fontFamily: Source Sans 3
    fontSize: 0.75rem
    fontWeight: 500
    letterSpacing: "0.12em"
  preloader:
    fontFamily: Source Serif 4
    fontSize: "clamp(1rem, 4vw, 1.5rem)"
    fontWeight: 700
    letterSpacing: "0.18em"
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  full: 999px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#04140c"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
  preloader:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    accent: "{colors.accent}"
---

## Overview

**Jetis Sumur** is a dark cinematic product UI for padukuhan citizen data.
Visual language borrows portfolio polish (film grain, soft bloom, wide tracking)
while staying trustworthy for government/village use — emerald, not neon.

## Atmosphere (haviq.dev-inspired)

1. **Void base** — near-black green `#070c0a`, not pure black.
2. **Film grain / noise** — fixed full-screen dissolve texture at ~3–4% opacity.
3. **Soft bloom** — large blurred emerald/white orbs behind content.
4. **Ambient particles** — sparse floating dots on canvas (preloader + site).
5. **Dual-layer preloader** — dark scrim + content layer; type with wide tracking;
   curtains slide top↔bottom; letter-by-letter reveal.

## Motion

- Page tabs: enter from top, leave downward.
- Cards: stagger fade-up; hover lift 3px.
- Preloader once per session; skip on `/ops`.
- Respect `prefers-reduced-motion`.

## Do / Don't

- **Do** use emerald glow sparingly; keep body copy high contrast.
- **Do** keep personal data off public pages.
- **Don't** use pure neon green, purple SaaS gradients, or generic AI purple blobs.
- **Don't** show demo passwords on login.
