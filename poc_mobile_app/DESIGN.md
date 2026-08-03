---
name: Insurix — Attestation Passport
description: Mobile-web PoC of instant parametric-insurance payouts — a vault of falling gold light, glass panels, and stamped attestation proof.
colors:
  gold: "#d4af37"
  gold-soft: "#c5a47e"
  rose: "#f2617a"
  green: "#34d399"
  ink: "#f4f2fa"
  slate: "#a39dc4"
  canvas: "#0a0a0f"
  card: "#1a1a2e"
  hairline: "rgba(255,255,255,0.08)"
typography:
  headline:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.02em"
  mono-label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
rounded:
  input: "14px"
  card: "22px"
  pill: "999px"
spacing:
  card-padding: "20px"
  section-gap: "28px"
  related-gap: "12px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "#151020"
    rounded: "{rounded.pill}"
    height: "52px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "52px"
  card:
    backgroundColor: "rgba(19,19,32,0.88)"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
---

# Design System: Insurix — Attestation Passport

## Overview

**Creative North Star: "Gold Falling in a Vault"**

Second revision of this world. The first pass ("Midnight Gold") went dark-obsidian-plus-gold but kept the scarcity discipline of the earlier light world — gold reserved only for attestation stamps, violet still carrying every button and nav state, a flat gradient on the hero card. Direct user feedback rejected that: *"still violet and blue, where is the gold... stop using gradient."* This revision answers literally: gold is now the app's only brand color — every button, the FAB, active nav, links, stat highlights — and violet/blue are gone entirely. The flat gradient is replaced by an actual moving material: reactbits.dev's **Lightfall** WebGL shader (github.com/DavidHDev/react-bits, MIT), retinted gold/bronze, rendered full-bleed behind every screen — gold light literally falling through the vault. Every card is glass (translucent, blurred, bordered) rather than a flat fill, so the falling light reads through the whole app, not just as a background wash.

**Why gold can carry everything now, not just verification:** with violet gone, gold no longer needs the previous world's "One Seal Rule" scarcity to feel earned — gold's meaning shifted from "this one thing is the trust marker" to "this is Insurix's identity," and the attestation stamps are still its most concentrated, most animated expression. The distinction that survives: the **checking/in-progress** state uses dim bronze (`gold-soft`), full bright gold means **verified/complete** — one hue family narrating the whole trust journey instead of a second color.

**Material change from v2:** Cards were flat `#1a1a2e` with a hairline border. They are now translucent (`rgba(19,19,32,0.88)`) with `backdrop-blur-2xl` and the same hairline border — glass, not paint. The opacity had to land at 0.88, not the more dramatic 0.55 first tried: at 0.55 the Lightfall streaks bled straight through body text and made the processing screen's narrative copy unreadable. High-opacity glass with blur still reads as a distinct material (soft edge-glow, faint color bleed at the border) without sacrificing legibility — contrast now wins over transparency wherever real copy sits on the surface; the more transparent read is left to the gaps between cards, where the light show is uncontested.

**Key Characteristics:**
- Lightfall (gold/bronze streaks, slow, ambient) renders full-bleed behind every screen — this is the app's signature motion, always present, never just a launch animation
- Every surface is glass: `rgba(19,19,32,0.88)` + `backdrop-blur-2xl` + hairline border — never a flat opaque fill, never the old pastel drop-shadow
- Gold is the entire brand palette: buttons, FAB, active nav, links, stat numbers, and the attestation stamps all share one hue, with bronze (`gold-soft`) as its dimmer "in progress" sibling
- Rose (failure) and green (settled-amount emphasis) remain the only other meaningful colors; ink/slate are neutral text
- No gradients anywhere — replaced by the WebGL shader for atmosphere and glass/blur for card material

## Colors

### Primary
- **Gold** (`#d4af37`): the entire brand identity now — primary button fill (with near-black `#151020` text for contrast, not white), FAB, active nav icon/label, links, stat-tile numbers, verified attestation stamps, chip-selected state.
- **Bronze / Gold Soft** (`#c5a47e`): the dimmer sibling — the "checking" in-progress spinner and label, so a claim's journey reads as bronze-deepening-to-gold rather than switching hues.

### Tertiary
- **Signal Rose** (`#f2617a`): the single failure/rejection color — a failed checkpoint's stamp, the rejection screen's icon/headline, the "File an Appeal" ghost button text. Never used elsewhere.
- **Confirm Green** (`#34d399`): the settled checkmark and its icon background only.

### Neutral
- **Ink** (`#f4f2fa`), **Slate** (`#a39dc4`), **Canvas** (`#0a0a0f`), **Card/Glass base** (`rgba(19,19,32,0.88)`), **Hairline** (`rgba(255,255,255,0.08)`) — unchanged in hue from v2, only the card's alpha changed (see Elevation).

### Named Rules
**The Gold-Bronze Journey Rule.** A checkpoint is dim bronze while running, bright gold once verified. Never introduce a second hue to distinguish "in progress" from "done" — the journey is one color deepening, not a palette switch.
**The Glass-Not-Paint Rule.** Every container is translucent + blurred + hairline-bordered. A flat opaque fill on a card is v1/v2 habit reasserting itself.

