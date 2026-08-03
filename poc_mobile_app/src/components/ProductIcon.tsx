import type { ProductType } from "@/data/mock";

// Single icon system for both product types, shared by every screen that
// represents a policy or claim (Home, Claims list, Policies). Uses
// currentColor so the wrapping element's text color always tints it —
// unlike an emoji glyph, which silently ignores CSS color.
export function ProductIcon({
  product,
  className = "",
}: {
  product: ProductType;
  className?: string;
}) {
  return product === "flight-delay" ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="m3 12 7-2 4-7 2 1-2.5 6.5L21 9l1 2-7.5 3.5L13 21l-2-1 1-6-6 2-2-2 4-2.5L3 12Z"
        fill="currentColor"
      />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 13a4.5 4.5 0 0 1 .3-9c1-2.3 3.3-3.8 6-3.4 3 .4 5.2 3 5.2 6a4.8 4.8 0 0 1-1 9.4H7Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M8 17.5 6.5 20M12.5 17.5 11 20M17 17.5 15.5 20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
