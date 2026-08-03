// Minimal single-stroke glyphs for the Policies hub's coverage-category
// browser. Kept in the same monochrome-gold visual language as ProductIcon
// rather than colorful emoji, so the browse row matches the rest of the app.
const PATHS: Record<string, string> = {
  health: "M12 20.5S4 15.8 4 9.9A4.1 4.1 0 0 1 12 7a4.1 4.1 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z",
  motor: "M5 16.5V11l1.8-4.2A2 2 0 0 1 8.6 5.5h6.8a2 2 0 0 1 1.8 1.3L19 11v5.5M5 16.5a1.5 1.5 0 0 0 1.5 1.5h1A1.5 1.5 0 0 0 9 16.5M5 16.5v1.3A1.2 1.2 0 0 0 6.2 19h.1M19 16.5a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5M19 16.5v1.3a1.2 1.2 0 0 1-1.2 1.2h-.1M5 11h14",
  home: "m4 11.5 8-7.5 8 7.5M6.5 10v9a1 1 0 0 0 1 1h3v-5.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1V20h3a1 1 0 0 0 1-1v-9",
  life: "M12 3.5 19 6v6c0 4.4-2.9 7.9-7 8.5-4.1-.6-7-4.1-7-8.5V6l7-2.5Z",
  gadget: "M8 3.5h8A1.5 1.5 0 0 1 17.5 5v14A1.5 1.5 0 0 1 16 20.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5ZM11 17.5h2",
  pet: "M8.2 6.6a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4ZM15.8 6.6a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4ZM5 11.4a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2ZM19 11.4a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2ZM12 12.2c2.6 0 4.6 1.8 4.6 3.9 0 1.6-1.4 2.4-2.9 2-1-.3-2.4-.3-3.4 0-1.5.4-2.9-.4-2.9-2 0-2.1 2-3.9 4.6-3.9Z",
  business: "M4.5 8.5h15A1 1 0 0 1 20.5 9.5v9A1 1 0 0 1 19.5 19.5h-15A1 1 0 0 1 3.5 18.5v-9A1 1 0 0 1 4.5 8.5ZM8.5 8.5V6.8A1.8 1.8 0 0 1 10.3 5h3.4a1.8 1.8 0 0 1 1.8 1.8v1.7",
};

export function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const d = PATHS[id];
  if (!d) return null;
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className={className}>
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
