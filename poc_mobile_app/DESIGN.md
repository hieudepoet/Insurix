<!-- SEED: established with the user before implementation; re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: Insurix — Attestation Passport
description: Mobile-web PoC of instant parametric-insurance payouts, trust made visible as a stamped attestation passport instead of blockchain mechanics.
---

# Design System: Insurix — Attestation Passport

## Overview

**Creative North Star: "The Attestation Passport"**

Insurix's real mechanism — three independent machine checks replace a human adjuster — needs a trust object a mainstream insurance customer already understands. A passport is exactly that: an official document that only becomes valid once it has collected the right stamps from the right checkpoints, each stamp dated, sourced, and impossible to fake. This world borrows the visual grammar of a premium fintech-insurance mobile app (soft violet-gradient stage, white rounded cards, pill navigation — pinned by the user's reference) and gives it one signature moment nothing else in the system may touch: a warm gold/wax-seal accent reserved exclusively for the checkpoint stamps and the passport artifact they produce.

Direction was pinned by the user's reference image (a fintech insurance mobile app: lavender gradient backdrop, white card system, pill bottom nav, circular FAB, an ID-card/QR screen) — no concept-seed tournament was run; the visual world was committed directly, and the only original invention layered on top is the gold stamp/passport signature mechanism that carries the product's actual trust claim.

This app is a separate visual world from `frontend/` (the production Sui-connected client) by design — this is a pitch/demo surface with its own identity.

**Key Characteristics:**
- Ambient lavender-to-violet gradient stage behind a centered phone canvas (this is a mobile-web build wrapped in a literal phone frame, not a responsive site)
- Pure white cards, generous rounding, soft violet-tinted shadow — calm, premium, familiar fintech register
- One color law: gold/wax-seal amber appears *only* on attestation stamps and the passport artifact — never as decoration elsewhere
- Zero blockchain vocabulary anywhere in copy or iconography

## Colors

Restrained-plus-signature strategy: neutrals and one violet accent carry the whole app (Operate mode default), except the attestation moment, which is allowed a second, tightly law-bound accent because it *is* the product's proof, not decoration.

### Primary
- **Insurix Violet** (`#6C4CF1`): primary actions, active nav state, FAB, policy-card gradient, links. Used with intent, not wallpapered.
- **Deep Violet** (`#4A2FC7`): pressed/active states, gradient depth on hero cards.

### Secondary
- **Attestation Gold** (`#C9962E`): reserved exclusively for checkpoint stamps, the passport seal, and "verified" iconography. Never used for a generic CTA, badge, or decoration — its rarity is what makes a stamp read as official.

### Tertiary
- **Signal Rose** (`#E24C6B`): the single failure/rejection color — one named checkpoint's stamp turns this color when it fails, and the rejection screen's accent. Never used elsewhere, so its appearance always means "this failed."
- **Confirm Green** (`#1E9E6B`): success confirmations only (payout complete), used sparingly against the violet system, not as a general "success" wash.

### Neutral
- **Ink** (`#151321`): primary text.
- **Slate** (`#6B6880`): secondary/meta text (timestamps, helper copy) — tinted from Ink's hue, never plain gray.
- **Canvas** (`#FAF9FF`): phone-screen background, faint violet tint.
- **Card White** (`#FFFFFF`): card surfaces.
- **Hairline** (`#EDEAF7`): dividers, input borders at rest.

### Named Rules
**The One Seal Rule.** Attestation Gold and Signal Rose exist to mark verification state and nothing else. If a color is being used for a button, a chip, or a section background, it is not one of these two.

## Typography

**Display/Body Font:** Plus Jakarta Sans (with system-ui, sans-serif fallback)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace fallback) — used only for attestation hashes/IDs, nowhere else.

**Character:** Plus Jakarta Sans reads warm and geometric without tipping into the generic-SaaS-Inter default — rounded terminals suit a consumer insurance app; one family carries headings through data per product-UI convention. The mono face is a deliberate, narrow exception: it appears only where a real cryptographic-style identifier is being shown, so its presence itself signals "this is a verifiable record."

### Hierarchy
- **Display** (700, 2rem/1.15): payout amount, passport headline moments only.
- **Headline** (700, 1.375rem/1.25): screen titles ("File a Claim," "Attestation Passport").
- **Title** (600, 1.0625rem/1.3): card titles, policy names, checkpoint names.
- **Body** (500, 0.9375rem/1.45): primary UI copy, form labels, descriptions.
- **Label** (600, 0.75rem/1.3, tracking 0.02em): nav labels, chip text, status pills.
- **Mono Label** (500, 0.8125rem, IBM Plex Mono): attestation hash fragments, timestamps.

### Named Rules
**The Data-Is-Mono Rule.** Any string a real system would have cryptographically produced (attestation ID, hash fragment, block-style timestamp) renders in the mono face; everything a human wrote or chose renders in Plus Jakarta Sans. Never mix the two for the same value.

## Layout