## Typography

Unchanged from v2: Space Grotesk (body/display), IBM Plex Mono (attestation IDs only). See hierarchy in the frontmatter above.

## Layout

Unchanged: fixed 390×844 phone canvas, edge-to-edge below ~480px, 20px horizontal content padding.

## Elevation & Depth

This is where v3 diverges most from v2. v2 used opaque cards (`#1a1a2e`) with a plain dark drop shadow. v3 makes every card **actual glass**: `background: rgba(19,19,32,0.88)`, `backdrop-filter: blur(24px) saturate(1.5)`, `border: 1px solid rgba(255,255,255,0.08)`. The Lightfall canvas sits behind everything at `z-0`; all screen content sits at `z-10`. Depth reads as: the light shows clearly in the gaps between cards and faintly through card edges, while card interiors stay legible because the base alpha is high enough (0.88) to guarantee text contrast regardless of what's moving behind it.

### Shadow Vocabulary
- **card-rest** (`0 4px 20px rgba(0,0,0,0.45)`): default glass card.
- **card-raised** (`0 16px 40px rgba(0,0,0,0.55)`): hero/interactive cards.
- **gold-glow** (`0 10px 28px rgba(212,175,55,0.35-0.4)`): primary button/FAB — replaces the v2 violet-glow with the same technique, gold hue.
- **seal-glow** (`rgba(212,175,55,0.4)` gold / `rgba(242,97,122,0.35)` rose): unchanged mechanism from v1/v2 — the stamp-landing halo.

### Named Rules
**The High-Alpha Glass Rule.** Glass opacity is tuned for legibility first: 0.88, not a more "dramatic" lower value. A translucent card that fails a contrast check against moving background content is a broken material, not an aesthetic choice.

## Shapes

Unchanged: large rounded corners (canvas ~44px, cards 20-24px), pill buttons/chips, circular FAB, scalloped wax-seal stamp as the one shape break.

## Components

### Buttons
- **Primary:** Gold fill, `#151020` text (near-black, for contrast against a light warm fill — white-on-gold was tried and rejected for contrast), `gold-glow` shadow.
- **Ghost:** hairline border, ink text (or rose text for the destructive-adjacent "File an Appeal"), hover fills `rgba(255,255,255,0.06-0.09)`.
- **Chip:** unselected `rgba(255,255,255,0.04)` + hairline; selected `rgba(212,175,55,0.16)` + gold border/text.

### Cards
All cards use the shared `GLASS` class (see Elevation). No component in the app uses a flat opaque fill anymore.

### Navigation
Glass pill bar (was opaque `--color-card`), gold active state (was violet), gold FAB with `gold-glow`.

### Attestation Stamp (signature component, mechanism unchanged since v1)
Scalloped wax-seal circle. Pending: dashed hairline outline, clock glyph. Checking: bronze (`gold-soft`) spinning ring. Verified: gold fill sweep + `seal-glow` + checkmark. Failed: rose fill + `seal-glow` + X. The only change from v2 is the checking-state color (was violet, now bronze) — removing the last non-gold hue from the trust journey.

### Verification Stack (new signature interaction, v3)
The processing screen replaced v2's fixed vertical checklist with a horizontal snap-scrolling stack, one full slide per checkpoint. Auto-advances via `scrollIntoView` as each checkpoint starts/resolves, but remains manually swipeable — a user can read ahead to a not-yet-run checkpoint's narrative, or look back at a completed one. Each slide carries: the stamp (large), a state label, and a glass narrative card with **three tiers of copy**: (1) a technical paragraph explaining what this checkpoint actually verifies and why it can't be gamed — present always, even before the checkpoint runs; (2) on verified, the attestation ID in mono; (3) on failed, the specific failure reason in rose bold plus a "What to do next" remediation paragraph (appeal process, what not to do). A compact `CheckpointStrip` overview + progress dots sit above the stack so overall status is visible without scrolling through all three slides.

## Do's and Don'ts

### Do:
- **Do** keep every card at the 0.88-alpha glass recipe — never drop opacity further "for drama" without re-checking text contrast against the moving Lightfall background.
- **Do** use bronze for "in progress" and gold for "verified" — one hue, two depths, never a second color for state.
- **Do** let the verification stack's narrative copy carry real information (what/why/what-to-do-next), not filler — it replaced a plain list specifically to add this.
- **Do** keep rose and green confined to their one meaning each (failure; settled-amount emphasis).

### Don't:
- **Don't** reintroduce violet, blue, or any second brand hue — this was direct, explicit user correction against v2.
- **Don't** use a flat gradient anywhere — the Lightfall shader and glass material are the replacement technique, not a stylistic option to fall back to under time pressure.
- **Don't** drop card background alpha below ~0.85 without testing real copy against the busiest part of the Lightfall animation.
- **Don't** write "Sui," "blockchain," "wallet," "on-chain," "transaction," or "gas" anywhere in this app's copy or UI — unchanged hard constraint from the product brief, carried through both redesigns.
