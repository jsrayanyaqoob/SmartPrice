"use client";

import { useMemo, useState, useRef, useEffect } from "react";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

/** Generate evenly-spaced X positions for N points across a given width */
function distributePoints(count, width, padding) {
  if (count <= 1) return [width / 2];
  const step = (width - padding * 2) / (count - 1);
  return Array.from({ length: count }, (_, i) => padding + i * step);
}

/* -------------------------------------------------------------------------- */
/*  PriceHistoryChart                                                         */
/* -------------------------------------------------------------------------- */

export default function PriceHistoryChart({ priceEntries = [] }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);

  // Responsive width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  // Animate entrance
  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Sort entries by date ascending for the chart
  const sortedEntries = useMemo(() => {
    const withDates = priceEntries.filter((e) => e.scrapedAt && typeof e.price === "number");
    withDates.sort((a, b) => new Date(a.scrapedAt) - new Date(b.scrapedAt));
    return withDates;
  }, [priceEntries]);

  // Chart dimensions
  const padding = { top: 20, right: 16, bottom: 32, left: 48 };
  const width = Math.max(containerWidth, 300);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = 200;
  const totalHeight = chartHeight + padding.top + padding.bottom;

  // Compute scales
  const { points, minPrice, maxPrice, priceRange, yScale } = useMemo(() => {
    if (sortedEntries.length === 0) {
      return { points: [], minPrice: 0, maxPrice: 0, priceRange: 0, yScale: () => 0 };
    }

    const prices = sortedEntries.map((e) => e.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const pad = range * 0.15;
    const yMin = Math.max(0, min - pad);
    const yMax = max + pad;
    const yRange = yMax - yMin;

    const xs = distributePoints(sortedEntries.length, chartWidth, 0);

    const pts = sortedEntries.map((e, i) => ({
      x: xs[i],
      y: chartHeight - ((e.price - yMin) / yRange) * chartHeight,
      price: e.price,
      date: e.scrapedAt,
      store: e.store?.name || "Store",
    }));

    return {
      points: pts,
      minPrice: min,
      maxPrice: max,
      priceRange: range,
      yScale: (val) => chartHeight - ((val - yMin) / yRange) * chartHeight,
    };
  }, [sortedEntries, chartWidth, chartHeight]);

  // Build SVG path
  const linePath = useMemo(() => {
    if (points.length < 2) return "";
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length < 2) return "";
    const bottom = chartHeight;
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L${last.x.toFixed(1)},${bottom} L${first.x.toFixed(1)},${bottom} Z`;
  }, [linePath, points, chartHeight]);

  // Y-axis labels
  const yTicks = useMemo(() => {
    if (priceRange === 0) return [minPrice];
    const step = Math.ceil(priceRange / 4);
    const ticks = [];
    for (let v = minPrice; v <= maxPrice + step; v += step || 1) {
      ticks.push(v);
    }
    return ticks;
  }, [minPrice, maxPrice, priceRange]);

  // Dash length for draw animation — generous bound so it always exceeds the path
  const dashLen = useMemo(() => Math.max(points.length * 100, 500), [points]);

  /* ── Empty state ── */
  if (sortedEntries.length === 0) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "var(--text-muted, #9ca3af)",
          fontSize: 13,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4, marginBottom: 8 }}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <p style={{ margin: 0 }}>No price history data available yet.</p>
        <p style={{ margin: "4px 0 0", fontSize: 12 }}>Price data will appear once the product has been tracked over time.</p>
      </div>
    );
  }

  /* ── Single data point ── */
  if (sortedEntries.length === 1) {
    const entry = sortedEntries[0];
    return (
      <div ref={containerRef} style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            padding: "24px 16px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted, #9ca3af)", marginBottom: 4 }}>Current Price</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--primary, #6366f1)" }}>
              {formatPrice(entry.price)}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted, #9ca3af)", marginTop: 4 }}>
              as of {formatDate(entry.scrapedAt)}
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: "var(--border, #e5e7eb)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted, #9ca3af)", marginBottom: 4 }}>Store</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{entry.store?.name || "Online"}</div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Chart ── */
  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      <svg
        width={width}
        height={totalHeight}
        style={{ display: "block", overflow: "visible" }}
        role="img"
        aria-label="Price history chart"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y-axis gridlines & labels */}
        {yTicks.map((val) => (
          <g key={`y-${val}`}>
            <line
              x1={padding.left} y1={yScale(val)}
              x2={width - padding.right} y2={yScale(val)}
              stroke="var(--border, #e5e7eb)" strokeWidth="1" strokeDasharray="4 4"
            />
            <text x={padding.left - 8} y={yScale(val) + 4} textAnchor="end" fill="var(--text-muted, #9ca3af)" fontSize="11">
              {formatPrice(val)}
            </text>
          </g>
        ))}

        {/* X-axis labels (~5 evenly spaced) */}
        {points
          .filter((_, i) => {
            const step = Math.max(1, Math.floor((points.length - 1) / 4));
            return i % step === 0 || i === points.length - 1;
          })
          .map((p) => (
            <text key={`x-${p.date}`} x={p.x} y={totalHeight - 6} textAnchor="middle" fill="var(--text-muted, #9ca3af)" fontSize="10">
              {formatDate(p.date)}
            </text>
          ))}

        {/* Area fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#priceGradient)" opacity={animateIn ? 0.12 : 0} style={{ transition: "opacity 0.8s ease" }} />
        )}

        {/* Line (animated draw via stroke-dashoffset) */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dashLen}
            strokeDashoffset={animateIn ? 0 : dashLen}
            style={{ transition: "stroke-dashoffset 1.2s ease-in-out" }}
          />
        )}

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={`dot-${i}`}
            cx={p.x} cy={p.y}
            r={hoveredIndex === i ? 6 : 3.5}
            fill={hoveredIndex === i ? "#6366f1" : "#ffffff"}
            stroke="#6366f1" strokeWidth="2.5"
            style={{ transition: "r 0.15s ease, fill 0.15s ease", cursor: "pointer" }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}

        {/* Hover vertical line */}
        {hoveredPoint && (
          <line
            x1={hoveredPoint.x} y1={0} x2={hoveredPoint.x} y2={chartHeight}
            stroke="#6366f1" strokeWidth="1" strokeDasharray="4 4" opacity={0.5}
            style={{ pointerEvents: "none" }}
          />
        )}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: "absolute",
            top: padding.top - 8,
            left: Math.min(Math.max(hoveredPoint.x + padding.left - 70, 0), width - 160),
            background: "#ffffff",
            border: "1px solid var(--border, #e5e7eb)",
            borderRadius: 10,
            padding: "10px 14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            pointerEvents: "none",
            zIndex: 10,
            minWidth: 130,
          }}
        >
          <div style={{ fontSize: 11, color: "var(--text-muted, #9ca3af)", marginBottom: 2 }}>
            {formatDate(hoveredPoint.date)}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary, #6366f1)" }}>
            {formatPrice(hoveredPoint.price)}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted, #9ca3af)", marginTop: 2 }}>
            {hoveredPoint.store}
          </div>
        </div>
      )}
    </div>
  );
}
