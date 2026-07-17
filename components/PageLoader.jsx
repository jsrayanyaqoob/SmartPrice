"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function PageLoader() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      // Path changed — show loading briefly as a transition indicator
      setLoading(true);
      prevPath.current = pathname;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
      }, 500);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      <div
        className="page-loader-bar"
        style={{
          height: "100%",
          width: "40%",
          background: "var(--brand-gradient)",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}
