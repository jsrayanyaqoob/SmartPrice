"use client";

import { useState, useRef, useLayoutEffect, useCallback, useEffect, useMemo } from "react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "basics", label: "Getting Started" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing & Plans" },
  { id: "technical", label: "Technical" },
];

const faqs = [
  {
    q: "How does SmartPrice find the best prices?",
    a: "Our AI scans over 50,000 retailers every 60 seconds, comparing prices across Amazon, Walmart, Best Buy, eBay, and thousands more. We analyze real-time data to find you the absolute lowest price available — often before anyone else catches the deal.",
    category: "basics",
  },
  {
    q: "Is SmartPrice really free to use?",
    a: "Yes! Our Free plan gives you price comparison across 10+ stores, basic price-drop alerts, and 7-day price history — no credit card required. Upgrade to Pro for unlimited alerts, AI-powered price predictions, 30-day history, and priority support.",
    category: "pricing",
  },
  {
    q: "How accurate are the AI price predictions?",
    a: "Our predictive models analyze historical price patterns, seasonal trends, and market data to forecast price drops with over 90% accuracy. We tell you whether to buy now or wait for a better deal — saving our users an average of 23% on tracked products.",
    category: "features",
  },
  {
    q: "Can I track prices from any online store?",
    a: "SmartPrice supports 50,000+ retailers out of the box, including Amazon, Walmart, Best Buy, eBay, Target, and thousands more. If a store isn't listed, you can paste any product URL and our AI will start tracking it within minutes — literally.",
    category: "technical",
  },
  {
    q: "How do price alerts work?",
    a: "Set your target price for any product. When the price drops to your threshold, we'll notify you instantly via email, SMS, or push notification. Pro users get unlimited alerts with real-time notifications and optional email digests.",
    category: "features",
  },
  {
    q: "Can I cancel my Pro subscription anytime?",
    a: "Absolutely. No contracts, no hidden fees, no hassle. You can upgrade, downgrade, or cancel anytime from your account settings. Plus, we offer a 30-day money-back guarantee — if you're not satisfied, we'll refund every penny, no questions asked.",
    category: "pricing",
  },
  {
    q: "How do you compare to other price trackers?",
    a: "Unlike basic trackers, SmartPrice uses machine learning to predict price drops before they happen. We cover 10x more retailers, offer real-time alerts, and provide actionable insights like 'Buy Now' vs 'Wait' recommendations — all in a beautiful, easy-to-use interface.",
    category: "basics",
  },
  {
    q: "What happens if a store blocks price scraping?",
    a: "Our AI uses smart rotation, respect robots.txt, and have partnerships with major retailers. In the rare event a store restricts access, our system automatically routes through alternative data sources to ensure you never miss a price change.",
    category: "technical",
  },
];

/* -------------------------------------------------------------------------- */
/*  Accordion Item with auto-height animation                                 */
/* -------------------------------------------------------------------------- */

