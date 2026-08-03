# Insurix UI Theme Prompts

Curated AI prompts and design references for generating a catchy, fintech-grade dark theme for a Web3 insurance application. Use these with Midjourney, DALL-E 3, Ideogram, or AI coding tools.

---

## 1. AI Image Generation Prompts (Midjourney v6 / DALL-E 3)

### 1A. Landing Page Hero — Premium Fintech Dark

```
/imagine prompt: A premium Web3 insurance app landing page hero section, dark obsidian background (#060818), deep navy surface cards (#0d1126), emerald green accent (#10b981), Space Grotesk typography, 3D animated abstract geometry floating in background with soft violet glow, bold headline "Parametric Insurance, Settled in Seconds", two CTA buttons (emerald primary, outline secondary), stats bar showing animated counters, supported chain icons row, minimalist layout, ultra-clean, cinematic lighting, 4K --ar 16:9 --v 6.0
```

### 1B. Claims Dashboard — Mobile Dark Fintech

```
/imagine prompt: A mobile app dashboard for a Web3 insurance claims platform, dark mode interface, deep obsidian background, emerald and amber status accents, glassmorphism-free solid surface cards with real depth shadows, featured pending claim card with large $500 amount in bold, three attestation progress bars filling emerald green, compact claim cards below with status badges, bottom navigation bar with SVG icons, spring physics micro-interactions, Space Grotesk font, premium fintech aesthetic, realistic smartphone mockup, ultra detailed, 4K --ar 9:16 --v 6.0
```

### 1C. Claim Detail — Settlement Success State

```
/imagine prompt: A mobile app screen showing an insurance claim settlement success state, dark obsidian background, large $500 amount in emerald green bold text, three attestation cards with green checkmarks and filled progress bars, emerald particle burst animation radiating from center, "Claim Settled" banner in bold, settlement confirmation card with transaction hash, sticky settle button at bottom in solid emerald, Space Grotesk typography, premium fintech UI, cinematic lighting, 4K --ar 9:16 --v 6.0
```

### 1D. New Claim Form — Premium Mobile Input

```
/imagine prompt: A mobile app form for creating an insurance claim, dark mode fintech aesthetic, obsidian background, segmented control for claim type (flight delay / weather), large $ prefix amount input in bold, clean rounded input fields with subtle borders, conditional fields sliding in, sticky emerald submit button at bottom, spring animation transitions, Space Grotesk font, minimalist layout, realistic smartphone mockup, ultra detailed, 4K --ar 9:16 --v 6.0
```

### 1E. Admin Panel — Premium Dashboard

```
/imagine prompt: A mobile admin dashboard for an insurance platform, dark mode, deep obsidian background, hero stat card showing total amount in large emerald text, 2x2 grid of smaller stat cards with colored icon circles (violet, amber, emerald, red), search bar, pill filter tabs, card-based claims list with status badges and attestation progress bars, premium fintech aesthetic, Space Grotesk typography, realistic smartphone mockup, 4K --ar 9:16 --v 6.0
```

### 1F. 3D Hero Scene — Abstract Blockchain Trust

```
/imagine prompt: An abstract 3D visualization for a blockchain insurance platform hero section, dark obsidian background, floating geometric shapes in emerald green and violet, soft particle effects, depth of field, post-processing bloom, glass-like translucent material, trust and security visual metaphor, Three.js style render, cinematic lighting, 4K --ar 16:9 --v 6.0
```

---

## 2. Vibe Coding Prompts (for AI coding tools)

### 2A. Complete Insurix Design System Prompt

```
Build a Web3 insurance claims app design system with:
- Font: Space Grotesk (300-700) + Geist Mono for IDs
- Background: #060818 (obsidian), surface: #0d1126 (deep navy)
- Success: #10b981 (emerald), pending: #f59e0b (amber), rejected: #ef4444 (red)
- Accent: #8b5cf6 (violet) — used sparingly
- NO gradient text — emphasis from weight/size
- NO decorative glassmorphism — only as functional effect (nav blur)
- NO colored border-left on cards
- Shadows: offset + blur (shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)])
- Typography: display text-4xl/5xl font-bold tracking-tight (-0.04em)
- Motion: spring physics (damping: 20, stiffness: 300)
- States: pending/attesting/ready_to_settle/settled/rejected
- Mobile-first: max-w-md, bottom nav, 44px touch targets, safe-area
```

