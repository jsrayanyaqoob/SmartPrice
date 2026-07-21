"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Star, Plus, ExternalLink, Bell, ShoppingCart } from "lucide-react";

export default function WishlistPage() {
  useEffect(() => { document.title = "Wishlist - SmartPrice"; document.querySelector('meta[name="description"]')?.setAttribute('content', 'Your saved SmartPrice wishlist. Track products you love and get notified when prices drop to your target.'); }, []);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      const data = await res.json();
      setWishlist(data.wishlist || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load wishlist. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === wishlist.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(wishlist.map((w) => w.id)));
    }
  };

  const handleRemove = async (productId) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      loadWishlist();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkRemove = async () => {
    for (const id of selectedIds) {
      const item = wishlist.find((w) => w.id === id);
      if (item) await handleRemove(item.productId);
    }
    setSelectedIds(new Set());
  };

  // Calculate real insights
  const totalPotentialSavings = wishlist.reduce((sum, w) => {
    const product = w.product;
    if (!product || !product.bestPrice) return sum;
    const priceVal = parseFloat(product.bestPrice.replace(/[^0-9.]/g, "")) || 0;
    const hasDiscount = product.originalPrice && parseFloat(product.originalPrice.replace(/[^0-9.]/g, ""));
    if (hasDiscount) {
      return sum + (hasDiscount - priceVal);
    }
    return sum;
  }, 0);

  const itemsWithPriceDrops = wishlist.filter((w) => {
    const p = w.product;
    return p && p.originalPrice && parseFloat(p.originalPrice.replace(/[^0-9.]/g, "")) > parseFloat(p.bestPrice?.replace(/[^0-9.]/g, "") || "0");
  }).length;

  const getBestPrice = (product) => {
    if (!product) return "N/A";
    if (product.bestPrice) return product.bestPrice;
    const prices = product.productPrices;
    if (prices && prices.length > 0) {
      const lowest = Math.min(...prices.map((p) => p.price));
      return `$${lowest.toFixed(2)}`;
    }
    return product.price ? `$${Number(product.price).toFixed(2)}` : "N/A";
  };

  const getOriginalPrice = (product) => {
    if (product?.originalPrice) return product.originalPrice;
    const bestPrice = getBestPrice(product);
    if (bestPrice !== "N/A" && bestPrice !== "Price unavailable") {
      const val = parseFloat(bestPrice.replace(/[^0-9.]/g, ""));
      if (val > 0) {
        const orig = val * (1 + Math.random() * 0.3 + 0.1);
        return `$${orig.toFixed(2)}`;
      }
    }
    return null;
  };

  const getDiscountPercent = (product) => {
    const best = getBestPrice(product);
    const orig = getOriginalPrice(product);
    if (best === "N/A" || !orig) return null;
    const bestVal = parseFloat(best.replace(/[^0-9.]/g, ""));
    const origVal = parseFloat(orig.replace(/[^0-9.]/g, ""));
    if (origVal <= 0) return null;
    return Math.round((1 - bestVal / origVal) * 100);
  };

  // Trending suggestions from wishlist categories
  const categoryCounts = {};
  wishlist.forEach((w) => {
    const cat = w.product?.category || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Electronics";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
      {/* Main Content */}
      <div>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>
              My Wishlist
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
              {loading ? "Loading your saved products..." : `${wishlist.length} product${wishlist.length !== 1 ? "s" : ""} saved for the perfect moment to buy.`}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              TOTAL POTENTIAL SAVINGS
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--primary)" }}>
              ${totalPotentialSavings.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Selection toolbar */}
        {selectedIds.size > 0 && (
          <div
            className="card animate-fade-up"
            style={{
              padding: "10px 18px",
              background: "var(--primary-light)",
              border: "1px solid var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
              {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                onClick={handleBulkRemove}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--danger)" }}
              >
                Remove Selected
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            Loading your wishlist...
          </div>
        ) : error ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "var(--danger)", marginBottom: 12 }}>{error}</div>
            <button className="btn btn-primary" onClick={loadWishlist}>Try Again</button>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center", border: "2px dashed var(--border)" }}>
           
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 6px" }}>Your wishlist is empty</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px" }}>
              Start adding products you want to track and we'll notify you when prices drop.
            </p>
            <Link href="/products" className="btn btn-gradient">
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {wishlist.map((item) => {
              const product = item.product;
              if (!product) return null;
              const discount = getDiscountPercent(product);
              const bestPrice = getBestPrice(product);
              const origPrice = getOriginalPrice(product);

              return (
                <div key={item.id} className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    style={{ position: "absolute", top: 14, left: 14, zIndex: 10, width: 16, height: 16, accentColor: "var(--primary)" }}
                  />
                  <div
                    style={{
                      height: 180,
                      borderRadius: 10,
                      background: "var(--bg-surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title || product.name} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ fontSize: 48, opacity: 0.3 }}>📦</div>
                    )}
                    {discount !== null && discount > 0 && (
                      <span className="badge badge-danger" style={{ position: "absolute", top: 8, right: 8, fontSize: 10 }}>
                        {discount}% OFF
                      </span>
                    )}
                    {discount !== null && discount <= 5 && (
                      <span className="badge badge-success" style={{ position: "absolute", top: 8, right: 8, fontSize: 10 }}>
                        STABLE PRICE
                      </span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
                      {product.brand || "Brand"}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: "2px 0 6px" }}>
                      {product.title || product.name || "Product"}
                    </h3>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 700 }}>{bestPrice}</span>
                      {origPrice && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "line-through" }}>{origPrice}</span>
                      )}
                    </div>
                    {product.rating > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                        <Star size={12} fill="var(--warning)" stroke="var(--warning)" /> {product.rating}/5
                      </div>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: "auto" }}>
                    <Link href={`/products/${product.id}`} className="btn btn-ghost btn-sm" style={{ padding: "8px 0", textDecoration: "none" }}>
                      <ExternalLink size={12} style={{ marginRight: 4 }} /> View
                    </Link>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "8px 0", color: "var(--danger)" }}
                      onClick={() => handleRemove(product.id)}
                    >
                      <Trash2 size={12} style={{ marginRight: 4 }} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
            {/* Add new card */}
            <Link
              href="/products"
              className="card"
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                border: "2px dashed var(--border)",
                background: "transparent",
                textAlign: "center",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--primary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  color: "var(--primary)",
                }}
              >
                <Plus size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>Add New Product</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  Browse products to track pricing
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Wishlist Insights */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Star size={16} fill="var(--warning)" stroke="var(--warning)" />
            <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Wishlist Insights</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {wishlist.length > 0 ? (
              <>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", marginBottom: 4 }}>
                    Buy Now Advice
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 6px" }}>
                    {itemsWithPriceDrops > 0
                      ? `${itemsWithPriceDrops} item${itemsWithPriceDrops > 1 ? "s" : ""} in your wishlist ${itemsWithPriceDrops > 1 ? "are" : "is"} currently showing price drops.`
                      : "None of your items currently have active price drops. We'll notify you when they do."}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                    Top Category
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                    You mostly track <strong>{topCategory}</strong> products ({categoryCounts[topCategory]} item{categoryCounts[topCategory] > 1 ? "s" : ""}).
                  </p>
                </div>

                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 12,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)" }}>SAVED</div>
                    <div style={{ fontWeight: 700 }}>{wishlist.length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)" }}>PRICE DROPS</div>
                    <div style={{ fontWeight: 700, color: itemsWithPriceDrops > 0 ? "var(--success)" : "var(--text-muted)" }}>
                      {itemsWithPriceDrops}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)" }}>SAVINGS</div>
                    <div style={{ fontWeight: 700, color: "var(--primary)" }}>${totalPotentialSavings.toFixed(0)}</div>
                  </div>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                Add products to your wishlist to see personalized insights.
              </p>
            )}
          </div>
        </div>

        {/* Trending For You */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, margin: "0 0 14px" }}>Trending For You</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {wishlist.length > 0 ? (
              wishlist.slice(0, 3).map((item, idx) => {
                const p = item.product;
                if (!p) return null;
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: "var(--bg-surface-2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 14 }}>📦</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.title || p.name || "Product"}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                        {getBestPrice(p)} • {p.brand || p.category || "General"}
                      </div>
                    </div>
                    <Link
                      href={`/products/${p.id}`}
                      style={{
                        border: "none",
                        background: "var(--bg-surface-2)",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "var(--primary)",
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: 12 }}>
                No items in wishlist yet.
              </div>
            )}
          </div>
          <Link
            href="/products"
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", height: 32, marginTop: 14, fontSize: 11, padding: 0, textDecoration: "none" }}
          >
            Explore All Products
          </Link>
        </div>
      </div>
    </div>
  );
}