Fixed phone canvas (390×844 logical px, iPhone-class viewport) centered in the browser viewport against the gradient stage; below ~480px browser width the phone canvas fills the viewport edge-to-edge (still phone-shaped, frame chrome drops). Content padding 20px horizontal inside the canvas. Card stack rhythm: 12px between related cards, 28px between sections, more space above a heading than below it. Bottom nav is fixed/pinned at the canvas floor, 64px tall, content scroll area accounts for its height plus safe-area.

## Elevation & Depth

Layered, not flat: cards lift off the Canvas background with a soft, colored (violet-tinted, never gray) diffuse shadow — the reference world's signature. The phone canvas itself lifts off the gradient stage with a heavier ambient shadow so it reads as an object sitting on the gradient, not a cropped screenshot.

### Shadow Vocabulary
- **card-rest** (`0 4px 16px rgba(108,76,241,0.10)`): default card elevation.
- **card-raised** (`0 12px 32px rgba(108,76,241,0.18)`): hero policy card, active/pressed states, modals.
- **phone-frame** (`0 40px 80px rgba(30,20,70,0.35)`): the phone canvas against the gradient stage.
- **seal-glow** (`0 0 0 6px rgba(201,150,46,0.12)`): the instant a stamp lands, a brief gold halo (motion-paired, not a static decoration).

## Shapes

Consistently soft: cards and the phone canvas both round at large radii (canvas ~44px matching real device corner radius; cards 20-24px). Buttons and chips are fully pill-shaped (radius 999px) except the primary FAB, which is a perfect circle. Inputs use a smaller 14px radius so form fields read as distinct from card containers. The attestation stamp is the one deliberate shape break: a circular seal with a scalloped/notched edge (like a wax seal or an official rubber stamp), the single moment the system allows a shape the rest of the app never uses.

## Components

### Buttons
- **Shape:** pill (999px radius), 52px height for primary actions.
- **Primary:** Insurix Violet fill, white text, `card-raised` shadow on press (translateY(-1px) + shadow grow), disabled state at 40% opacity with no shadow.
- **Secondary/Ghost:** Hairline border, Ink text, no fill; hover/active fills Canvas.
- **Destructive-adjacent (rare):** used only on the rejection screen's non-primary action ("File an Appeal"), Signal Rose text on ghost, never Rose fill.

### Chips
- **Style:** Canvas background at rest, Hairline border; selected state fills Violet at 12% opacity with Violet text and a 1.5px Violet border. Used for product-type pickers (Flight Delay / Heavy Rain) and quick filters.

### Cards / Containers
- **Corner Style:** 20-24px radius.
- **Background:** Card White, except the hero policy card which carries a Violet→Deep Violet diagonal gradient with white text.
- **Shadow Strategy:** `card-rest` at rest, `card-raised` for the hero/interactive state.
- **Border:** none at rest; hero card's gradient supplies its own edge definition.
- **Internal Padding:** 20px.

### Inputs / Fields
- **Style:** Card White fill, Hairline border (1.5px), 14px radius, 15px label above field.
- **Focus:** border shifts to Insurix Violet, no glow/ring — clean state change per product-UI conventions.
- **Error:** border shifts to Signal Rose, helper text below in Rose.

### Navigation
- **Style:** fixed pill-shaped bottom bar floating 12px off the canvas floor, Card White with `card-raised` shadow, 4 icon+label items (Home / Claims / Policies / Profile). Active item: icon+label in Insurix Violet with a small filled dot beneath; inactive: Slate.
- **FAB:** circular, Insurix Violet fill, centered-overlap on the nav bar, white plus icon, used for "File a Claim" from Home.

### Attestation Stamp (signature component)
The product's proof made physical. A circle (56px) with a scalloped rim, default state a faint dashed Hairline outline with a clock glyph (pending); on verification it animates a solid Attestation Gold fill sweeping in with a brief `seal-glow`, settling with a check glyph and the checkpoint name below in Label type; on failure the same motion resolves to Signal Rose with an alert glyph instead of gold. Three stamps in a row form a "checkpoint strip" reused on the processing screen, the outcome screens, and the passport detail screen — the same component, three different moments in its life.

## Do's and Don'ts

### Do:
- **Do** keep Attestation Gold and Signal Rose confined to verification state — if you reach for gold to make something feel "premium" decoratively, stop; that is the One Seal Rule breaking.
- **Do** render every attestation identifier (hash fragment, timestamp) in IBM Plex Mono, styled as a real verifiable record even though the data is mocked.
- **Do** let the checkpoint strip's motion carry real pacing information (roughly 900ms-1.4s per stamp, sequential, not simultaneous) — the sequence *is* the pitch.
- **Do** show the rejection flow with the same visual confidence as approval — two passed stamps in gold, one failed stamp in rose, named plainly.

### Don't:
- **Don't** write "Sui," "blockchain," "wallet," "on-chain," "transaction," "gas," or any chain-explorer link anywhere in this app's copy or UI.
- **Don't** use Attestation Gold or Signal Rose on any element that is not literally a verification state.
- **Don't** borrow `frontend/`'s dark/mesh visual system — this is a deliberately separate, distinct world.
- **Don't** invent a third product type or a fourth checkpoint; the real system has exactly two products and three checkpoints.
