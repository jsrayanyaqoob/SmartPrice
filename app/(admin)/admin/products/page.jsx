"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const searchTimeoutRef = useRef(null);
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
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchProducts(val), 300);
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
    <div className="admin-products-layout">
      {/* Product List */}
      <div className="card admin-fade-in" style={{ padding: 20 }}>
        <div className="admin-products-header">
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>Products</h3>
            <span className="admin-products-count">{products.length} products in database</span>
          </div>
          <div className="admin-products-actions">
            <div className="search-wrapper">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" className="search-icon">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={handleSearch}
                className="admin-search-input"
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
              + Add Product
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                const esc = (s) => String(s || "").replace(/"/g, '""');
                const csv = ["Title,Brand,Category,Price,Rating\n"].concat(
                  products.map(p => `"${esc(p.title)}","${esc(p.brand)}","${esc(p.category)}",${p.price || 0},${p.rating || 0}`)
                ).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "smartprice-products.csv"; a.click();
                URL.revokeObjectURL(url);
              }}
              disabled={products.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Toast */}
        {message.text && (
          <div className={`toast toast-${message.type}`}>{message.text}</div>
        )}

        {/* Add Product Form */}
        {showAddForm && (
          <form onSubmit={handleAddProduct} className="add-product-form">
            <div className="add-product-header">
              <span className="add-product-title">Add New Product</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
            <div className="add-product-grid">
              <div className="form-field">
                <label className="form-label">Product Title *</label>
                <input required value={newProduct.title} onChange={e => setNewProduct(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Sony WH-1000XM5" />
              </div>
              <div className="form-field">
                <label className="form-label">Brand</label>
                <input value={newProduct.brand} onChange={e => setNewProduct(p => ({ ...p, brand: e.target.value }))} placeholder="e.g. Sony" />
              </div>
              <div className="form-field">
                <label className="form-label">Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Base Price ($)</label>
                <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="form-field">
                <label className="form-label">Source Store</label>
                <select value={newProduct.sourceWebsite} onChange={e => setNewProduct(p => ({ ...p, sourceWebsite: e.target.value }))}>
                  {stores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Rating (0-5)</label>
                <input type="number" step="0.1" min="0" max="5" value={newProduct.rating} onChange={e => setNewProduct(p => ({ ...p, rating: e.target.value }))} placeholder="4.5" />
              </div>
              <div className="form-field form-field-full">
                <label className="form-label">Image URL</label>
                <input value={newProduct.imageUrl} onChange={e => setNewProduct(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="form-field form-field-full">
                <label className="form-label">Description</label>
                <textarea rows={3} value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} placeholder="Product description..." />
              </div>
            </div>
            <div className="add-product-footer">
              <button type="submit" className="btn btn-gradient" disabled={actionLoading} style={{ height: 38 }}>
                {actionLoading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="table-empty">Loading products...</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>BRAND</th>
                  <th className="text-right">BASE PRICE</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-empty">No products found. Add products above.</td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`product-row ${selectedProduct?.id === p.id ? "selected" : ""}`}
                    >
                      <td>
                        <div className="product-cell">
                          <div className="product-thumb">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt="" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>
                          <div>
                            <div className="product-name">{p.title}</div>
                            <div className="product-meta">⭐ {p.rating} · {p.sourceWebsite || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: 8 }}>{p.category?.toUpperCase() || "MISC"}</span>
                      </td>
                      <td className="text-secondary">{p.brand || "—"}</td>
                      <td className="text-right product-price">${p.price?.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Detail Panel */}
      <div className="card product-detail-panel admin-fade-in-delay-1">
        {selectedProduct ? (
          <>
            <div className="detail-header">
              <span className="detail-label">Product Details</span>
              <span className="badge badge-success" style={{ fontSize: 8 }}>ACTIVE</span>
            </div>

            {selectedProduct.imageUrl && (
              <div className="detail-image"><img src={selectedProduct.imageUrl} alt={selectedProduct.title} loading="lazy" decoding="async" /></div>
            )}

            <div>
              <h4 className="detail-title">{selectedProduct.title}</h4>
              <div className="detail-meta">
                {selectedProduct.brand && <>Brand: {selectedProduct.brand}</>}
                {selectedProduct.category && <> · Category: {selectedProduct.category}</>}
              </div>
              {selectedProduct.description && (
                <p className="detail-desc">{selectedProduct.description}</p>
              )}
            </div>

            <div className="detail-stats">
              <div className="detail-stat">
                <div className="detail-stat-label">BASE PRICE</div>
                <div className="detail-stat-value" style={{ color: "var(--primary)" }}>${selectedProduct.price?.toFixed(2)}</div>
              </div>
              <div className="detail-stat">
                <div className="detail-stat-label">RATING</div>
                <div className="detail-stat-value">⭐ {selectedProduct.rating}</div>
              </div>
              <div className="detail-stat">
                <div className="detail-stat-label">SOURCE</div>
                <div className="detail-stat-value" style={{ fontSize: 12 }}>{selectedProduct.sourceUrl || "N/A"}</div>
              </div>
            </div>

            {selectedProduct.priceEntries?.length > 0 && (
              <div>
                <div className="detail-section-title">LIVE RETAILER PRICES</div>
                <div className="price-entries">
                  {selectedProduct.priceEntries.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="price-entry">
                      <span className="price-entry-store">{entry.store?.name || entry.storeName}</span>
                      <span className="price-entry-amount">${entry.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
              <div>
                <div className="detail-section-title">SPECIFICATIONS</div>
                <div className="specs-list">
                  {Object.entries(selectedProduct.specs).map(([k, v]) => (
                    <div key={k} className="spec-row">
                      <span className="spec-key">{k}</span>
                      <span className="spec-value">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.2)", marginTop: "auto" }}
              disabled={actionLoading}
              onClick={() => handleDeleteProduct(selectedProduct.id)}
            >
              Delete Product
            </button>
          </>
        ) : (
          <div className="detail-empty">
            <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 13 }}>Select a product to view details</div>
          </div>
        )}
      </div>


    </div>
  );
}
