"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const STORAGE_KEY = "insurix_admin_key";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setApiKey(localStorage.getItem(STORAGE_KEY) || "");
    setMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const key = inputKey.trim();
    if (!key) return;
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
    setInputKey("");
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey("");
    router.push("/admin");
  };

  // Avoid hydration mismatch — localStorage is not available during SSR
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  // ---- Auth gate: no API key ----
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] bg-grid flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Access</h1>
                <p className="text-sm text-gray-400">Insurix Control Panel</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Enter admin API key"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:opacity-90 transition"
              >
                Access Dashboard
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Your API key is stored locally in your browser only.
            </p>
          </div>

          <p className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              ← Back to site
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ---- Authenticated layout ----
  const navItems = [{ href: "/admin", label: "Dashboard" }];

  return (
    <div className="min-h-screen bg-[#0a0a0f] bg-grid">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">
              Insurix <span className="text-orange-400">Admin</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition ${
                  pathname === item.href
                    ? "text-orange-400"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-400 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
