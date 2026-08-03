"use client";

import { motion } from "framer-motion";

// The one authored delight moment on the settled screen: a burst of gold
// particles radiating from the checkmark the instant the passport completes.
// Gold-only (not the doc's emerald) so the burst stays inside the One Seal
// Rule — it reads as "the seal is complete," not decoration.
const PARTICLES = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2 + (i % 2 === 0 ? 0.15 : -0.1);
  const distance = 70 + (i % 3) * 18;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 4 + (i % 3) * 1.5,
    delay: i * 0.02,
  };
});

export function GoldBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: i % 3 === 0 ? "var(--color-gold-soft)" : "var(--color-gold)",
          }}
          initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.75, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
