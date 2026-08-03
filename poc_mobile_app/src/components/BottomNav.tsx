"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/claims", label: "Claims", icon: ClaimsIcon },
  { href: "/policies", label: "Policies", icon: PoliciesIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const hideChrome = pathname.startsWith("/claims/new") || pathname.includes("/processing");

  if (hideChrome) return null;

  return (
    <div className="shrink-0 relative px-5 pb-6 pt-1">
      <nav
        className="relative flex items-center justify-between rounded-full bg-[var(--color-card)] px-3 h-16"
        style={{ boxShadow: "0 12px 32px rgba(108,76,241,0.18)" }}
      >
        {ITEMS.slice(0, 2).map((item) => (
          <NavItem key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}

        <div className="w-14 shrink-0" />

        {ITEMS.slice(2).map((item) => (
          <NavItem key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <button
        aria-label="File a claim"
        onClick={() => router.push("/claims/new")}
        className="absolute left-1/2 -translate-x-1/2 -top-4 w-16 h-16 rounded-full bg-[var(--color-violet)] text-white flex items-center justify-center active:scale-95 transition-transform"
        style={{ boxShadow: "0 12px 28px rgba(108,76,241,0.45)" }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function NavItem({
  item,
  active,
}: {
  item: (typeof ITEMS)[number];
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="flex flex-col items-center justify-center gap-1 w-14 h-full"
    >
      <Icon
        className={active ? "text-[var(--color-violet)]" : "text-[var(--color-slate)]"}
      />
      <span
        className={`text-[10px] font-semibold tracking-wide ${
          active ? "text-[var(--color-violet)]" : "text-[var(--color-slate)]"
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3a1 1 0 0 0 1-1v-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClaimsIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 3h10a1 1 0 0 1 1 1v16.2a.8.8 0 0 1-1.24.67L14 19l-2 1.5L10 19l-2.76 1.87A.8.8 0 0 1 6 20.2V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 8h6M9 11.5h6M9 15h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PoliciesIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3.5 19 6v6c0 4.4-2.9 7.9-7 8.5-4.1-.6-7-4.1-7-8.5V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8.2" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 20c.9-3.5 3.8-5.5 7-5.5s6.1 2 7 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
