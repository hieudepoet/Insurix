"use client";

import { useEffect, useRef, useState } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

// Renders a translucent gold "fingertip" instead of the system pointer
// while hovering the phone canvas, and a quick ripple burst on tap — so a
// desktop demo reads as a touch interaction instead of a mouse click.
// Only active on real-mouse viewing (pointer: fine); an actual touchscreen
// already has a finger and gets left alone.
export function TouchCursor() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const canvas = layerRef.current?.parentElement;
    if (!canvas) return;

    const move = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const enter = () => setVisible(true);
    const leave = () => setVisible(false);
    const down = (e: MouseEvent) => {
      setPressed(true);
      const rect = canvas.getBoundingClientRect();
      const id = ++rippleId.current;
      setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 500);
    };
    const up = () => setPressed(false);

    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseenter", enter);
    canvas.addEventListener("mouseleave", leave);
    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("mouseup", up);
    const prevCursor = canvas.style.cursor;
    canvas.style.cursor = "none";

    return () => {
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseenter", enter);
      canvas.removeEventListener("mouseleave", leave);
      canvas.removeEventListener("mousedown", down);
      canvas.removeEventListener("mouseup", up);
      canvas.style.cursor = prevCursor;
    };
  }, []);

  return (
    <div ref={layerRef} className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute rounded-full"
          style={{
            left: r.x,
            top: r.y,
            width: 34,
            height: 34,
            marginLeft: -17,
            marginTop: -17,
            border: "1.5px solid rgba(212,175,55,0.55)",
            animation: "touch-ripple 480ms ease-out forwards",
          }}
        />
      ))}
      {visible && (
        <div
          className="absolute rounded-full"
          style={{
            width: 34,
            height: 34,
            background: "rgba(212,175,55,0.25)",
            border: "1.5px solid rgba(212,175,55,0.6)",
            boxShadow: "0 0 12px rgba(212,175,55,0.35)",
            transform: `translate3d(${pos.x - 17}px, ${pos.y - 17}px, 0) scale(${pressed ? 0.7 : 1})`,
            transition: "transform 80ms ease-out",
          }}
        />
      )}
      <style>{`
        @keyframes touch-ripple {
          from {
            transform: scale(0.6);
            opacity: 0.55;
          }
          to {
            transform: scale(2.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
