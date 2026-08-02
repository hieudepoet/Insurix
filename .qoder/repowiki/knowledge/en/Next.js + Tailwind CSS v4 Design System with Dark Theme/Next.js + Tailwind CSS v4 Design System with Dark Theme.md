---
kind: frontend_style
name: Next.js + Tailwind CSS v4 Design System with Dark Theme
category: frontend_style
scope:
    - '**'
source_files:
    - frontend/src/app/globals.css
    - frontend/src/app/layout.tsx
    - frontend/postcss.config.mjs
    - frontend/package.json
---

The Insurix frontend uses a modern Next.js 16 application styled primarily with **Tailwind CSS v4** (via `@tailwindcss/postcss` plugin) and a custom dark theme defined through CSS variables. The styling approach combines utility-first CSS with a small set of semantic design tokens.

### Styling Stack
- **Framework**: Next.js 16 App Router with TypeScript
- **CSS Engine**: Tailwind CSS v4 with PostCSS (`@tailwindcss/postcss`)
- **Fonts**: Google Fonts via `next/font/google` — Geist Sans and Geist Mono, exposed as CSS custom properties (`--font-geist-sans`, `--font-geist-mono`)
- **Animation**: Framer Motion for component animations, GSAP for scroll-driven effects, Lenis for smooth scrolling
- **3D/Visuals**: Three.js with React Three Fiber and Drei for the landing page hero scenes
- **State/Data**: TanStack React Query for API/data fetching

### Design Tokens & Theme
All colors and fonts are centralized in `src/app/globals.css` using CSS custom properties under `:root`, then mapped into Tailwind's theme via the `@theme inline` directive:
- **Colors**: `--background` (#0a0e27), `--foreground` (#ffffff), `--primary` (#3b82f6 blue), `--accent` (#06b6d4 cyan), `--success` (#22c55e green), `--danger` (#ef4444 red), `--muted` (#6b7280 gray)
- **Typography**: Geist Sans as default sans, Geist Mono for code/mono contexts
- **Global utilities**: `.text-gradient` (blue-to-cyan gradient text), `.glow` (blue/cyan box-shadow glow), `.bg-grid` (subtle grid background pattern)

### Architecture & Conventions
- **Layout structure**: Root layout in `src/app/layout.tsx` sets up fonts, metadata, and base body styles; grouped layouts like `(landing)/layout.tsx` wrap shared chrome (Navigation, Footer, SmoothScroll)
- **Component organization**: UI components live under `src/app/(landing)/components/` for landing page sections and `src/components/` for shared primitives (WalletConnect, SmoothScroll)
- **Styling pattern**: Heavy use of Tailwind utility classes directly in JSX (`className="..."`) with consistent dark-mode color usage (`text-white`, `bg-white/[0.03]`, `border-white/10`, `text-gray-400`)
- **Responsive strategy**: Mobile-first responsive prefixes (`sm:`, `md:`) with flexible layouts using Flexbox and Grid
- **No CSS-in-JS or component libraries**: Pure Tailwind utilities plus minimal hand-written CSS in globals.css; no shadcn/ui, Material UI, or similar component library

### Key Files
- `src/app/globals.css` — global styles, design tokens, and utility classes
- `src/app/layout.tsx` — root layout with font setup and base body styles
- `postcss.config.mjs` — Tailwind v4 PostCSS configuration
- `package.json` — dependency declarations for Tailwind, Three.js, animation libraries