"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const slideshowImages = [
  {
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&h=750&auto=format&fit=crop",
    alt: "MacBook Pro on desk",
  },
  {
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&h=750&auto=format&fit=crop",
    alt: "Premium headphones",
  },
  {
    url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&h=750&auto=format&fit=crop",
    alt: "Smartphone",
  },
  {
    url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600&h=750&auto=format&fit=crop",
    alt: "Laptop and gadgets",
  },
];

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 4000);
  }, []);

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startInterval]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    startInterval();
  }, [startInterval]);

  return (
    <section className="hero-section" id="hero">
      {/* Animated Background Glow Orbs */}
      <div className="hero-orb hero-orb-1" style={{
        position: "absolute",
        top: "-15%",
        right: "-5%",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(107,51,246,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      <div className="hero-orb hero-orb-2" style={{
        position: "absolute",
        bottom: "-15%",
        left: "-5%",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      {/* Subtle grid pattern overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.02,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236b33f6' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Left Content */}
          <div className="animate-fade-up">
            <div className="section-label" style={{ marginBottom: 16 }}>AI-POWERED PRICE COMPARISON</div>
            <h1 className="heading-hero" style={{ marginBottom: 20 }}>
              Shop Smarter with{" "}
              <span style={{ color: "var(--primary)" }}>Artificial Intelligence.</span>
            </h1>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                marginBottom: 32,
                maxWidth: 480,
              }}
            >
              SmartPrice scans thousands of retailers in real-time to find you the absolute lowest
              price. Instant alerts, AI insights, and guaranteed savings.
            </p>

            {/* Search Bar */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 32,
                maxWidth: 460,
              }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-muted)"
                  strokeWidth="2"
                  style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search product, brand or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                  id="hero-search"
                  style={{
                    paddingLeft: 42,
                    height: 48,
                    borderRadius: "var(--radius-full)",
                    fontSize: 14,
                    border: "2px solid var(--border)",
                    boxShadow: searchQuery ? "0 0 0 3px rgba(107,51,246,0.1)" : "none",
                  }}
                />
              </div>
              <button className="btn btn-gradient btn-pill" style={{ height: 48, padding: "0 28px", fontSize: 15 }}>
                SEARCH
              </button>
            </div>

            {/* Featured On */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Featured on</span>
              {["TechCrunch", "Product Hunt", "Forbes"].map((name) => (
                <span
                  key={name}
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    letterSpacing: "-0.01em",
                    padding: "4px 12px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--bg-surface-2)",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Right - Rotating Image Gallery */}
          <div
            className="animate-fade-up animate-delay-200"
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div className="hero-slideshow" style={{ background: "linear-gradient(135deg, #ede9ff 0%, #ddd6fe 100%)" }}>
              {/* Slideshow images */}
              {slideshowImages.map((image, index) => (
                <div
                  key={index}
                  className="hero-slide"
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: index === currentSlide ? 1 : 0,
                    transition: "opacity 1s ease-in-out",
                    borderRadius: 24,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {/* Dark gradient overlay */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.15), transparent 40%)",
                  }} />
                </div>
              ))}

              {/* Slide indicators */}
              <div style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 8,
                zIndex: 10,
              }}>
                {slideshowImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    style={{
                      width: index === currentSlide ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      border: "none",
                      background: index === currentSlide ? "var(--primary)" : "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          position: relative;
          overflow: hidden;
        }
        .hero-orb {
          animation: heroOrbFloat 8s ease-in-out infinite alternate;
        }
        .hero-orb-1 {
          animation-delay: 0s;
        }
        .hero-orb-2 {
          animation-delay: -4s;
        }
        @keyframes heroOrbFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -20px) scale(1.1); }
        }
        .hero-slideshow {
          width: 100%;
          max-width: 420px;
          aspect-ratio: 4/5;
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(107, 51, 246, 0.15);
          transition: box-shadow 0.5s ease;
        }
        .hero-slideshow:hover {
          box-shadow: 0 24px 64px rgba(107, 51, 246, 0.25);
        }
        #hero-search:hover {
          border-color: var(--primary) !important;
        }
        @media (max-width: 1024px) {
          .hero-slideshow { max-width: 320px; }
        }
        @media (max-width: 768px) {
          .hero-section { padding: 40px 0 60px; }
          .hero-section > div > div { grid-template-columns: 1fr !important; }
          .hero-section > div > div > div:last-child { 
            margin-top: 0;
            padding: 0 40px;
          }
          .hero-slideshow { max-width: 280px; aspect-ratio: 3/4; }
          .heading-hero { font-size: clamp(28px, 8vw, 36px); }
          .hero-section > div > div { gap: 32px; }
        }
      `}</style>
    </section>
  );
}
