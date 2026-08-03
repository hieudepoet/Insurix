"use client";

import { useEffect, useState } from "react";

// Reveals `text` one word at a time. Keyed by the text itself so switching
// to a different checkpoint's narrative restarts the reveal from scratch.
export function TypewriterText({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    const id = setInterval(() => {
      setCount((c) => {
        if (c + 1 >= words.length) {
          clearInterval(id);
          return words.length;
        }
        return c + 1;
      });
    }, 55);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <p className={className}>{words.slice(0, count).join(" ")}</p>;
}
