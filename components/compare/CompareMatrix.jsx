"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { getUniqueSpecKeys, parsePrice } from "@/lib/compare";

function renderStars(rating) {
  const rounded = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={13}
      fill={index < rounded ? "currentColor" : "none"}
      stroke="currentColor"
    />
  ));
}

function getLowestPriceIds(compareList) {
  const prices = compareList.map((product) => parsePrice(product.bestPrice ?? product.price));
  const lowest = Math.min(...prices);
  if (!Number.isFinite(lowest) || lowest <= 0) return new Set();

  return new Set(
    compareList
      .filter((product) => parsePrice(product.bestPrice ?? product.price) === lowest)
      .map((product) => product.id)
  );
}

function getHighestRatingIds(compareList) {
  const ratings = compareList.map((product) => Number(product.rating) || 0);
  const highest = Math.max(...ratings);
  if (!Number.isFinite(highest) || highest <= 0) return new Set();

  return new Set(
    compareList
      .filter((product) => (Number(product.rating) || 0) === highest)
      .map((product) => product.id)
  );
}

function getMostRetailersIds(compareList) {
  const counts = compareList.map((product) => Number(product.retailers) || 1);
  const highest = Math.max(...counts);
  return new Set(
    compareList
      .filter((product) => (Number(product.retailers) || 1) === highest)
      .map((product) => product.id)
  );
}

export default function CompareMatrix({ compareList }) {
  if (!compareList.length) return null;

  const specKeys = getUniqueSpecKeys(compareList);
  const lowestPriceIds = getLowestPriceIds(compareList);
  const highestRatingIds = getHighestRatingIds(compareList);
  const mostRetailersIds = getMostRetailersIds(compareList);

  const matrixRows = [
    {
      label: "Brand",
      render: (product) => product.brand || "—",
    },
    {
      label: "Category",
      render: (product) => product.category || "—",
    },
    {
      label: "Best Price Found",
      render: (product) => {
        const isLowest = lowestPriceIds.has(product.id);
        return isLowest ? (
          <span className="badge badge-success" style={{ fontSize: 12, fontWeight: 700, padding: "4px 8px" }}>
            {product.bestPrice} (Lowest)
          </span>
        ) : (
          <span style={{ fontWeight: 600 }}>{product.bestPrice}</span>
        );
      },
    },
    {
      label: "Original Price",
      render: (product) => product.originalPrice || "—",
    },
    {
      label: "Savings",
      render: (product) =>
        product.savings ? (
          <span style={{ color: "var(--success)", fontWeight: 700 }}>{product.savings}</span>
        ) : (
          "—"
        ),
    },
    {
      label: "Store Offers",
      render: (product) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
          {product.priceEntries && product.priceEntries.length > 0 ? (
            product.priceEntries.map((entry, index) => (
              <div key={index} style={{ fontSize: 11, display: "flex", gap: 6 }}>
                <span style={{ color: "var(--text-muted)" }}>{entry.store?.name || entry.store || "Store"}:</span>
                <span style={{ fontWeight: 600 }}>
                  ${Number(entry.price).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {product.bestStore || product.brand || "No live quotes"}
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Rating",
      render: (product) => {
        const isHighest = highestRatingIds.has(product.id);
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontWeight: 600,
              color: isHighest ? "var(--success)" : "inherit",
            }}
          >
            <span style={{ display: "inline-flex", color: "#f59e0b" }}>{renderStars(product.rating)}</span>
            {Number(product.rating).toFixed(1)} / 5.0
            {isHighest ? " (Top)" : ""}
          </span>
        );
      },
    },
    {
      label: "Retailers Tracked",
      render: (product) => {
        const isMost = mostRetailersIds.has(product.id);
        return (
          <span style={{ fontWeight: isMost ? 700 : 500, color: isMost ? "var(--primary)" : "inherit" }}>
            {product.retailers || 1} stores{isMost ? " (Most)" : ""}
          </span>
        );
      },
    },
    {
      label: "Source",
      render: (product) => product.source || "Live feed",
    },
    {
      label: "Description",
      render: (product) => (
        <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {product.description || "No description available."}
        </span>
      ),
    },
  ];

  return (
    <div className="card" style={{ padding: 20, minWidth: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Product Comparison Matrix</h3>
        <span className="badge badge-pro" style={{ fontSize: 11 }}>
          {compareList.length} product{compareList.length === 1 ? "" : "s"} selected
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 680 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", fontSize: 12, color: "var(--text-muted)" }}>
              <th style={{ padding: "10px 8px", width: "180px" }}>SPECIFICATION</th>
              {compareList.map((product) => (
                <th key={`header-${product.id}`} style={{ padding: "10px 8px", textAlign: "center", minWidth: 160 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 6,
                          background: "var(--bg-surface-2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        📦
                      </div>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.3 }}>
                      {product.title}
                    </span>
                    <Link
                      href={`/products/${product.id}`}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 10, padding: "2px 8px", textDecoration: "none" }}
                    >
                      View details
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixRows.map((row) => (
              <tr key={row.label} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--text-secondary)" }}>{row.label}</td>
                {compareList.map((product) => (
                  <td key={`${row.label}-${product.id}`} style={{ padding: "10px 8px", textAlign: "center", verticalAlign: "top" }}>
                    {row.render(product)}
                  </td>
                ))}
              </tr>
            ))}

            {specKeys.map((specKey) => (
              <tr key={specKey} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--text-secondary)" }}>{specKey}</td>
                {compareList.map((product) => (
                  <td key={`spec-${specKey}-${product.id}`} style={{ padding: "10px 8px", textAlign: "center" }}>
                    {product.specs?.[specKey] ? product.specs[specKey] : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
