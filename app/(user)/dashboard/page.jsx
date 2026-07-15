"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Trash2, Star, Sparkles, RefreshCw, HelpCircle, AlertCircle } from "lucide-react";

export default function UserDashboard() {
  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Compare zone state
  const [compareList, setCompareList] = useState([]);
  const [showMatrix, setShowMatrix] = useState(true);

  // Budget AI planner state
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("Home Office Setup");
  const [strategyGenerated, setStrategyGenerated] = useState(false);
  const [strategyOutput, setStrategyOutput] = useState("");

  // Load products from API
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        // Load AI recommendations from localStorage (set by AI Assistant page)
        try {
          const stored = localStorage.getItem("smartprice-ai-recommendations");
          if (stored) {
            const parsed = JSON.parse(stored);
            // Only use if less than 24 hours old
            if (parsed.products && parsed.timestamp && Date.now() - parsed.timestamp < 86400000) {
              setRecommendedProducts(parsed.products);
            } else {
              setRecommendedProducts([]);
            }
          } else {
            setRecommendedProducts([]);
          }
        } catch (e) {
          setRecommendedProducts([]);
        }
        if (data.products.length >= 2) {
          setCompareList(data.products.slice(0, 2));
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Using offline backup.");
      // Fallback fallback products if backend has issues
      const fallback = [
        {
          id: "sony-wh-1000xm5",
          title: "Sony WH-1000XM5",
          name: "Sony WH-1000XM5",
          brand: "Sony",
          category: "Electronics",
          imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop",
          description: "Industry leading noise canceling wireless headphones.",
          price: 348.0,
          bestPrice: "$298.00",
          originalPrice: "$399.00",
          savings: "$101.00",
          rating: 4.8,
          bestStore: "Amazon",
          specs: { "Noise Cancelling": "Industry Leading", "Battery Life": "30 Hours", "Bluetooth": "v5.2" }
        },
        {
          id: "macbook-pro-14-m3",
          title: "MacBook Pro 14\" M3",
          name: "MacBook Pro 14\" M3",
          brand: "Apple",
          category: "Computing",
          imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop",
          description: "Supercharged by Apple M3 processor.",
          price: 1599.0,
          bestPrice: "$1549.00",
          originalPrice: "$1799.00",
          savings: "$250.00",
          rating: 4.9,
          bestStore: "Best Buy",
          specs: { "Processor": "Apple M3", "RAM": "16GB", "Display": "14-inch XDR" }
        }
      ];
      setProducts(fallback);
      setRecommendedProducts([]);
      setCompareList(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle drag operations
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // Draggable pool to comparison zone
    if (source.droppableId === "products-pool" && destination.droppableId === "comparison-zone") {
      const draggedProduct = products[source.index];
      if (!compareList.some((p) => p.id === draggedProduct.id)) {
        if (compareList.length < 4) {
          setCompareList([...compareList, draggedProduct]);
        } else {
          // Replace the slot where it is dropped
          const targetIndex = destination.index;
          const newList = [...compareList];
          newList[targetIndex < 4 ? targetIndex : 3] = draggedProduct;
          setCompareList(newList);
        }
      }
    }

    // Reordering inside comparison zone
    if (source.droppableId === "comparison-zone" && destination.droppableId === "comparison-zone") {
      const items = Array.from(compareList);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setCompareList(items);
    }
  };

  // Add a product to the comparison zone directly via button
  const addToCompare = (product) => {
    if (compareList.some((p) => p.id === product.id)) return;
    if (compareList.length < 4) {
      setCompareList([...compareList, product]);
    } else {
      // Replace the first item if full
      const newList = [...compareList];
      newList[0] = product;
      setCompareList(newList);
    }
  };

  // Remove a product from the comparison zone
  const removeFromCompare = (productId) => {
    setCompareList(compareList.filter((p) => p.id !== productId));
  };

  const getRecommendedProducts = (replyText) => {
    if (!products.length) return [];

    const stopWords = new Set([
      "the","and","for","with","your","buying","budget","plan","best","value","look","where","what","from","into","that","this","will","should","very","more","less","high","low","good","great","offer","offers"
    ]);

    const text = `${category} ${replyText || ""}`.toLowerCase();
    const keywords = Array.from(
      new Set(
        text
          .split(/[^a-z0-9]+/)
          .filter(Boolean)
          .filter((word) => word.length > 2 && !stopWords.has(word))
      )
    ).slice(0, 8);

    const scored = products
      .map((product) => {
        const haystack = `${product.title || ""} ${product.name || ""} ${product.brand || ""} ${product.category || ""} ${product.description || ""}`.toLowerCase();
        let score = 0;

        keywords.forEach((keyword) => {
          if (haystack.includes(keyword)) score += 3;
          if ((product.category || "").toLowerCase().includes(keyword)) score += 2;
          if ((product.brand || "").toLowerCase().includes(keyword)) score += 2;
        });

        if ((product.category || "").toLowerCase().includes(category.toLowerCase())) score += 2;
        return { product, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length >= 1) {
      return scored.slice(0, 4).map((item) => item.product);
    }

    const categoryMatches = products.filter((product) => (product.category || "").toLowerCase().includes(category.toLowerCase()));
    if (categoryMatches.length) {
      return categoryMatches.slice(0, 4);
    }

    return products.slice(0, 4);
  };

  // Generate strategy
  const handleGenerateStrategy = async (e) => {
    e.preventDefault();
    if (!budget) return;

    setStrategyGenerated(true);
    setStrategyOutput("Generating a budget plan with Gemini...");

    try {
      const prompt = `You are SmartPrice AI. Give a concise, practical shopping budget plan for a user buying ${category} with a total budget of $${budget}. Include: 1. A budget split, 2. What to prioritize, 3. A short buying strategy, 4. A note about where to look for best value. Keep it under 180 words.`;

      const res = await fetch("/api/ai/budget-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.reply) {
        setStrategyOutput(data.reply);
        const aiRecommendations = getRecommendedProducts(data.reply);
        setRecommendedProducts(aiRecommendations);
        // Save to localStorage so recommendations persist across pages
        try {
          localStorage.setItem(
            "smartprice-ai-recommendations",
            JSON.stringify({
              products: aiRecommendations,
              timestamp: Date.now(),
              source: "dashboard-planner",
              category: category,
            })
          );
        } catch (e) {
          console.error("Failed to save recommendations:", e);
        }
      } else {
        setStrategyOutput("Gemini is unavailable right now. Please try again in a moment.");
      }
    } catch (err) {
      console.error(err);
      setStrategyOutput("Gemini request failed. Please check the API key or try again later.");
    }
  };

  // Dynamically extract all distinct spec keys from the current comparison list
  const getUniqueSpecKeys = () => {
    const keys = new Set();
    compareList.forEach((product) => {
      if (product.specs && typeof product.specs === "object") {
        Object.keys(product.specs).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  };

  // Helper to extract a numeric value for comparison highlights
  const parsePrice = (priceStr) => {
    if (typeof priceStr === "number") return priceStr;
    return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 24, width: "100%", overflowX: "hidden" }}>
        
        {/* Main Content Pane */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          
          {/* KPI Dashboard Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
            {[
              { label: "Total Saved", value: "$1,342.90", icon: "👛", color: "var(--success)" },
              { label: "Tracked Items", value: `${products.length * 3} Items`, icon: "📊", color: "var(--info)" },
              { label: "Active Alerts", value: "8 Alerts", icon: "⏰", color: "var(--warning)" },
              { label: "Compare Matrix", value: `${compareList.length}/4 Active`, icon: "⚔️", color: "var(--primary)" },
            ].map((kpi, idx) => (
              <div key={idx} className="stat-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "var(--bg-surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {kpi.icon}
                </div>
                <div>
                  <div className="stat-label">{kpi.label}</div>
                  <div className="stat-value" style={{ fontSize: 20 }}>
                    {kpi.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flash AI Deals Section */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
              <h3 className="heading-3" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={18} style={{ color: "var(--primary)" }} />
                Flash AI Deals
              </h3>
              <button 
                onClick={loadProducts}
                style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 13, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontWeight: 600 }}
              >
                <RefreshCw size={13} /> Refresh Live Prices
              </button>
            </div>

            {loading ? (
              <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                Fetching real-time deals...
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
                {products.slice(0, 8).map((p, idx) => {
                  const previewTitle = (p.title || p.name || "Product").length > 28
                    ? `${(p.title || p.name || "Product").slice(0, 28)}...`
                    : (p.title || p.name || "Product");

                  return (
                    <div key={p.id} className="card" style={{ padding: 12, display: "flex", gap: 12, alignItems: "flex-start" }}>
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title || p.name || "Product"}
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: 8,
                            objectFit: "cover",
                            background: "var(--bg-surface-2)",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div style={{ width: 72, height: 72, borderRadius: 8, background: "var(--bg-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📦</div>
                      )}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="badge badge-danger" style={{ fontSize: 9 }}>
                            {idx === 0 ? "BEST" : "HOT"}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Live</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{previewTitle}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.brand || p.category || "Live deal"}</div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{p.bestPrice || `$${Number(p.value || 0).toFixed(2)}`}</div>
                        <Link href={`/products/${p.id}`} className="btn btn-ghost btn-sm" style={{ width: "fit-content", padding: "4px 8px", fontSize: 11, textDecoration: "none" }}>
                          Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Curated (Droppable Pool) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
              <h3 className="heading-3" style={{ margin: 0 }}>
                AI Curated For You
              </h3>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Drag any card below into the dashed slots to compare
              </span>
            </div>

            {loading ? (
              <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                Loading AI intelligence curation...
              </div>
            ) : recommendedProducts.length === 0 ? (
              <div className="card" style={{ padding: 20, color: "var(--text-muted)", textAlign: "center" }}>
                No AI recommendations yet. Recommended picks will appear here once the AI suggests them.
              </div>
            ) : (
              <Droppable droppableId="products-pool" isDropDisabled={true}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}
                  >
                    {recommendedProducts.map((p, idx) => {
                      const previewTitle = (p.title || p.name || "Product").length > 28
                        ? `${(p.title || p.name || "Product").slice(0, 28)}...`
                        : (p.title || p.name || "Product");
                      const displayPrice = p.bestPrice || `$${Number(p.price || 0).toFixed(2)}`;
                      const displayStore = p.bestStore || p.brand || "Store";
                      const starValue = p.rating || p.stars || 4.6;

                      return (
                        <Draggable key={p.id} draggableId={p.id} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="card"
                              style={{
                                padding: 10,
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                                minHeight: 190,
                                background: snapshot.isDragging ? "var(--primary-light)" : "var(--bg-surface)",
                                borderColor: snapshot.isDragging ? "var(--primary)" : "var(--border)",
                                boxShadow: snapshot.isDragging ? "0 8px 24px rgba(107, 51, 246, 0.15)" : "none",
                                cursor: "grab",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div style={{ position: "relative", height: 84, borderRadius: 8, overflow: "hidden", background: "var(--bg-surface-2)" }}>
                                <img
                                  src={p.imageUrl}
                                  alt={previewTitle}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                <span 
                                  className="badge badge-pro" 
                                  style={{ position: "absolute", top: 6, left: 6, fontSize: 8 }}
                                >
                                  ★ {starValue}
                                </span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                                <h4 style={{ fontSize: 12, fontWeight: 600, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {previewTitle}
                                </h4>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {p.brand || p.category || "Live deal"}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
                                  <span style={{ fontWeight: 700, fontSize: 13 }}>{displayPrice}</span>
                                  <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {displayStore}
                                  </span>
                                </div>
                              </div>
                              <button 
                                className="btn btn-ghost btn-sm" 
                                style={{ padding: "5px 8px", fontSize: 11, width: "100%" }}
                                onClick={() => addToCompare(p)}
                              >
                                Compare
                              </button>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>

          {/* Smart Compare Zone (Droppable Slot Matrix) */}
          <div className="card" style={{ padding: 20, border: "2px dashed var(--primary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Smart Compare Zone</h3>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                  Drag items in, or drag to reorder. Maximum 4 products.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {compareList.length > 0 && (
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => setCompareList([])}
                    style={{ fontSize: 11, padding: "4px 8px" }}
                  >
                    Clear All
                  </button>
                )}
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => setShowMatrix(!showMatrix)}
                  disabled={compareList.length === 0}
                  style={{ fontSize: 11, padding: "4px 12px" }}
                >
                  {showMatrix ? "Hide Matrix" : "Compare Specs"}
                </button>
              </div>
            </div>

            <Droppable droppableId="comparison-zone" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 12,
                    minHeight: 100,
                    background: snapshot.isDraggingOver ? "rgba(107, 51, 246, 0.04)" : "transparent",
                    padding: 8,
                    borderRadius: 8,
                  }}
                >
                  {compareList.map((product, index) => (
                    <Draggable key={`compare-${product.id}`} draggableId={`compare-${product.id}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="card"
                          style={{
                            padding: 10,
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            background: snapshot.isDragging ? "var(--primary-light)" : "var(--bg-surface-2)",
                            border: "1px solid var(--border)",
                            textAlign: "center",
                            cursor: "grab",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <button
                            onClick={() => removeFromCompare(product.id)}
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "var(--danger)",
                              border: "none",
                              borderRadius: "50%",
                              width: 18,
                              height: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: 10,
                            }}
                          >
                            ×
                          </button>
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, marginBottom: 6 }}
                          />
                          <div 
                            style={{ 
                              fontSize: 11, 
                              fontWeight: 600, 
                              whiteSpace: "nowrap", 
                              overflow: "hidden", 
                              textOverflow: "ellipsis", 
                              width: "100%" 
                            }}
                          >
                            {product.title}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>{product.bestPrice}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {/* Empty slots placeholders */}
                  {Array.from({ length: Math.max(0, 4 - compareList.length) }).map((_, idx) => (
                    <div
                      key={`placeholder-${idx}`}
                      style={{
                        height: 96,
                        borderRadius: 8,
                        border: "2px dashed var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-muted)",
                        fontSize: 11,
                      }}
                    >
                      Drop Here
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Dynamic Comparison Matrix */}
          {showMatrix && compareList.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Product Comparison Matrix</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)", fontSize: 12, color: "var(--text-muted)" }}>
                      <th style={{ padding: "10px 8px", width: "160px" }}>SPECIFICATION</th>
                      {compareList.map((p) => (
                        <th key={`header-${p.id}`} style={{ padding: "10px 8px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <img src={p.imageUrl} alt={p.title} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)" }}>{p.title}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Brand Row */}
                    <tr style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--text-secondary)" }}>Brand</td>
                      {compareList.map((p) => (
                        <td key={`brand-${p.id}`} style={{ padding: "10px 8px", textAlign: "center" }}>
                          {p.brand}
                        </td>
                      ))}
                    </tr>

                    {/* Best Price Row (with green highlighting on lowest!) */}
                    <tr style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--text-secondary)" }}>Best Price Found</td>
                      {compareList.map((p) => {
                        const isLowest = parsePrice(p.bestPrice) === Math.min(...compareList.map(item => parsePrice(item.bestPrice)));
                        return (
                          <td key={`price-${p.id}`} style={{ padding: "10px 8px", textAlign: "center" }}>
                            {isLowest ? (
                              <span 
                                className="badge badge-success" 
                                style={{ fontSize: 12, fontWeight: 700, padding: "4px 8px" }}
                              >
                                {p.bestPrice} (Lowest)
                              </span>
                            ) : (
                              <span style={{ fontWeight: 600 }}>{p.bestPrice}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Store comparisons */}
                    <tr style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--text-secondary)" }}>Store Offers</td>
                      {compareList.map((p) => (
                        <td key={`stores-${p.id}`} style={{ padding: "10px 8px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                            {p.priceEntries && p.priceEntries.length > 0 ? (
                              p.priceEntries.map((entry, idx) => (
                                <div key={idx} style={{ fontSize: 11, display: "flex", gap: 6 }}>
                                  <span style={{ color: "var(--text-muted)" }}>{entry.store.name}:</span>
                                  <span style={{ fontWeight: 600 }}>${entry.price.toFixed(2)}</span>
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>No live quotes</div>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Rating Row */}
                    <tr style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--text-secondary)" }}>Rating</td>
                      {compareList.map((p) => (
                        <td key={`rating-${p.id}`} style={{ padding: "10px 8px", textAlign: "center" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                            <Star size={14} fill="var(--warning)" stroke="var(--warning)" />
                            {p.rating} / 5.0
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Dynamic Specs mapping */}
                    {getUniqueSpecKeys().map((specKey) => (
                      <tr key={specKey} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                        <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--text-secondary)" }}>
                          {specKey}
                        </td>
                        {compareList.map((p) => (
                          <td key={`spec-${specKey}-${p.id}`} style={{ padding: "10px 8px", textAlign: "center" }}>
                            {p.specs && p.specs[specKey] ? p.specs[specKey] : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Columns */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Continue Viewing Card */}
          <div className="card" style={{ padding: 16, background: "var(--primary-light)", borderColor: "transparent" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
              CONTINUE VIEWING
            </span>
            <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                🎧
              </div>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>Sony WH-1000XM5</h4>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  $298.00 • <span style={{ color: "var(--success)", fontWeight: 600 }}>Price Stable</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)", marginBottom: 12 }}>
              <span>Price Confidence</span>
              <span style={{ fontWeight: 600, color: "var(--primary)" }}>98% (Extremely High)</span>
            </div>
            <button 
              className="btn btn-primary btn-sm" 
              style={{ width: "100%", height: 32, background: "white", color: "var(--primary)" }}
              onClick={() => {
                const sony = products.find(p => p.id === "sony-wh-1000xm5" || p.slug === "sony-wh-1000xm5");
                if (sony) addToCompare(sony);
              }}
            >
              Resume Comparison
            </button>
          </div>

          {/* Budget AI Planner */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span>🤖</span>
              <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Budget AI Planner</h4>
            </div>
            <form onSubmit={handleGenerateStrategy} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="input-label" style={{ fontSize: 9 }}>
                  TARGET BUDGET
                </label>
                <input
                  type="number"
                  placeholder="e.g. $1,500"
                  className="input"
                  style={{ height: 36, fontSize: 13 }}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div>
                <label className="input-label" style={{ fontSize: 9 }}>
                  SHOPPING CATEGORY
                </label>
                <select
                  className="input"
                  style={{ height: 36, fontSize: 13, padding: "0 8px" }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Home Office Setup">Home Office Setup</option>
                  <option value="Gaming Rig">Gaming Rig</option>
                  <option value="Photography Kit">Photography Kit</option>
                  <option value="Travel Gear">Travel Gear</option>
                </select>
              </div>
              <button type="submit" className="btn btn-gradient btn-sm" style={{ height: 36, width: "100%" }}>
                ✨ Generate Strategy
              </button>
            </form>

            {strategyGenerated && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 8,
                  background: "var(--bg-surface-2)",
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                {strategyOutput}
              </div>
            )}
          </div>

          {/* Top Stores Panel */}
          <div className="card" style={{ padding: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Store Network Status</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "Amazon", label: "Crawled 2m ago", color: "var(--success)" },
                { name: "Walmart", label: "Crawled 5m ago", color: "var(--success)" },
                { name: "Best Buy", label: "Crawled 1m ago", color: "var(--success)" },
              ].map((s, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</div>
                  <span style={{ fontSize: 10, color: s.color, fontWeight: 500 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DragDropContext>
  );
}
