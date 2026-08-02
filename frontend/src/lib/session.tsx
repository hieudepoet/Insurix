"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface Session {
  userId: string;
  address: string; // mock Sui address
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let userId = localStorage.getItem("insurix_user_id");
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem("insurix_user_id", userId);
    }
    // Derive a stable mock 64-hex address from the userId hash.
    const hash = userId.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
    let h = Math.abs(hash);
    let stableAddr = "0x";
    for (let i = 0; i < 64; i++) {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      stableAddr += ((h >> 4) & 0xf).toString(16);
    }
    setSession({ userId, address: stableAddr });
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
  );
}

export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
