"use client";

import { useState, useEffect, useCallback } from "react";

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [newProduct, setNewProduct] = useState({
    title: "",
    brand: "",
    category: "Electronics",
    price: "",
    imageUrl: "",
    description: "",
    sourceWebsite: "Amazon",
    rating: "",
  });

  const fetchProducts = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
        if (data.products?.length > 0 && !selectedProduct) {
          setSelectedProduct(data.products[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setTimeout(() => fetchProducts(val), 300);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price) || 0,
          rating: parseFloat(newProduct.rating) || 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Product added successfully!", type: "success" });
        setShowAddForm(false);
        setNewProduct({ title: "", brand: "", category: "Electronics", price: "", imageUrl: "", description: "", sourceWebsite: "Amazon", rating: "" });
        fetchProducts(search);
      } else {
        setMessage({ text: data.error || "Failed to add product", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Delete this product and all its price entries?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setMessage({ text: "Product deleted", type: "success" });
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setSelectedProduct(null);
      }
    } catch {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const categories = ["Electronics", "Computing", "Appliances", "Audio", "Mobile", "Gaming", "Photography", "Home"];
  const stores = ["Amazon", "Walmart", "Best Buy", "Target", "B&H Photo", "Newegg"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
      {/* Product List */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Products</h3>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {products.length} products in database
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Search products..."
              className="input"
              style={{ width: 200, height: 32, fontSize: 12 }}
              value={search}
              onChange={handleSearch}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddForm(true)}
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Toast */}
        {message.text && (
          <div
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              marginBottom: 14,
              fontSize: 12,
              fontWeight: 600,
              background: message.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: message.type === "success" ? "var(--success)" : "var(--danger)",
              border: `1px solid ${message.type === "success" ? "var(--success)" : "var(--danger)"}`,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Add Product Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddProduct}
            style={{
              background: "var(--bg-surface-2)",
              border: "1px solid var(--primary)",
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Add New Product</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label className="input-label" style={{ fontSize: 9 }}>PRODUCT TITLE *</label>
                <input required className="input" style={{ height: 34, fontSize: 12 }} value={newProduct.title} onChange={e => setNewProduct(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Sony WH-1000XM5" />
              </div>
              <div>
                <label className="input-label" style={{ fontSize: 9 }}>BRAND</label>
                <input className="input" style={{ height: 34, fontSize: 12 }} value={newProduct.brand} onChange={e => setNewProduct(p => ({ ...p, brand: e.target.value }))} placeholder="e.g. Sony" />
              </div>
              <div>
                <label className="input-label" style={{ fontSize: 9 }}>CATEGORY</label>
                <select className="input" style={{ height: 34, fontSize: 12, padding: "0 8px" }} value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label" style={{ fontSize: 9 }}>BASE PRICE ($)</label>
                <input type="number" step="0.01" className="input" style={{ height: 34, fontSize: 12 }} value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <label className="input-label" style={{ fontSize: 9 }}>SOURCE STORE</label>
                <select className="input" style={{ height: 34, fontSize: 12, padding: "0 8px" }} value={newProduct.sourceWebsite} onChange={e => setNewProduct(p => ({ ...p, sourceWebsite: e.target.value }))}>
                  {stores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label" style={{ fontSize: 9 }}>RATING (0-5)</label>
                <input type="number" step="0.1" min="0" max="5" className="input" style={{ height: 34, fontSize: 12 }} value={newProduct.rating} onChange={e => setNewProduct(p => ({ ...p, rating: e.target.value }))} placeholder="4.5" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="input-label" style={{ fontSize: 9 }}>IMAGE URL</label>
                <input className="input" style={{ height: 34, fontSize: 12 }} value={newProduct.imageUrl} onChange={e => setNewProduct(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="input-label" style={{ fontSize: 9 }}>DESCRIPTION</label>
                <textarea className="input" rows={2} style={{ fontSize: 12, resize: "vertical", padding: "8px" }} value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} placeholder="Product description..." />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading}>{actionLoading ? "Adding..." : "Add Product"}</button>
            </div>
          </form>
        )}

        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
            Loading products...
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>
                <th style={{ paddingBottom: 10, fontWeight: 600 }}>PRODUCT</th>
                <th style={{ paddingBottom: 10, fontWeight: 600 }}>CATEGORY</th>
                <th style={{ paddingBottom: 10, fontWeight: 600 }}>BRAND</th>
                <th style={{ paddingBottom: 10, fontWeight: 600, textAlign: "right" }}>BASE PRICE</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                    No products found. Visit /dashboard to seed data, or add products above.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      fontSize: 13,
                      cursor: "pointer",
                      background: selectedProduct?.id === p.id ? "var(--bg-surface-2)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: "var(--bg-surface-2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            overflow: "hidden",
                          }}
                        >
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : "📦"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.title}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                            ⭐ {p.rating} • {p.sourceWebsite || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 0" }}>
                      <span className="badge badge-primary" style={{ fontSize: 8 }}>
                        {p.category?.toUpperCase() || "MISC"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 0", color: "var(--text-secondary)" }}>
                      {p.brand || "—"}
                    </td>
                    <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 600 }}>
                      ${p.price?.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Product Detail Panel */}
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, height: "calc(100vh - 120px)", overflowY: "auto" }}>
        {selectedProduct ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)" }}>Product Details</span>
              <span className="badge badge-success" style={{ fontSize: 8 }}>ACTIVE</span>
            </div>

            {selectedProduct.imageUrl && (
              <div style={{ height: 140, borderRadius: 8, overflow: "hidden" }}>
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>{selectedProduct.title}</h4>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                {selectedProduct.brand && `Brand: ${selectedProduct.brand}`}
                {selectedProduct.category && ` • Category: ${selectedProduct.category}`}
              </div>
              {selectedProduct.description && (
                <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  {selectedProduct.description}
                </p>
              )}
            </div>

            {/* Price Stats */}
            <div style={{ background: "var(--bg-surface-2)", padding: 12, borderRadius: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 8, color: "var(--text-muted)" }}>BASE PRICE</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>${selectedProduct.price?.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 8, color: "var(--text-muted)" }}>RATING</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>⭐ {selectedProduct.rating}</div>
                </div>
              </div>
            </div>

            {/* Live Price Entries */}
            {selectedProduct.priceEntries?.length > 0 && (
              <div>
                <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                  LIVE RETAILER PRICES
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {selectedProduct.priceEntries.slice(0, 5).map((entry, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, padding: 8, background: "var(--bg-surface-2)", borderRadius: 6 }}>
                      <span style={{ fontWeight: 600 }}>{entry.store?.name}</span>
                      <span style={{ fontWeight: 700 }}>${entry.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specs */}
            {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
              <div>
                <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                  SPECIFICATIONS
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                  {Object.entries(selectedProduct.specs).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                      <span style={{ color: "var(--text-muted)" }}>{k}</span>
                      <span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ flex: 1, color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.2)" }}
                disabled={actionLoading}
                onClick={() => handleDeleteProduct(selectedProduct.id)}
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 13 }}>Select a product to view details</div>
          </div>
        )}
      </div>
    </div>
  );
}