function AccordionItem({ faq, isOpen, onToggle, index }) {
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const triggerId = `faq-trigger-${index}`;
  const panelId = `faq-panel-${index}`;

  useLayoutEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [faq.a]);

  const handleClick = useCallback(() => {
    onToggle(index);
  }, [index, onToggle]);

  return (
    <div
      className="faq-card"
      data-open={isOpen}
      style={{
        background: isOpen
          ? "linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(168, 85, 247, 0.06))"
          : "var(--card-bg, #ffffff)",
        borderRadius: 16,
        border: isOpen
          ? "1.5px solid rgba(99, 102, 241, 0.3)"
          : "1px solid var(--border, #e5e7eb)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isOpen
          ? "0 8px 32px rgba(99, 102, 241, 0.1)"
          : "0 1px 3px rgba(0, 0, 0, 0.04)",
      }}
    >
      <button
        onClick={handleClick}
        aria-expanded={isOpen}
        id={triggerId}
        aria-controls={panelId}
        className="faq-trigger"
        style={{
          width: "100%",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 16,
          fontWeight: 600,
          color: isOpen ? "var(--primary, #6366f1)" : "var(--text-primary, #111827)",
          textAlign: "left",
          lineHeight: 1.5,
          position: "relative",
          zIndex: 1,
        }}
      >
        <span style={{ flex: 1 }}>{faq.q}</span>

        <span
          className="faq-icon-wrapper"
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: isOpen
              ? "var(--primary, #6366f1)"
              : "var(--bg-subtle, #f3f4f6)",
            transition: "background 0.3s ease, transform 0.3s ease",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isOpen ? "white" : "var(--primary, #6366f1)"}
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.3s ease",
              transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
            }}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className="faq-answer-container"
        style={{
          maxHeight: isOpen ? contentHeight : 0,
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
        }}
      >
        <div ref={contentRef} style={{ padding: "0 24px 24px" }}>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "var(--text-secondary, #6b7280)",
              lineHeight: 1.75,
              maxWidth: "90%",
            }}
          >
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                            */
/* -------------------------------------------------------------------------- */

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  /* Staggered entrance animation */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleAccordion = useCallback((index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  /* Filtered + searched FAQs */
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const hasNoResults = filteredFaqs.length === 0;

  /* Reset open index when filter changes */
  useEffect(() => {
    setOpenIndex(null);
  }, [activeCategory, searchQuery]);

  return (
    <section
      ref={sectionRef}
      id="faq"
      style={{
        position: "relative",
        padding: "100px 0",
        background: "var(--bg-app, #fafafa)",
        overflow: "hidden",
      }}
    >
      {/* ---------- Background decorations ---------- */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ---------- Content ---------- */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 820,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Header */}
        <div
          className="faq-header"
          style={{
            textAlign: "center",
            marginBottom: 48,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: 999,
              background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))",
              color: "var(--primary, #6366f1)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            FAQ
          </span>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              color: "var(--text-primary, #111827)",
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}
          >
            Got Questions?{" "}
            <span style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              We&apos;ve Got Answers.
            </span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--text-secondary, #6b7280)",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Everything you need to know about SmartPrice. Can&apos;t find what you&apos;re looking for?{" "}
            <a
              href="/contact"
              style={{
                color: "var(--primary, #6366f1)",
                fontWeight: 600,
                textDecoration: "none",
                borderBottom: "1.5px solid transparent",
                transition: "border-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
            >
              Contact us
            </a>
            .
          </p>
        </div>

        {/* Search */}
        <div
          style={{
            marginBottom: 32,
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div
            style={{
              position: "relative",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary, #9ca3af)"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              aria-label="Search frequently asked questions"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="faq-search-input"
              style={{
                width: "100%",
                padding: "14px 16px 14px 46px",
                borderRadius: 12,
                border: "1.5px solid var(--border, #e5e7eb)",
                background: "var(--card-bg, #ffffff)",
                fontSize: 15,
                fontFamily: "inherit",
                color: "var(--text-primary, #111827)",
                outline: "none",
                transition: "all 0.25s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--primary, #6366f1)";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border, #e5e7eb)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Category pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            marginBottom: 36,
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.6s ease 0.25s, transform 0.6s ease 0.25s",
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="faq-category-pill"
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: isActive
                    ? "1.5px solid var(--primary, #6366f1)"
                    : "1.5px solid var(--border, #e5e7eb)",
                  background: isActive
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "var(--card-bg, #ffffff)",
                  color: isActive ? "#ffffff" : "var(--text-secondary, #6b7280)",
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: isActive
                    ? "0 4px 14px rgba(99, 102, 241, 0.3)"
                    : "0 1px 2px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "var(--primary, #6366f1)";
                    e.currentTarget.style.background = "rgba(99,102,241,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "var(--border, #e5e7eb)";
                    e.currentTarget.style.background = "var(--card-bg, #ffffff)";
                  }
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Items */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minHeight: 80,
          }}
        >
          {hasNoResults ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                color: "var(--text-secondary, #6b7280)",
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                style={{ opacity: 0.4, marginBottom: 16 }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px" }}>
                No results found
              </p>
              <p style={{ fontSize: 14, margin: 0 }}>
                Try a different search term or category.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const globalIndex = faqs.indexOf(faq);
              return (
                <div
                  key={globalIndex}
                  className="faq-item-wrapper"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(24px)",
                    transition: `opacity 0.5s ease ${0.1 + index * 0.05}s, transform 0.5s ease ${0.1 + index * 0.05}s`,
                  }}
                >
                  <AccordionItem
                    faq={faq}
                    isOpen={openIndex === globalIndex}
                    onToggle={toggleAccordion}
                    index={globalIndex}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            textAlign: "center",
            marginTop: 48,
            padding: "32px 24px",
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.04))",
            border: "1px solid rgba(99,102,241,0.1)",
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s",
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary, #111827)",
              margin: "0 0 8px",
            }}
          >
            Still have questions?
          </p>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary, #6b7280)",
              margin: "0 0 20px",
            }}
          >
            We&apos;re here to help you find the answers you need.
          </p>
          <a
            href="/contact"
            className="faq-cta-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "inherit",
              textDecoration: "none",
              transition: "all 0.25s ease",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(99, 102, 241, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(99, 102, 241, 0.25)";
            }}
          >
            Contact Us
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>

      {/* ---------- Global Styles ---------- */}
      <style>{`
        .faq-card:hover {
          border-color: rgba(99, 102, 241, 0.2) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06) !important;
        }

        .faq-card:hover .faq-icon-wrapper {
          background: var(--primary, #6366f1) !important;
        }

        .faq-card:hover .faq-icon-wrapper svg {
          stroke: white !important;
        }

        .faq-trigger:focus-visible {
          outline: 2px solid var(--primary, #6366f1);
          outline-offset: -2px;
          border-radius: 16px;
        }

        .faq-search-input::placeholder {
          color: #9ca3af;
        }

        .faq-category-pill:focus-visible,
        .faq-cta-button:focus-visible {
          outline: 2px solid var(--primary, #6366f1);
          outline-offset: 2px;
        }

        @media (max-width: 640px) {
          .faq-card {
            border-radius: 12px !important;
          }
          .faq-trigger {
            padding: 16px 18px !important;
            font-size: 15px !important;
          }
          .faq-answer-container > div {
            padding: 0 18px 18px !important;
          }
          .faq-answer-container p {
            font-size: 14px !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}
