import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 overflow-hidden flex items-center justify-center p-6 max-[480px]:p-0"
      style={{
        background:
          "radial-gradient(120% 90% at 15% 0%, #8a6ff5 0%, #6c4cf1 32%, #3d2a8f 68%, #170f3d 100%)",
      }}
    >
      <div
        className="relative w-[390px] h-[844px] max-h-[92vh] max-[480px]:w-full max-[480px]:h-full max-[480px]:max-h-full rounded-[44px] max-[480px]:rounded-none bg-[var(--color-canvas)] overflow-hidden flex flex-col"
        style={{ boxShadow: "0 40px 80px rgba(30,20,70,0.35)" }}
      >
        <StatusBar />
        <main className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