### 2B. Claims Dashboard Component Prompt

```
Build a claims dashboard for a Web3 insurance app:
- Featured pending card: larger, amber glow shadow, $ amount in text-4xl font-bold
- Compact cards: bg-[#0d1126], shadow, type icon in colored circle, status badge
- Attestation progress: 3 animated bars (not dots), emerald when verified
- Staggered spring entrance (staggerChildren: 0.07)
- whileTap={{ scale: 0.97 }} on all cards
- Skeleton loading with shimmer
- Empty state with emoji + CTA arrow
- Polling: refetchInterval: 2000 for live status
- Dark theme, Tailwind CSS, Framer Motion, React Query
```

### 2C. Settlement Delight Moment Prompt

```
Build a settlement success animation for an insurance claim:
- When status changes to "settled":
  - 10 emerald particles burst radially from center (framer-motion)
  - Each particle: random angle, distance 80-120px, size 4-8px
  - "Claim Settled" in text-3xl font-bold
  - $ amount in text-4xl font-bold text-emerald-400
  - Full-width emerald banner slides in with spring
- When rejected: subdued red banner, no particles
- Spring physics (damping: 20, stiffness: 300)
- Progress bars animate from 0 to 100% width when verified
- "Live" indicator: pulsing emerald dot
```

---

## 3. Design References & Inspiration Sources

### Figma Community
- **Web3 Fintech App UI Design**: https://www.figma.com/community/file/1070375996067342133/web3-fintech-app-ui-design
  - Complete fintech Web3 app with dashboards, mockups, and presentations

### Dribbble
- **Fintech Dark**: https://dribbble.com/search/fintech-dark
  - Thousands of high-quality dark fintech UI shots
- **Web 3 UI Design**: https://dribbble.com/search/web-3-ui-design
  - Web3-specific UI patterns and inspiration

### Pinterest Boards
- **Dark Mode Fintech Design**: https://www.pinterest.com/ideas/dark-mode-fintech-design/955642004741/
- **Fintech Dashboard Dark Mode Patterns**: https://www.pinterest.com/ideas/fintech-dashboard-dark-mode-design-patterns/897152402694/
- **Dark Theme UI (blockchain wallet)**: https://www.pinterest.com/maryskies/dark-theme-ui/

### Articles & Guides
- **25 Best Fintech Website Designs 2026**: https://www.ballistic.media/blog/fintech-website-designs
  - Dark-mode dashboards, bold typography, high-converting layouts
- **Build Web3 dApp UI with AI**: https://0xminds.com/blog/guides/build-web3-dapp-ui-ai-prompts-guide
  - Comprehensive prompt guide for Web3 UI states, wallet flows, DeFi interfaces
- **8 Apple-Style Finance App UI Prompts**: https://theprompthome.com/apple-style-finance-app-ui-prompt/
  - Premium dark mode, glassmorphism, luxury banking aesthetics
- **UI Design with Midjourney**: https://uxplanet.org/ui-design-with-midjourney-df78eaa2d292
  - Prompt template for generating UI designs with AI

### Instagram / TikTok
- **Cointrix Web3 Landing Page**: https://www.instagram.com/reel/DNh-F7rx30D/
  - Premium dark UI for wealth management platform
- **Dark Mode Fintech App**: https://www.tiktok.com/@themobileapp_designer/photo/7626473874514808084
  - AI-generated dark mode fintech design

---

## 4. Color Palette Recommendations

### Current Insurix Palette (Premium Fintech)
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#060818` | Deep obsidian, not plain black |
| Surface | `#0d1126` | Elevated cards, nav bar |
| Border | `rgba(255,255,255,0.06)` | Subtle card borders |
| Text Primary | `#f8fafc` | Near-white headings |
| Text Secondary | `#94a3b8` | Slate-400 body text |
| Text Muted | `#64748b` | Slate-500 captions |
| Success | `#10b981` → `#34d399` | Emerald — verified, settled |
| Pending | `#f59e0b` → `#fbbf24` | Amber — waiting, processing |
| Rejected | `#ef4444` → `#f87171` | Red — failed, rejected |
| Accent | `#8b5cf6` | Violet — used sparingly |

