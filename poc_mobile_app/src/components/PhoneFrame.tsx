import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { LightfallBackground } from "@/components/LightfallBackground";
import { AudioUnlocker } from "@/components/AudioUnlocker";
import { TouchCursor } from "@/components/TouchCursor";

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 overflow-hidden flex items-center justify-center p-6 max-[480px]:p-0"
      style={{ background: "#050307" }}
    >
      <AudioUnlocker />
      <div
        className="relative w-[390px] h-[844px] max-h-[92vh] max-[480px]:w-full max-[480px]:h-full max-[480px]:max-h-full rounded-[44px] max-[480px]:rounded-none bg-[var(--color-canvas)] overflow-hidden flex flex-col"
        style={{
          boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="absolute inset-0 z-0">
          <LightfallBackground />
        </div>
        <div className="relative z-10 flex flex-col h-full min-h-0">
          <StatusBar />
          <main className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
            {children}
          </main>
          <BottomNav />
        </div>
        <TouchCursor />
      </div>
    </div>
  );
}
