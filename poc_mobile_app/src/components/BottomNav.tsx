"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GLASS } from "@/components/ui";

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
    <div className="shrink-0 relative px-4 pb-4 pt-1">
      <nav
        className={`relative flex items-center justify-between rounded-full ${GLASS} px-2.5 h-[52px]`}
        style={{ boxShadow: "0 16px 40px rgba(0,0,0,0.55)" }}
      >
        {ITEMS.slice(0, 2).map((item) => (
          <NavItem key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}

        <div className="w-12 shrink-0" />

        {ITEMS.slice(2).map((item) => (
          <NavItem key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <button
        aria-label="File a claim"
        onClick={() => router.push("/claims/new")}
        className="absolute left-1/2 -translate-x-1/2 -top-3 rounded-full bg-[var(--color-gold)] text-[#151020] flex items-center justify-center active:scale-95 transition-transform"
        style={{ boxShadow: "0 10px 24px rgba(212,175,55,0.4)", width: 52, height: 52 }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
      className="flex flex-col items-center justify-center gap-0.5 w-12 h-full"
    >
      <Icon
        className={active ? "text-[var(--color-gold)]" : "text-[var(--color-slate)]"}
      />
      <span
        className={`text-[9px] font-semibold tracking-wide ${
          active ? "text-[var(--color-gold)]" : "text-[var(--color-slate)]"
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className}>
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