### Alternative Palettes to Explore

**Option A: "Midnight Gold" (Luxury Banking)**
- Background: `#0a0a0f` (near-black with warm tint)
- Surface: `#1a1a2e`
- Accent: `#d4af37` (brushed gold) + `#c5a47e` (warm bronze)
- Success: `#22c55e` (green-500)
- Vibe: High-net-worth, premium wealth management

**Option B: "Electric Mint" (Crypto Native)**
- Background: `#0a0e14` (deep blue-black)
- Surface: `#131822`
- Accent: `#00ffa3` (electric mint) + `#7c3aed` (electric violet)
- Success: `#00ffa3`
- Vibe: Modern DeFi, high-energy, tech-forward

**Option C: "Trust Blue" (Corporate Fintech)**
- Background: `#0a1628` (deep navy)
- Surface: `#13243d`
- Accent: `#3b82f6` (blue-500) + `#06b6d4` (cyan-500)
- Success: `#10b981`
- Vibe: Institutional, regulated, trustworthy

**Option D: "Obsidian Ember" (Bold Insurance)**
- Background: `#0c0a0f` (warm obsidian)
- Surface: `#1c1923`
- Accent: `#f97316` (orange-500) + `#8b5cf6` (violet)
- Success: `#10b981`
- Vibe: Bold, energetic, attention-grabbing

---

## 5. Typography Pairings

### Current: Space Grotesk + Geist Mono
- Clean, geometric, modern
- Good for fintech + technical data
- Tracking: -0.04em for display

### Alternatives
| Font | Vibe | Use Case |
|------|------|----------|
| **Plus Jakarta Sans** | Premium, friendly, approachable | Consumer-facing insurance |
| **Satoshi** | Modern, geometric, versatile | Startup fintech |
| **Clash Display** | Bold, distinctive, editorial | Landing page hero |
| **Outfit** | Clean, geometric, Google Fonts | Budget-friendly alternative |
| **Inter** | Neutral, highly readable | Enterprise dashboards |
| **JetBrains Mono** | Technical, code-focused | Transaction IDs, hashes |

---

## 6. Animation Style Guide

### Micro-interactions
- **Card tap**: `whileTap={{ scale: 0.97 }}` spring
- **Card entrance**: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}` with stagger
- **Button press**: `whileTap={{ scale: 0.98 }}` spring
- **Form transitions**: `AnimatePresence` with spring layout

### Authored Moments
- **Settlement**: 10-particle emerald burst (the "wow" moment)
- **Attestation verification**: Progress bars fill from 0→100% with spring
- **Pending state**: Subtle pulse animation on amber elements
- **Live indicator**: Pulsing emerald dot

### Keyframe Libraries
- **Framer Motion**: Spring physics, AnimatePresence, layout animations
- **GSAP ScrollTrigger**: Landing page scroll-driven reveals
- **Lenis**: Buttery smooth scroll for landing page
- **Three.js + @react-three/fiber**: 3D hero scene

---

## 7. Prompt Customization Tips

### To change the brand mood
- Replace "emerald" with "gold" → luxury feel
- Replace "obsidian" with "midnight blue" → corporate feel
- Replace "spring physics" with "ease-out cubic" → smoother, calmer feel
- Add "neomorphic" → soft, tactile, extruded buttons

### To target specific audiences
- **Hackathon judges**: Emphasize "3D animated hero", "particle burst", "real-time attestation progress"
- **Investors**: Emphasize "premium", "institutional", "trust", "auditability"
- **Consumers**: Emphasize "friendly", "approachable", "simple", "no wallet needed"

### To generate variations
- Run the same prompt 4 times with different accent colors
- Swap "mobile app" for "web dashboard" for desktop views
- Add "neumorphic" or "glassmorphism" or "flat design" to change the visual language
