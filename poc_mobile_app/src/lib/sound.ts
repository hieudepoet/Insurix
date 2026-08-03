"use client";

// Tiny synthesized sound design for the verification flow — no audio
// assets, everything is generated via the Web Audio API so there's nothing
// to source/license. Kept deliberately subtle (low gain, short durations).

let ctx: AudioContext | null = null;

export function ensureAudioUnlocked() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
}

function tone(
  freq: number,
  startOffset: number,
  duration: number,
  opts: { type?: OscillatorType; gain?: number; sweepTo?: number } = {},
) {
  if (!ctx) return;
  const { type = "sine", gain = 0.05, sweepTo } = opts;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  const t0 = ctx.currentTime + startOffset;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + duration);
  gainNode.gain.setValueAtTime(0, t0);
  gainNode.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.03);
}

/** Soft, neutral blip when a checkpoint starts running. */
export function playTick() {
  tone(720, 0, 0.09, { type: "sine", gain: 0.045 });
}

/** Bright two-note rise when a checkpoint verifies. */
export function playVerifiedChime() {
  tone(660, 0, 0.14, { gain: 0.06 });
  tone(880, 0.11, 0.18, { gain: 0.065 });
}

/** Low descending tone when a checkpoint fails. */
export function playFailedTone() {
  tone(340, 0, 0.3, { type: "sine", gain: 0.06, sweepTo: 170 });
}

/** Three-note ascending flourish on final settlement. */
export function playSettleFlourish() {
  tone(660, 0, 0.14, { gain: 0.06 });
  tone(880, 0.13, 0.15, { gain: 0.065 });
  tone(1100, 0.27, 0.24, { gain: 0.07 });
}

/** Single somber tone on final rejection. */
export function playRejectTone() {
  tone(280, 0, 0.38, { type: "sine", gain: 0.055, sweepTo: 150 });
}
