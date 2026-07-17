"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <section style={{ padding: "80px 0", background: "white" }} id="newsletter">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            background: "var(--brand-gradient)",
            borderRadius: 24,
            padding: "56px 48px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }} />
          <div style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 48,
              alignItems: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Left text */}
            <div style={{ color: "white" }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                opacity: 0.8,
                marginBottom: 8,
              }}>
                STAY AHEAD
              </div>
              <h2 style={{
                fontSize: "clamp(22px, 2.5vw, 30px)",
                fontWeight: 700,
                margin: "0 0 12px",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}>
                Never Miss a Price Drop Again
              </h2>
              <p style={{
                fontSize: 14,
                opacity: 0.85,
                lineHeight: 1.7,
                margin: 0,
                maxWidth: 400,
              }}>
                Join 50,000+ savvy shoppers who get exclusive deals, price drop alerts, and AI insights delivered to their inbox every week.
              </p>
            </div>

            {/* Right form */}
            <div>
              {subscribed ? (
                <div style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 14,
                  padding: "24px 28px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backdropFilter: "blur(8px)",
                }}>
                  <span style={{ fontSize: 24 }}>🎉</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "white" }}>You&apos;re in!</div>
                    <div style={{ fontSize: 13, opacity: 0.8, color: "white" }}>Check your inbox for your first deal alert.</div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="2"
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 4L12 13 2 4" />
                    </svg>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        height: 50,
                        paddingLeft: 42,
                        borderRadius: "var(--radius-full)",
                        border: "2px solid rgba(255,255,255,0.2)",
                        background: "rgba(255,255,255,0.12)",
                        color: "white",
                        fontSize: 14,
                        fontFamily: "inherit",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "rgba(255,255,255,0.5)"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.2)"}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      height: 50,
                      padding: "0 28px",
                      borderRadius: "var(--radius-full)",
                      border: "none",
                      background: "white",
                      color: "var(--primary)",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    Subscribe
                  </button>
                </form>
              )}
              <p style={{
                fontSize: 11,
                opacity: 0.6,
                color: "white",
                marginTop: 10,
                marginBottom: 0,
              }}>
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #newsletter > div > div > div { grid-template-columns: 1fr !important; }
          #newsletter > div > div { padding: 36px 24px !important; }
          #newsletter form { flex-direction: column !important; }
        }
      `}</style>
    </section>
  );
}
