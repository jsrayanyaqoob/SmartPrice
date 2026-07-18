"use client";

import { use, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Tag,
  Store,
  Star,
  Scale,
  Share2,
  Check,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
} from "lucide-react";
import { useCompareList } from "@/hooks/useCompareList";
import AlertButton from "@/components/AlertButton";
import PriceHistoryChart from "@/components/product/PriceHistoryChart";
import RetailerComparison from "@/components/product/RetailerComparison";
import { Skeleton } from "@/components/ui/Skeleton";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function getDisplayRating(product) {
  if (typeof product?.rating === "number" && Number.isFinite(product.rating)) {
    return product.rating;
  }
  const retailerBoost = Math.min(3, Math.max(1, Number(product?.retailers || 1)));
  return Number((4.2 + (retailerBoost % 3) * 0.2).toFixed(1));
}

function renderStars(rating) {
  const rounded = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={14}
      fill={i < rounded ? "currentColor" : "none"}
      stroke="currentColor"
    />
  ));
}

function formatCurrency(val) {
  return `$${Number(val || 0).toFixed(2)}`;
}

function getSavingsPercent(current, original) {
  if (!original || !current || original <= 0) return 0;
  return ((original - current) / original) * 100;
}

/* -------------------------------------------------------------------------- */
/*  Skeleton                                                                  */
/* -------------------------------------------------------------------------- */

function DetailSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Skeleton width={140} height={18} borderRadius={8} />
      <div
        className="card"
        style={{
          padding: 24,
          display: "grid",
          gridTemplateColumns: "minmax(260px, 360px) 1fr",
          gap: 24,
        }}
      >
        <Skeleton height={360} borderRadius={18} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Skeleton width={100} height={24} borderRadius={999} />
          <Skeleton height={32} width="80%" />
          <Skeleton height={18} width="50%" />
          <Skeleton height={40} width="40%" />
          <Skeleton height={80} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <Skeleton height={60} />
            <Skeleton height={60} />
            <Skeleton height={60} />
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 24 }}>
        <Skeleton height={200} />
      </div>
      <div className="card" style={{ padding: 24 }}>
        <Skeleton height={160} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                 */
