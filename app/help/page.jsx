"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

const faqCategories = [
  {
    title: "Getting Started",
    icon: "🚀",
    questions: [
      {
        q: "What is SmartPrice?",
        a: "SmartPrice is an AI-powered price comparison and tracking platform. It scans thousands of retailers in real-time to find you the lowest prices, sends instant alerts when prices drop, and provides AI-driven shopping insights to help you save money.",
      },
      {
        q: "Is SmartPrice free to use?",
        a: "Yes! SmartPrice offers a generous free tier that includes price tracking for up to 10 products, real-time price comparison, and AI-powered recommendations. Upgrade to Pro for unlimited tracking and priority alerts.",
      },
      {
        q: "Do I need to create an account?",
        a: "You can browse products and compare prices without an account. However, creating a free account unlocks price alerts, wishlist management, AI recommendations, and personalized insights.",
      },
      {
        q: "How do I get started?",
        a: "Simply sign up for a free account, then start searching for products. Use the search bar to find any product, compare prices across stores, set price alerts, and let our AI recommend the best deals for you.",
      },
    ],
  },
  {
    title: "Price Tracking & Alerts",
    icon: "🔔",
    questions: [
      {
        q: "How do price alerts work?",
        a: "When viewing any product, click the 'Set Alert' button and enter your target price. Our system monitors the product across all retailers and sends you an instant notification (email + in-app) when the price drops to or below your target.",
      },
      {
        q: "How often are prices updated?",
        a: "Our AI engine scans over 50,000 retailers every 60 seconds, ensuring you always see the most current prices. Price alerts are checked in real-time against each scan.",
      },
      {
        q: "Can I track multiple products?",
        a: "Absolutely! Free users can track up to 10 products simultaneously. Pro users enjoy unlimited tracking with priority alert delivery.",
      },
      {
        q: "What happens when a price alert is triggered?",
        a: "You'll receive an instant notification via email and in-app notification. The alert status changes to 'REACHED' and you can click through to view the product at its lowest price.",
      },
    ],
  },
  {
    title: "AI Features",
    icon: "🤖",
    questions: [
      {
        q: "How does the AI Budget Planner work?",
        a: "Tell our AI your budget and what you're shopping for (e.g., 'I have $1500 for a gaming setup'), and it will create a personalized shopping strategy. It splits your budget across categories, recommends specific products, and tells you where to find the best value.",
      },
      {
        q: "What is AI Curated recommendations?",
        a: "Based on your search history, budget planner inputs, and browsing patterns, our AI suggests products that match your needs. These recommendations appear on your dashboard and in the AI Assistant chat.",
      },
      {
        q: "How accurate are price predictions?",
        a: "Our predictive analytics engine analyzes historical price patterns across thousands of products. While we can't guarantee future prices, our models achieve over 90% accuracy in identifying price trends and optimal buying windows.",
      },
    ],
  },
  {
    title: "Account & Settings",
    icon: "⚙️",
    questions: [
      {
        q: "How do I change my password?",
        a: "Go to Settings → Password section. Enter your current password and new password, then click 'Change Password'. You'll receive a confirmation email.",
      },
      {
        q: "Can I change my email address?",
        a: "Yes. Go to Settings → Email section. Enter your new email address and click 'Send Verification'. Check your new email for a verification link to confirm the change.",
      },
      {
        q: "How do I enable two-factor authentication?",
        a: "Navigate to Settings → Security section. Click 'Enable 2FA' and scan the QR code with your authenticator app (Google Authenticator, Authy, etc.). Enter the verification code to complete setup.",
      },
      {
        q: "How do I delete my account?",
        a: "Account deletion is available in Settings under the Danger Zone section. Please note that this action is irreversible and will permanently remove all your data, alerts, and wishlist items.",
      },
    ],
  },
  {
    title: "Billing & Pro Plan",
    icon: "💎",
    questions: [
      {
        q: "What does the Pro plan include?",
        a: "Pro plan includes unlimited product tracking, priority price alerts (faster notifications), advanced AI insights, ad-free experience, and priority customer support.",
      },
      {
        q: "How much does Pro cost?",
        a: "Pro is available for a competitive monthly or annual subscription. Check the Pricing page for current rates. Annual plans come with a significant discount.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes! You can cancel your Pro subscription at any time from Settings → Billing. You'll retain Pro features until the end of your billing period.",
      },
    ],
  },
];

// Track search queries locally (privacy-respecting: no external service, no PII)
function trackSearch(query) {
  if (!query || query.trim().length < 3) return;
  try {
    const stored = JSON.parse(localStorage.getItem("smartprice-help-searches") || "[]");
    stored.push({ q: query.trim().toLowerCase(), t: Date.now() });
    // Keep only last 100 searches, max 7 days old
    const recent = stored
      .filter((s) => Date.now() - s.t < 7 * 86400000)
      .slice(-100);
    localStorage.setItem("smartprice-help-searches", JSON.stringify(recent));
  } catch {}
}

