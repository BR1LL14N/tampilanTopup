# Plan: Sky Fantasy Theme UI Refactor

## Overview
Refactor seluruh UI website Mitsuru Top Up dari **Dark Cyber Gaming Theme** ke **Sky Fantasy / Celestial Blue Theme** — light, clean, anime-inspired dengan wallpaper background dan nuansa biru muda pastel.

---

## Scope

### Files to Modify
- `tailwind.config.ts` — New color palette, fonts, shadows
- `app/globals.css` — New background system, glassmorphism light, bevel gradients, shimmer light
- `app/layout.tsx` — Font imports (Montserrat + Poppins), background layer
- `components/layout/header.tsx` — Sky Fantasy navbar (glassmorphism light, 80px height)
- `components/layout/footer.tsx` — Light footer with cloud decorations
- `components/home/home-content.tsx` — Full homepage refactor
- `components/game/game-card.tsx` — Product cards with new radius/shadow
- `components/game/game-detail-content.tsx` — Game detail with new theme
- `components/transaction/transaction-card.tsx` — Transaction cards light theme
- `components/ui/button.tsx` — Primary (sky blue #5CB8FF), Secondary (white outline)
- `components/ui/card.tsx` — White cards with light border/shadow
- `components/ui/input.tsx` — Light input fields with blue focus ring
- `components/ui/dialog.tsx` — Light glass dialog
- `components/ui/table.tsx` — Light table styling
- `components/ui/toast.tsx` — Light toast
- `components/ui/skeleton.tsx` — Light skeleton
- `components/ui/dropdown-menu.tsx` — Light dropdown
- `components/ui/label.tsx` — Label component
- `components/ui/tabs.tsx` — Light tabs
- `app/page.tsx` — Homepage (no change, delegates to home-content)
- `app/games/page.tsx` — Games listing
- `app/games/[slug]/page.tsx` — Game detail
- `app/checkout/[id]/page.tsx` — Checkout
- `app/check/page.tsx` — Transaction check
- `app/dashboard/page.tsx` — User dashboard
- `app/history/page.tsx` — Transaction history
- `app/history/[invoiceId]/page.tsx` — Invoice detail
- `app/leaderboard/page.tsx` — Leaderboard
- `app/calculator/page.tsx` — Calculator
- `app/admin/page.tsx` — Admin dashboard
- `app/admin/games/page.tsx` — Admin games
- `app/admin/products/page.tsx` — Admin products
- `app/admin/transactions/page.tsx` — Admin transactions
- `app/auth/login/page.tsx` — Login page
- `app/auth/register/page.tsx` — Register page

### Files NOT Modified (no visual change needed)
- `app/not-found.tsx` — Generic not found
- `app/auth/callback/route.ts` — Server-side API route
- `components/layout/page-header.tsx` — Simple page header (already simple)
- `components/game/game-icon.tsx` — Lucide icon wrapper (no styling)

---

## Phase 1: Foundation — Tailwind Config + Globals CSS

### 1.1 tailwind.config.ts — New Color Palette & Theme

**New Colors:**
```ts
colors: {
  // Sky Fantasy Primary
  sky: {
    DEFAULT: '#5CB8FF',  // Primary Sky Blue
    soft: '#8DD3FF',    // Soft Blue
    light: '#D9F1FF',   // Light Blue
  },
  // Secondary (Ice/Mist)
  cloud: '#FFFFFF',       // Cloud White
  mist: '#F7FBFF',        // Mist White
  ice: '#EEF8FF',         // Ice Blue
  // Accent
  diamond: '#39AFFF',     // Diamond Blue
  fantasy: '#63CFFF',     // Fantasy Cyan
  glow: '#7FD7FF',        // Glow Blue
  // Text
  text: {
    primary: '#1B3A57',   // Primary text
    secondary: '#53718E', // Secondary text
    muted: '#7F99B0',     // Muted text
  },
  // Background
  skybg: {
    start: '#F7FBFF',
    mid: '#EAF7FF',
    end: '#DFF2FF',
  },
  // Border
  'sky-border': '#CFEFFF',
  'card-border': '#D8EEFF',
}
```

**New Fonts:**
```ts
fontFamily: {
  heading: ['var(--font-montserrat)', 'sans-serif'],
  body: ['var(--font-poppins)', 'sans-serif'],
}
```

**New Shadows:**
```ts
boxShadow: {
  'sky-soft': '0 8px 20px rgba(92,184,255,.12)',
  'sky-medium': '0 12px 30px rgba(92,184,255,.18)',
  'sky-glow': '0 0 25px rgba(92,184,255,.35)',
}
```

**Border Radius:**
```ts
borderRadius: {
  'sm': '12px',
  'md': '20px',
  'lg': '24px',
  'hero': '32px',
}
```

### 1.2 app/globals.css — New Background System & Classes

**New Background Layer (on body):**
```css
body {
  background:
    url('/assets/app/wallpaper-bg.webp') center/cover no-repeat fixed,
    linear-gradient(180deg, #F7FBFF 0%, #EAF7FF 40%, #DFF2FF 100%);
}
```

**New CSS Classes:**

| Class | Purpose |
|-------|---------|
| `.sky-bg` | Fixed wallpaper + gradient overlay |
| `.cloud-decor` | Floating cloud SVG decorations |
| `.sparkle` | Star/sparkle decorative elements |
| `.topo-pattern` | Topography line pattern overlay |
| `.checker-corner` | Checkerboard corner accents |
| `.glass-sky` | Light glassmorphism (white bg, blur, light border) |
| `.bevel-sky` | Beveled corners with sky blue gradient border |
| `.shimmer-sky` | Shimmer sweep animation (light theme version) |
| `.card-sky` | Sky Fantasy card (white, rounded-20, light border) |

**Bevel Gradient Colors (change from dark to light):**
- Old: `from-white/10 to-white/5` → New: `from-sky/20 to-sky/10`
- Old: `from-cyan-300 to-blue-500` → New: `from-sky to-diamond`
- Old: `bg-slate-950` → New: `bg-white`

**Shimmer Light Adaptation:**
- Old: dark sweep → New: white/glow-blue sweep on hover

---

## Phase 2: Core UI Components

### 2.1 components/ui/button.tsx
| Variant | Before | After |
|---------|--------|-------|
| Primary | `bg-cyan-300 text-ink` | `bg-sky text-white hover:bg-diamond` |
| Destructive | `bg-red-500 text-white` | Same |
| Outline | `border border-white/10 bg-white/10` | `border-2 border-sky text-sky bg-white hover:bg-sky/5` |
| Secondary | `bg-white/10 text-white` | `bg-mist text-text-primary` |
| Ghost | `hover:bg-white/10` | `hover:bg-ice text-text-secondary` |
| Link | `text-cyan-200` | `text-sky underline` |
| Accent | `border-cyan-300/50 bg-cyan-300/15` | `border-sky/50 bg-sky/10 text-diamond` |

### 2.2 components/ui/card.tsx
- Before: `glass rounded-lg border border-white/10`
- After: `bg-white rounded-[20px] border border-card-border shadow-sky-soft`

### 2.3 components/ui/input.tsx
- Before: `bg-white/10 border-white/10 focus:border-cyan-300`
- After: `bg-white border-sky-border focus:border-sky focus:ring-sky/20`

### 2.4 components/ui/dialog.tsx
- Before: `bg-card border-white/10`
- After: `bg-white border-sky-border rounded-[24px] shadow-sky-medium`

### 2.5 components/ui/table.tsx
- Before: `border-white/5`, `hover:bg-white/5`
- After: `border-sky-border`, `hover:bg-ice`

### 2.6 components/ui/toast.tsx
- Update colors to light theme equivalents

### 2.7 components/ui/skeleton.tsx
- Before: `bg-white/5 animate-pulse`
- After: `bg-sky/10 animate-pulse`

### 2.8 components/ui/dropdown-menu.tsx
- Light theme styling with sky blue accents

### 2.9 components/ui/label.tsx
- Update text color to text-text-primary

### 2.10 components/ui/tabs.tsx
- Light theme active state with sky blue

---

## Phase 3: Layout Components

### 3.1 components/layout/header.tsx
**Major changes:**
- Height: 80px
- Background: Glassmorphism light (`bg-white/80 backdrop-blur-xl border border-sky-border rounded-[16px]`)
- Shadow: `shadow-sky-soft`
- Logo: Keep, but adapt colors
- Search bar: Light theme input
- Nav links: `text-text-secondary hover:text-sky`
- Login button: Primary sky blue

### 3.2 components/layout/footer.tsx
- Light background (`bg-mist`)
- Text: `text-text-secondary`
- Cloud decorations as SVG decorations
- Links: `text-text-secondary hover:text-sky`

---

## Phase 4: Feature Components

### 4.1 components/home/home-content.tsx
**Major refactor — largest component:**

| Section | Before | After |
|---------|--------|-------|
| Background | `mesh` fixed overlay | `sky-bg` with wallpaper + gradient |
| Hero Carousel | Dark overlay, cyan buttons | Light overlay, sky blue buttons |
| Flash Sale | `bg-gradient-to-r from-cyan-950/15` | White card, `border-sky-border rounded-[24px] shadow-sky-medium` |
| Popular Games | Bevel dark cards | White cards `rounded-[24px] border-card-border` |
| Catalog Tabs | Dark tabs | Light tabs with sky blue active state |
| Poster Cards | Dark overlay with clip-path | Light overlay, `rounded-[20px]` |
| Trust Panel | Dark glass | White glass with sky blue accents |

**Bevel gradient adaptation:**
- Before: `bg-gradient-to-r from-white/10 to-white/5`
- After: `bg-gradient-to-r from-sky/20 to-sky/10`

**Shimmer adaptation:**
- Before: dark sweep
- After: white/glow sweep

### 4.2 components/game/game-card.tsx
- Before: `bg-slate-950 border-white/10`
- After: `bg-white rounded-[20px] border-card-border shadow-sky-soft hover:shadow-sky-glow hover:scale-[1.03]`

### 4.3 components/game/game-detail-content.tsx
- Before: Dark with mesh, cyan accents
- After: Light with sky bg, sky blue accents

### 4.4 components/transaction/transaction-card.tsx
- Before: Dark glass cards
- After: White cards with sky blue status badges

---

## Phase 5: Pages

### 5.1 Pages with Full Sky Fantasy Theme
These pages currently use the dark gaming UI and need complete refactor:

| Page | Key Changes |
|------|-----------|
| `app/check/page.tsx` | Replace `bg-ink` with `sky-bg`, `text-white` → `text-text-primary`, `glass` → `glass-sky` |
| `app/dashboard/page.tsx` | Light theme stats, white cards, sky blue accents |
| `app/history/[invoiceId]/page.tsx` | Light invoice card, sky blue badges |
| `app/leaderboard/page.tsx` | Light podium, white cards |
| `app/calculator/page.tsx` | Light form, white result card |
| `app/admin/page.tsx` | Light admin dashboard |
| `app/auth/login/page.tsx` | Replace rotating game wallpapers with `wallpaper-bg.webp`, light glass card |
| `app/auth/register/page.tsx` | Same as login |

### 5.2 Pages with Standard shadcn Theme (already lighter)
These pages use standard shadcn components — update via component changes only:

| Page | Changes |
|------|---------|
| `app/games/page.tsx` | Auto-updated via component changes |
| `app/checkout/[id]/page.tsx` | Auto-updated via component changes |
| `app/history/page.tsx` | Auto-updated via component changes |
| `app/admin/games/page.tsx` | Auto-updated via component changes |
| `app/admin/products/page.tsx` | Auto-updated via component changes |
| `app/admin/transactions/page.tsx` | Auto-updated via component changes |

---

## Phase 6: app/layout.tsx

**Font Setup:**
```tsx
import { Montserrat, Poppins } from 'next/font/google'
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400','500','600','700','800'], variable: '--font-montserrat' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-poppins' })
```

**Background Layer:**
- Body class: `sky-bg`
- Remove dark mode toggle script
- Remove `.dark` class on `<html>`

---

## Implementation Order

```
1. tailwind.config.ts        ← New colors, fonts, shadows, radius
2. app/globals.css          ← New background system, CSS classes
3. app/layout.tsx           ← Font imports, remove dark mode
4. components/ui/*         ← Base UI components (10 files)
5. components/layout/*     ← Header + Footer
6. components/home/home-content.tsx  ← Homepage (largest)
7. components/game/*        ← Game components (3 files)
8. components/transaction/* ← Transaction components
9. Pages (auth first)      ← Login + Register
10. Pages (dashboard)      ← Dashboard, history, check, calculator, leaderboard
11. Pages (admin)         ← Admin pages
12. Pages (public)         ← Games, checkout
```

---

## Key Design Decisions

1. **Bevel corners**: DIPERTAHANKKAN — tapi gradient border diubah dari dark ke light theme
   - Before: `from-white/10 to-white/5`
   - After: `from-sky/20 to-sky/10`

2. **Shimmer**: DIPERTAHANKKAN — tapi warna diadaptasi ke light theme
   - Animation sweep dari dark → white/glow-blue

3. **Background**: Wallpaper `wallpaper-bg.webp` sebagai base, + gradient overlay + topographic pattern

4. **Glassmorphism**: Light version — `bg-white/80 backdrop-blur-xl border border-sky-border`

5. **Text colors**: `#1B3A57` (primary), `#53718E` (secondary), `#7F99B0` (muted)

6. **Primary button**: Sky Blue `#5CB8FF` dengan hover `#39AFFF`

7. **Shadows**: Soft blue glow — `rgba(92,184,255,.12)` - `.18` - `.35`

---

## Risk & Considerations

- **Large scope**: 30+ files — execute in phases, test after each phase
- **Bevel gradient consistency**: Need to replace ~50+ instances of dark gradient classes
- **Auth pages**: Currently use rotating game wallpapers — replace with `wallpaper-bg.webp`
- **Component dependencies**: Base UI changes cascade to all pages — test after Phase 4
- **Font loading**: Montserrat ExtraBold (800) + Poppins (400-600) — verify Google Fonts availability
- **Asset paths**: Verify `wallpaper-bg.webp` exists at `public/assets/app/`
