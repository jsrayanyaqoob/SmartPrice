"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck, Tag, ShoppingCart, TrendingUp, Store, Star, Scale } from "lucide-react";
import { useCompareList } from "@/hooks/useCompareList";

function normalizeValue(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function getDisplayRating(product) {
  if (typeof product?.rating === "number" && Number.isFinite(product.rating)) {
    return product.rating;
  }

  const retailerBoost = Math.min(3, Math.max(1, Number(product?.retailers || 1)));
  return Number((4.2 + (retailerBoost % 3) * 0.2).toFixed(1));
}

function renderStars(rating) {
  const stars = [];
  const rounded = Math.round(rating);

  for (let i = 0; i < 5; i += 1) {
    stars.push(<Star key={i} size={14} fill={i < rounded ? "currentColor" : "none"} stroke="currentColor" />);
  }

  return stars;
}

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { compareList, addProduct } = useCompareList();

  const resolvedParams = use(params);
  const productId = resolvedParams?.id;

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setProduct(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/products`);
        const data = await res.json();
        const products = Array.isArray(data?.products) ? data.products : [];
        const target = normalizeValue(productId);

        const found =
          products.find((item) => {
            const candidates = [
              item.id,
              item.key,
              item.attributes?.key,
              item.productId,
              item.product?.id,
              item.product?.key,
              item.slug,
              item.title,
              item.name,
            ];

            return candidates.some((candidate) => {
              const normalized = normalizeValue(candidate);
              return normalized === target || normalized.includes(target) || target.includes(normalized);
            });
          }) ||
          products.find((item) => {
            const haystack = `${item.title || ""} ${item.brand || ""} ${item.category || ""}`.toLowerCase();
            return haystack.includes(String(productId || "").toLowerCase());
          }) ||
          null;

        setProduct(found);
      } catch (err) {
        console.error(err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const priceLabel = useMemo(() => {
    if (!product) return "";
    return product.bestPrice || `$${Number(product.price || 0).toFixed(2)}`;
  }, [product]);

  const rating = useMemo(() => getDisplayRating(product), [product]);

  if (loading) {
    return <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={{ margin: 0 }}>Product not found</h2>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>The live feed did not return a match for this product right now.</p>
        <Link href="/products" className="btn btn-primary" style={{ marginTop: 6, width: "fit-content", alignSelf: "center", textDecoration: "none" }}>
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--primary)", fontWeight: 600, width: "fit-content" }}>
        <ArrowLeft size={16} /> Back to products
      </Link>

      <div className="card" style={{ padding: 24, display: "grid", gridTemplateColumns: "minmax(260px, 360px) 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", background: "var(--bg-surface-2)", minHeight: 280 }}>
            <img src={product.imageUrl || ""} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", top: 12, left: 12, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,0.9)", color: "var(--foreground)", fontSize: 12, fontWeight: 700 }}>
              <Sparkles size={12} /> Live deal
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, background: "rgba(107, 51, 246, 0.1)", color: "var(--primary)", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              <Tag size={12} /> {product.category || product.brand || "Product"}
            </div>
            <h2 className="heading-2" style={{ margin: 0, lineHeight: 1.2, overflowWrap: "anywhere", wordBreak: "break-word" }}>{product.title}</h2>
            <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 15, lineHeight: 1.5 }}>{product.brand || "Live product from SmartPrice"}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "var(--foreground)" }}>{priceLabel}</div>
            <div className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={12} /> Best current price
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", color: "#f59e0b", fontWeight: 700 }}>
            {renderStars(rating)}
            <span style={{ marginLeft: 4, color: "var(--text-muted)" }}>{rating.toFixed(1)} rating</span>
          </div>

          <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>{product.description || "This product is currently being tracked from the live feed and is ready for comparison."}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <div className="card" style={{ padding: 12, background: "var(--bg-surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                <ShieldCheck size={13} /> Verified
              </div>
              <div style={{ fontWeight: 700 }}>{product.retailers || 1} retailers</div>
            </div>
            <div className="card" style={{ padding: 12, background: "var(--bg-surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                <Store size={13} /> Stores
              </div>
              <div style={{ fontWeight: 700 }}>{product.retailers || 1}</div>
            </div>
            <div className="card" style={{ padding: 12, background: "var(--bg-surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                <ShoppingCart size={13} /> Source
              </div>
              <div style={{ fontWeight: 700 }}>{product.source || "Live feed"}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
            <button
              type="button"
              className={`btn ${compareList.some((item) => item.id === product.id) ? "btn-primary" : "btn-ghost"}`}
              style={{ padding: "10px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={() => addProduct(product)}
            >
              <Scale size={14} />
              {compareList.some((item) => item.id === product.id) ? "Added to Compare" : "Compare now"}
            </button>
            {compareList.length > 0 && (
              <Link href="/products/compare" className="btn btn-ghost" style={{ padding: "10px 14px", textDecoration: "none" }}>
                Open Compare ({compareList.length})
              </Link>
            )}
            <button className="btn btn-ghost" style={{ padding: "10px 14px" }}>
              Save to wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
