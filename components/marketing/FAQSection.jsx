"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How does SmartPrice find the best prices?",
    a: "Our AI scans over 50,000 retailers every 60 seconds, comparing prices across Amazon, Walmart, Best Buy, eBay, and thousands more. We analyze real-time data to find you the absolute lowest price available.",
  },
  {
    q: "Is SmartPrice really free to use?",
    a: "Yes! Our Free plan gives you price comparison across 10+ stores, basic alerts, and 7-day price history. Upgrade to Pro for unlimited alerts, AI predictions, and 30-day history.",
  },
  {
    q: "How accurate are the AI price predictions?",
    a: "Our predictive models analyze historical price patterns, seasonal trends, and market data to forecast price drops with over 90% accuracy. We tell you whether to buy now or wait for a better deal.",
  },
  {
    q: "Can I track prices from any online store?",
    a: "SmartPrice supports 50,000+ retailers out of the box. If a store isn't listed, you can paste any product URL and our AI will start tracking it within minutes.",
  },
  {
    q: "How do price alerts work?",
    a: "Set your target price for any product. When the price drops to your threshold, we'll notify you instantly via email or SMS. Pro users get unlimited alerts with real-time notifications.",
  },
  {
    q: "Can I cancel my Pro subscription anytime?",
    a: "Absolutely. No contracts, no hidden fees. You can upgrade, downgrade, or cancel anytime. Plus, we offer a 30-day money-back guarantee — no questions asked.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section style={{ padding: "80px 0", background: "var(--bg-app)" }} id="faq">
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div className="section-label" style={{ marginBottom: 8 }}>FAQ</div>
        <h2 className="heading-2" style={{ marginBottom: 12 }}>
          Got Questions? We&apos;ve Got Answers.
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            marginBottom: 48,
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Everything you need to know about SmartPrice. Can&apos;t find what you&apos;re looking for?{" "}
          <a href="/contact" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            Contact us
          </a>.
        </p>

        <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="faq-item"
              style={{
                background: "white",
                borderRadius: 14,
                border: openIndex === index ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                overflow: "hidden",
                transition: "border-color 0.2s ease",
              }}
            >
              <button
                onClick={() => toggle(index)}
                aria-expanded={openIndex === index}
                style={{
                  width: "100%",
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  textAlign: "left",
                  lineHeight: 1.4,
                }}
              >
                <span>{faq.q}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  style={{
                    flexShrink: 0,
                    transition: "transform 0.3s ease",
                    transform: openIndex === index ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <div
                className="faq-answer"
                style={{
                  maxHeight: openIndex === index ? 200 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.35s ease",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    padding: "0 22px 18px",
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .faq-item:hover {
          border-color: var(--primary-light) !important;
        }
      `}</style>
    </section>
  );
}
