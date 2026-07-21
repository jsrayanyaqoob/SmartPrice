"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function PageLoader() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [fading, setFading] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      // Quick fade flash on route change
      setFading(true);
      prevPath.current = pathname;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setFading(false);
      }, 200);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  if (!fading) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        background: "var(--bg-app)",
        animation: "pageFadeIn 0.15s ease forwards",
      }}
    />
  );
}
