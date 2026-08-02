"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/MobileLayout";

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
      <div className="min-h-screen bg-[#060818] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  // ---- Auth gate: no API key ----
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-[#060818] flex items-center justify-center px-5">
        <div className="w-full max-w-md">
          <div className="bg-[#0d1126] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#f8fafc]">Admin Access</h1>
                <p className="text-sm text-slate-400">Insurix Control Panel</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Enter admin API key"
                  className="w-full px-4 h-14 rounded-xl bg-[#060818] border border-white/5 text-[#f8fafc] placeholder-slate-500 focus:outline-none focus:border-emerald-500/30 transition"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition"
              >
                Access Dashboard
              </button>
            </form>

            <p className="mt-4 text-xs text-slate-500 text-center">
              Your API key is stored locally in your browser only.
            </p>
          </div>

          <p className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-[#f8fafc] transition"
            >
              ← Back to site
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ---- Authenticated layout ----
  return (
    <MobileLayout>
      {/* Admin header with logout */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-[#f8fafc]">
            Insurix <span className="text-emerald-400">Admin</span>
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-400 hover:text-red-400 transition"
        >
          Logout
        </button>
      </div>

      {children}
    </MobileLayout>
  );
}
