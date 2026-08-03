export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-7 pt-4 pb-1 text-[var(--color-ink)] shrink-0 select-none">
      <span className="text-[15px] font-bold tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5">
        {/* signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="7" width="3" height="5" rx="0.8" fill="currentColor" />
          <rect x="5" y="5" width="3" height="7" rx="0.8" fill="currentColor" />
          <rect x="10" y="3" width="3" height="9" rx="0.8" fill="currentColor" />
          <rect x="15" y="0" width="3" height="12" rx="0.8" fill="currentColor" />
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path
            d="M8 10.2c.66 0 1.2.54 1.2 1.2S8.66 12.6 8 12.6 6.8 12.06 6.8 11.4 7.34 10.2 8 10.2Zm0-3.3c1.4 0 2.7.53 3.68 1.4l-1.13 1.28A3.9 3.9 0 0 0 8 8.6c-.98 0-1.87.34-2.55.98L4.32 8.3A5.87 5.87 0 0 1 8 6.9Zm0-3.3c2.24 0 4.3.82 5.88 2.18l-1.13 1.28A6.87 6.87 0 0 0 8 5.6a6.87 6.87 0 0 0-4.75 1.86L2.12 5.78A8.85 8.85 0 0 1 8 3.6Z"
            fill="currentColor"
          />
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="20"
            height="11"
            rx="2.5"
            stroke="currentColor"
            opacity="0.4"
          />
          <rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor" />
          <rect x="22" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
