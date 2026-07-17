"use client";

/**
 * ScrollReveal - Lightweight scroll-triggered reveal animation.
 * Uses a shared IntersectionObserver to minimize resource usage.
 */

import { useEffect, useRef, useState } from "react";

const observerMap = new Map();
let globalObserver = null;

function getSharedObserver() {
  if (typeof window === "undefined") return null;
  if (!globalObserver) {
    globalObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const callback = observerMap.get(entry.target);
          if (callback) callback(entry.isIntersecting);
        });
      },
      { threshold: 0.05 }
    );
  }
  return globalObserver;
}

export default function ScrollReveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }

    const observer = getSharedObserver();
    if (!observer) {
      setVisible(true);
      return;
    }

    const handleIntersect = (isIntersecting) => {
      if (isIntersecting) {
        setVisible(true);
        observerMap.delete(el);
        observer.unobserve(el);
      }
    };

    observerMap.set(el, handleIntersect);
    observer.observe(el);

    return () => {
      observerMap.delete(el);
      observer.unobserve(el);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-section ${visible ? "reveal-visible" : ""} ${className}`}
      style={{
        transitionDelay: visible ? `${delay}s` : "0s",
      }}
    >
      {children}
    </div>
  );
}
