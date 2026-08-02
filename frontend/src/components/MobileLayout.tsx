"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/claims", icon: "📋", label: "Claims" },
  { href: "/claims/new", icon: "➕", label: "New" },
  { href: "/admin", icon: "🛡️", label: "Admin" },
];

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              Insurix
            </span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold">
            U
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto px-4 py-4 pb-20 min-h-[calc(100vh-3.5rem)]">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/claims/new" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  active ? "text-cyan-400" : "text-white/40"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
