"use client";

import { useMemo } from "react";
import { Store, TrendingDown, ExternalLink } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  RetailerComparison                                                        */
/* -------------------------------------------------------------------------- */

export default function RetailerComparison({ priceEntries = [] }) {
  // Filter valid entries and find best price
  const { validEntries, bestPrice, maxPrice } = useMemo(() => {
    const valid = priceEntries.filter(
      (e) => typeof e.price === "number" && e.price > 0
    );
    const prices = valid.map((e) => e.price);
    return {
      validEntries: valid,
      bestPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    };
  }, [priceEntries]);

  if (validEntries.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: "var(--text-muted, #9ca3af)",
          fontSize: 13,
        }}
      >
        <p style={{ margin: 0 }}>No retailer price data available.</p>
      </div>
    );
  }

  // Sort by price ascending
  const sorted = [...validEntries].sort((a, b) => a.price - b.price);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600 }}>
          <Store size={16} style={{ color: "var(--primary, #6366f1)" }} />
          Compare Prices
        </div>
        <span style={{ fontSize: 12, color: "var(--text-muted, #9ca3af)" }}>
          {validEntries.length} store{validEntries.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Store price cards */}
      {sorted.map((entry, index) => {
        const isBest = entry.price === bestPrice;
        const barWidth =
          maxPrice > 0 ? ((entry.price / maxPrice) * 100).toFixed(1) : 0;

        return (
          <div
            key={`${entry.store?.name || index}-${entry.price}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 12,
              background: isBest
                ? "rgba(16, 185, 129, 0.06)"
                : "var(--card-bg, #ffffff)",
              border: isBest
                ? "1.5px solid rgba(16, 185, 129, 0.2)"
                : "1px solid var(--border, #e5e7eb)",
              transition: "all 0.2s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            {/* Price bar visual */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${barWidth}%`,
                background: isBest
                  ? "linear-gradient(90deg, rgba(16, 185, 129, 0.08), transparent)"
                  : "linear-gradient(90deg, rgba(99, 102, 241, 0.04), transparent)",
                borderRadius: 12,
                pointerEvents: "none",
              }}
            />

            {/* Store icon */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: isBest
                  ? "rgba(16, 185, 129, 0.12)"
                  : "var(--bg-subtle, #f3f4f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
              }}
            >
              {entry.store?.name?.charAt(0) || "?"}
            </div>

            {/* Store name & price */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary, #111827)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {entry.store?.name || "Online Store"}
                {isBest && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "#10b981",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    <TrendingDown size={10} /> Best Price
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted, #9ca3af)",
                  marginTop: 2,
                }}
              >
                {entry.scrapedAt
                  ? `Updated ${new Date(entry.scrapedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "Live price"}
              </div>
            </div>

            {/* Price & action */}
            <div
              style={{
                textAlign: "right",
                position: "relative",
                zIndex: 1,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: isBest ? "#10b981" : "var(--text-primary, #111827)",
                }}
              >
                ${Number(entry.price).toFixed(2)}
              </div>
              {entry.storeUrl && (
                <a
                  href={entry.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 11,
                    color: "var(--primary, #6366f1)",
                    textDecoration: "none",
                    marginTop: 2,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