/* -------------------------------------------------------------------------- */

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const { compareList, addProduct } = useCompareList();

  const resolvedParams = use(params);
  const productId = resolvedParams?.id;

  /* ── Fetch product by ID ── */
  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setProduct(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/products?id=${encodeURIComponent(productId)}`);
        const data = await res.json();

        if (!res.ok || !data.product) {
          setError(data.error || "Product not found");
          setProduct(null);
        } else {
          setProduct(data.product);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load product. Please try again.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  /* ── Derived data ── */
  const priceLabel = useMemo(
    () => (product ? product.bestPrice || formatCurrency(product.price) : ""),
    [product]
  );

  const rating = useMemo(() => getDisplayRating(product), [product]);

  const priceEntries = useMemo(() => product?.priceEntries || [], [product]);

  // Stats
  const stats = useMemo(() => {
    if (!product || !priceEntries.length) return null;
    const prices = priceEntries.filter((e) => typeof e.price === "number" && e.price > 0).map((e) => e.price);
    if (!prices.length) return null;
    return {
      lowest: Math.min(...prices),
      highest: Math.max(...prices),
      average: prices.reduce((a, b) => a + b, 0) / prices.length,
      stores: priceEntries.filter((e) => e.store?.name).length,
    };
  }, [product, priceEntries]);

  const savingsPct = useMemo(() => {
    if (!stats || !product) return 0;
    return getSavingsPercent(stats.lowest, product.price);
  }, [stats, product]);

  /* ── Share handler ── */
  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = product?.title || "Check this product on SmartPrice";
    if (navigator.share) {
      try {
        await navigator.share({ title, url, text: `Check out ${title} on SmartPrice!` });
      } catch { /* user cancelled */ }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch { /* clipboard failed */ }
    }
  }, [product]);

  /* ── Loading ── */
  if (loading) return <DetailSkeleton />;

  /* ── Error / Not found ── */
  if (error || !product) {
    return (
      <div
        className="card"
        style={{
          padding: 48,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "center",
          borderRadius: 16,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 4 }}>🔍</div>
        <h2 style={{ margin: 0, fontWeight: 700 }}>Product not found</h2>
        <p style={{ margin: 0, color: "var(--text-muted, #9ca3af)", maxWidth: 400 }}>
          {error || "We couldn't find this product in the live feed."}
        </p>
        <Link
          href="/products"
          className="btn btn-primary"
          style={{
            marginTop: 8,
            textDecoration: "none",
            padding: "10px 24px",
            borderRadius: 10,
          }}
        >
          Browse products
        </Link>
      </div>
    );
  }

  const inCompare = compareList.some((item) => item.id === product.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* ── Back link ── */}
      <Link
        href="/products"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: "var(--primary, #6366f1)",
          fontWeight: 600,
          fontSize: 14,
          width: "fit-content",
          textDecoration: "none",
          transition: "gap 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.gap = "12px")}
        onMouseLeave={(e) => (e.currentTarget.style.gap = "8px")}
      >
        <ArrowLeft size={16} /> Back to products
      </Link>

      {/* ── Main product card ── */}
      <div
        className="card"
        style={{
          padding: 24,
          display: "grid",
          gridTemplateColumns: "minmax(260px, 360px) 1fr",
          gap: 28,
          alignItems: "start",
          borderRadius: 16,
          border: "1px solid var(--border, #e5e7eb)",
          background: "var(--card-bg, #ffffff)",
        }}
      >
        {/* Image */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background: "var(--bg-surface-2, #f9fafb)",
              minHeight: 300,
              aspectRatio: "3/4",
            }}
          >
            <img
              src={product.imageUrl || ""}
              alt={product.title}
              loading="eager"
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.4s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            {savingsPct > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(16, 185, 129, 0.9)",
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 700,
                  backdropFilter: "blur(4px)",
                }}
              >
                <TrendingDown size={13} /> Save {savingsPct.toFixed(0)}%
              </div>
            )}
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 999,
                background: "rgba(99, 102, 241, 0.9)",
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 700,
                backdropFilter: "blur(4px)",
              }}
            >
              <Zap size={12} /> Live deal
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Category & Title */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                borderRadius: 999,
                background: "rgba(99, 102, 241, 0.08)",
                color: "var(--primary, #6366f1)",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              <Tag size={12} /> {product.category || product.brand || "Product"}
            </div>
            <h1
              className="heading-2"
              style={{
                margin: 0,
                lineHeight: 1.2,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                fontSize: "clamp(22px, 3vw, 28px)",
              }}
            >
              {product.title}
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                color: "var(--text-muted, #9ca3af)",
                fontSize: 15,
              }}
            >
              by <strong style={{ color: "var(--text-primary, #111827)" }}>{product.brand || "Unknown"}</strong>
            </p>
          </div>

          {/* Price */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "var(--primary, #6366f1)",
              }}
            >
              {priceLabel}
            </div>
            {product.price && stats?.lowest && stats.lowest < product.price && (
              <div
                style={{
                  fontSize: 15,
                  color: "var(--text-muted, #9ca3af)",
                  textDecoration: "line-through",
                }}
              >
                {formatCurrency(product.price)}
              </div>
            )}
            {savingsPct > 0 && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <TrendingDown size={12} /> Save {savingsPct.toFixed(0)}%
              </div>
            )}
          </div>

          {/* Rating */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
              color: "#f59e0b",
              fontWeight: 700,
            }}
          >
            {renderStars(rating)}
            <span style={{ marginLeft: 4, color: "var(--text-muted, #9ca3af)", fontSize: 13 }}>
              {rating.toFixed(1)} rating
            </span>
            {stats?.stores > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  color: "var(--text-muted, #9ca3af)",
                  fontSize: 13,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Store size={13} /> {stats.stores} stores tracked
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary, #6b7280)",
                lineHeight: 1.7,
                fontSize: 14,
              }}
            >
              {product.description}
            </p>
          )}

          {/* Stats grid */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              <div
                className="card"
                style={{
                  padding: "12px 14px",
                  background: "var(--bg-surface-2, #f9fafb)",
                  borderRadius: 12,
                  border: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "var(--text-muted, #9ca3af)",
                    marginBottom: 4,
                  }}
                >
                  <TrendingDown size={12} /> Lowest
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#10b981" }}>
                  {formatCurrency(stats.lowest)}
                </div>
              </div>
              <div
                className="card"
                style={{
                  padding: "12px 14px",
                  background: "var(--bg-surface-2, #f9fafb)",
                  borderRadius: 12,
                  border: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "var(--text-muted, #9ca3af)",
                    marginBottom: 4,
                  }}
                >
                  <BarChart3 size={12} /> Average
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {formatCurrency(stats.average)}
                </div>
              </div>
              <div
                className="card"
                style={{
                  padding: "12px 14px",
                  background: "var(--bg-surface-2, #f9fafb)",
                  borderRadius: 12,
                  border: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "var(--text-muted, #9ca3af)",
                    marginBottom: 4,
                  }}
                >
                  <TrendingUp size={12} /> Highest
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                  {formatCurrency(stats.highest)}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 4,
            }}
          >
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleShare}
              style={{
                padding: "10px 16px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
            >
              {shareCopied ? (
                <><Check size={14} style={{ color: "#10b981" }} /> Link copied!</>
              ) : (
                <><Share2 size={14} /> Share</>
              )}
            </button>

            <button
              type="button"
              className={`btn ${inCompare ? "btn-primary" : "btn-ghost"}`}
              style={{
                padding: "10px 16px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
              }}
              onClick={() => addProduct(product)}
            >
              <Scale size={14} />
              {inCompare ? "Added to Compare" : "Compare now"}
            </button>

            {compareList.length > 0 && (
              <Link
                href="/products/compare"
                className="btn btn-ghost"
                style={{
                  padding: "10px 16px",
                  textDecoration: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Open Compare ({compareList.length})
              </Link>
            )}

            <AlertButton
              productId={product.id}
              productName={product.title || product.name}
            />
          </div>
        </div>
      </div>

      {/* ── Price History + Retailer Comparison Tabs ── */}
      <div
        className="card"
        style={{
          padding: 24,
          borderRadius: 16,
          border: "1px solid var(--border, #e5e7eb)",
          background: "var(--card-bg, #ffffff)",
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 20,
            borderBottom: "1px solid var(--border, #e5e7eb)",
            paddingBottom: 0,
          }}
        >
          <button
            onClick={() => setActiveTab("history")}
            style={{
              padding: "10px 18px",
              border: "none",
              background: "none",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: activeTab === "history" ? 700 : 500,
              color:
                activeTab === "history"
                  ? "var(--primary, #6366f1)"
                  : "var(--text-muted, #9ca3af)",
              cursor: "pointer",
              borderBottom:
                activeTab === "history"
                  ? "2px solid var(--primary, #6366f1)"
                  : "2px solid transparent",
              transition: "all 0.2s ease",
              marginBottom: -1,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <BarChart3 size={15} /> Price History
          </button>
          <button
            onClick={() => setActiveTab("retailers")}
            style={{
              padding: "10px 18px",
              border: "none",
              background: "none",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: activeTab === "retailers" ? 700 : 500,
              color:
                activeTab === "retailers"
                  ? "var(--primary, #6366f1)"
                  : "var(--text-muted, #9ca3af)",
              cursor: "pointer",
              borderBottom:
                activeTab === "retailers"
                  ? "2px solid var(--primary, #6366f1)"
                  : "2px solid transparent",
              transition: "all 0.2s ease",
              marginBottom: -1,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Store size={15} /> Compare Retailers
          </button>
        </div>

        {/* Tab content */}
        <div style={{ minHeight: 220 }}>
          {activeTab === "history" ? (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    Price History
                  </h3>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12,
                      color: "var(--text-muted, #9ca3af)",
                    }}
                  >
                    Track price changes across {stats?.stores || 0} stores
                    {priceEntries.length > 0 &&
                      ` · ${priceEntries.length} data points`}
                  </p>
                </div>
                {stats && (
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted, #9ca3af)",
                        }}
                      >
                        Price range
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {formatCurrency(stats.lowest)} –{" "}
                        {formatCurrency(stats.highest)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <PriceHistoryChart priceEntries={priceEntries} />
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    Retailer Price Comparison
                  </h3>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12,
                      color: "var(--text-muted, #9ca3af)",
                    }}
                  >
                    Compare prices across different stores to find the best deal
                  </p>
                </div>
              </div>
              <RetailerComparison priceEntries={priceEntries} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