function getTrendingSearches() {
  try {
    const stored = JSON.parse(localStorage.getItem("smartprice-help-searches") || "[]");
    const counts = {};
    stored.forEach((s) => {
      counts[s.q] = (counts[s.q] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([q]) => q);
  } catch {
    return [];
  }
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [faqFeedback, setFaqFeedback] = useState({});
  const searchTimerRef = useRef(null);

  useEffect(() => {
    setTrendingSearches(getTrendingSearches());
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const filteredCategories = faqCategories
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.questions.length > 0);

  const toggleQuestion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Flatten for search-based index
  let flatIndex = 0;

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "40px 24px 80px",
      }}
    >
      {/* Back link */}
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--text-muted)",
          fontSize: 13,
          fontWeight: 500,
          textDecoration: "none",
          marginBottom: 24,
        }}
      >
        <ArrowLeft size={14} /> Back to Home
      </Link>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "var(--text-primary)",
            margin: "0 0 8px",
          }}
        >
          Help Center
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            maxWidth: 420,
            margin: "0 auto 24px",
            lineHeight: 1.6,
          }}
        >
          Find answers to common questions, get started with SmartPrice, or reach out to our support team.
        </p>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: 480, margin: "0 auto" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Debounce search tracking: only record after user stops typing
              if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
              if (e.target.value.trim().length >= 3) {
                searchTimerRef.current = setTimeout(() => {
                  trackSearch(e.target.value);
                }, 500);
              }
            }}
            className="input"
            style={{
              paddingLeft: 40,
              height: 44,
              borderRadius: "var(--radius-full)",
              fontSize: 14,
              width: "100%",
              border: "2px solid var(--border)",
            }}
          />

          {/* Trending searches */}
          {!searchQuery && trendingSearches.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                Trending:
              </span>
              {trendingSearches.map((q) => (
                <button
                  key={q}
                  onClick={() => setSearchQuery(q)}
                  className="btn btn-ghost btn-sm"
                  style={{
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                    height: 24,
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAQ Categories */}
      {filteredCategories.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: "var(--text-muted)",
          }}
        >
          <p style={{ fontSize: 14 }}>
            No results found for &quot;{searchQuery}&quot;. Try different keywords.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {filteredCategories.map((cat, catIdx) => (
            <div key={cat.title} className="card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Category header */}
              <div
                style={{
                  padding: "18px 24px",
                  background: "var(--bg-surface-2)",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    margin: 0,
                  }}
                >
                  {cat.title}
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    marginLeft: "auto",
                  }}
                >
                  {cat.questions.length} article{cat.questions.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Questions */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {cat.questions.map((item) => {
                  const currentFlatIndex = flatIndex++;
                  const isExpanded = expandedIndex === currentFlatIndex;
                  return (
                    <div
                      key={item.q}
                      style={{
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <button
                        onClick={() => toggleQuestion(currentFlatIndex)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "16px 24px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textAlign: "left",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--bg-surface-2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <span style={{ flex: 1 }}>{item.q}</span>
                        {isExpanded ? (
                          <ChevronUp size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                        ) : (
                          <ChevronDown size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                        )}
                      </button>
                      {isExpanded && (
                        <div
                          style={{
                            padding: "0 24px 18px",
                            fontSize: 13,
                            lineHeight: 1.7,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {item.a}
                          <div
                            style={{
                              marginTop: 12,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 11,
                              color: faqFeedback[currentFlatIndex] ? "var(--success)" : "var(--text-muted)",
                            }}
                          >
                            {faqFeedback[currentFlatIndex] ? (
                              <span>✓ Thanks for your feedback!</span>
                            ) : (
                              <>
                                <span>Was this helpful?</span>
                                <button
                                  onClick={() => {
                                    const key = String(currentFlatIndex);
                                    localStorage.setItem(`faq-${key}`, "yes");
                                    setFaqFeedback((prev) => ({ ...prev, [key]: "yes" }));
                                  }}
                                  className="btn btn-ghost btn-sm"
                                  style={{
                                    padding: "2px 8px",
                                    fontSize: 10,
                                    height: 24,
                                    borderRadius: "var(--radius-full)",
                                  }}
                                >
                                  👍 Yes
                                </button>
                                <button
                                  onClick={() => {
                                    const key = String(currentFlatIndex);
                                    localStorage.setItem(`faq-${key}`, "no");
                                    setFaqFeedback((prev) => ({ ...prev, [key]: "no" }));
                                  }}
                                  className="btn btn-ghost btn-sm"
                                  style={{
                                    padding: "2px 8px",
                                    fontSize: 10,
                                    height: 24,
                                    borderRadius: "var(--radius-full)",
                                  }}
                                >
                                  👎 No
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Support */}
      <div
        className="card"
        style={{
          marginTop: 40,
          padding: 28,
          textAlign: "center",
          background: "var(--brand-gradient)",
          color: "white",
          border: "none",
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "white",
            margin: "0 0 8px",
          }}
        >
          Still need help?
        </h2>
        <p
          style={{
            fontSize: 13,
            opacity: 0.9,
            margin: "0 0 20px",
            lineHeight: 1.6,
          }}
        >
          Our support team is here to help you. Reach out and we&apos;ll get back to you within 24 hours.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="mailto:support@smartprice.io"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
              backdropFilter: "blur(4px)",
            }}
          >
            <Mail size={14} /> Email Support
          </a>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
              backdropFilter: "blur(4px)",
            }}
          >
            <Sparkles size={14} /> Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
