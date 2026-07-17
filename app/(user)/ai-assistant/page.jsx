"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Send, Mic, Camera, Clock, Star, HelpCircle, Tag } from "lucide-react";

// Match products from the API catalog based on AI reply text + user message
function matchProducts(products, replyText, userMessage) {
  if (!products.length) return [];

  const stopWords = new Set([
    "the","and","for","with","your","buying","budget","plan","best","value",
    "look","where","what","from","into","that","this","will","should","very",
    "more","less","high","low","good","great","offer","offers","want","need",
    "please","help","find","can","how","much","about","like","some","would",
    "could","just","also","any","get","make","give","around","under","over",
  ]);

  const text = `${userMessage || ""} ${replyText || ""}`.toLowerCase();
  const keywords = Array.from(
    new Set(
      text
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
        .filter((word) => word.length > 2 && !stopWords.has(word))
    )
  ).slice(0, 12);

  const scored = products
    .map((product) => {
      const haystack = `${product.title || ""} ${product.name || ""} ${product.brand || ""} ${product.category || ""} ${product.description || ""}`.toLowerCase();
      let score = 0;

      keywords.forEach((keyword) => {
        if (haystack.includes(keyword)) score += 3;
        if ((product.category || "").toLowerCase().includes(keyword)) score += 2;
        if ((product.brand || "").toLowerCase().includes(keyword)) score += 2;
        if ((product.title || "").toLowerCase().includes(keyword)) score += 1;
      });

      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length >= 1) {
    return scored.slice(0, 4).map((item) => item.product);
  }

  // Fallback: return first 4 products if nothing matched
  return products.slice(0, 4);
}

// Detect if user message is budget-related
function isBudgetQuery(text) {
  const budgetKeywords = [
    "budget", "spend", "afford", "price range", "cost", "money",
    "cheap", "expensive", "dollars", "under $", "within $", "max $",
    "buy", "shopping", "recommend", "suggestion", "best for",
    "looking for", "need", "want to get", "plan", "setup",
  ];
  const lower = text.toLowerCase();
  return budgetKeywords.some((kw) => lower.includes(kw));
}

// Extract budget amount from text
function extractBudget(text) {
  const match = text.match(/\$?\s?(\d[\d,]*(?:\.\d+)?)/);
  if (match) return match[1].replace(/,/g, "");
  return null;
}

// Extract category from text
function extractCategory(text) {
  const lower = text.toLowerCase();
  const categories = [
    { match: ["gaming", "game", "gamer"], value: "Gaming Rig" },
    { match: ["office", "work", "desk", "home office", "wfh"], value: "Home Office Setup" },
    { match: ["photo", "camera", "photography"], value: "Photography Kit" },
    { match: ["travel", "trip", "portable", "luggage"], value: "Travel Gear" },
    { match: ["headphone", "audio", "music", "speaker", "earbuds"], value: "Audio" },
    { match: ["laptop", "computer", "pc", "macbook"], value: "Computing" },
    { match: ["phone", "mobile", "smartphone", "iphone", "samsung"], value: "Phones" },
  ];
  for (const cat of categories) {
    if (cat.match.some((m) => lower.includes(m))) return cat.value;
  }
  return "Home Office Setup";
}

export default function AIAssistantPage() {
  useEffect(() => { document.title = "AI Assistant - SmartPrice"; document.querySelector('meta[name="description"]')?.setAttribute('content', 'Chat with SmartPrice AI Budget Planner. Get personalized shopping strategies, product recommendations, and budget plans.'); }, []);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your SmartPrice AI Budget Planner. Tell me your budget and what you're looking for — I'll find the best deals from our live catalog and create a personalized shopping strategy for you!",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch all products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setAllProducts(data.products || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }
    fetchProducts();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isThinking) return;

    const userText = inputVal.trim();
    const userMsg = { sender: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsThinking(true);

    try {
      if (isBudgetQuery(userText)) {
        // Budget-related query → call the budget planner API
        const budgetAmount = extractBudget(userText) || "500";
        const category = extractCategory(userText);

        const prompt = `You are SmartPrice AI. Give a concise, practical shopping budget plan for a user buying ${category} with a total budget of $${budgetAmount}. Include: 1. A budget split, 2. What to prioritize, 3. A short buying strategy, 4. A note about where to look for best value. Keep it under 180 words.`;

        const res = await fetch("/api/ai/budget-planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json();
        const replyText = data.reply || "Sorry, I couldn't generate a plan right now. Please try again.";

        // Match products from our catalog
        const recommended = matchProducts(allProducts, replyText, userText);

        // Save to localStorage for Dashboard "AI Curated For You"
        if (recommended.length > 0) {
          try {
            localStorage.setItem(
              "smartprice-ai-recommendations",
              JSON.stringify({
                products: recommended,
                timestamp: Date.now(),
                source: "ai-assistant",
                query: userText,
              })
            );
          } catch (e) {
            console.error("Failed to save recommendations:", e);
          }
        }

        // Add AI reply with product recommendations
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: replyText,
            recommendedProducts: recommended,
          },
        ]);
      } else {
        // Non-budget query → still use Gemini for a general SmartPrice answer
        const prompt = `You are SmartPrice AI assistant, a helpful shopping assistant. The user said: "${userText}". Give a helpful, concise response about shopping, products, or prices. If it seems like they want product recommendations, suggest they share their budget. Keep it under 100 words.`;

        const res = await fetch("/api/ai/budget-planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json();
        const replyText = data.reply || "I'm here to help! Try telling me your budget and what you're shopping for, and I'll create a personalized plan.";

        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: replyText },
        ]);
      }
    } catch (err) {
      console.error("AI request failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I had trouble connecting. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickAction = (chip) => {
    setInputVal(chip);
  };

  return (
    <div
      className="ai-assistant-wrapper"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      {/* Centered Chat Window Container */}
      <div
        className="card ai-chat-card"
        style={{
          width: "100%",
          maxWidth: 540,
          height: 650,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "white",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, rgba(107, 51, 246, 0.03), rgba(59, 91, 219, 0.03))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--brand-gradient)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🤖
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>SmartPrice AI Assistant</div>
              <div style={{ fontSize: 9, color: "var(--success)", display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
                ONLINE • Budget Planner Active
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="badge badge-pro" style={{ fontSize: 9, padding: "3px 8px" }}>
              <Sparkles size={10} /> AI Powered
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div style={{ flex: 1, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.sender === "user" ? "flex-end" : "flex-start",
                gap: 8,
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: m.sender === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  fontSize: 13,
                  lineHeight: 1.6,
                  maxWidth: "88%",
                  background: m.sender === "user" ? "var(--primary)" : "var(--bg-surface-2)",
                  color: m.sender === "user" ? "white" : "var(--text-primary)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </div>

              {/* Recommended Products Cards (inline in chat) */}
              {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                <div
                  style={{
                    width: "100%",
                    maxWidth: "88%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}>
                    <Sparkles size={12} /> AI Curated Products For You
                  </div>
                  {m.recommendedProducts.map((p) => {
                    const displayPrice = p.bestPrice || `$${Number(p.price || 0).toFixed(2)}`;
                    return (
                      <div
                        key={p.id}
                        className="card animate-fade-up"
                        style={{
                          padding: 10,
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          background: "white",
                          border: "1px solid var(--border)",
                          transition: "box-shadow 0.2s ease, transform 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "var(--shadow)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "var(--shadow-card)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.title || p.name}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              objectFit: "cover",
                              background: "var(--bg-surface-2)",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: "var(--bg-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📦</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.title || p.name}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{displayPrice}</span>
                            <span className="badge badge-primary" style={{ fontSize: 8, padding: "1px 6px" }}>
                              <Tag size={8} /> {p.category || p.brand || "Deal"}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/products/${p.id}`}
                          className="btn btn-primary btn-sm"
                          style={{
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            padding: "5px 10px",
                            fontSize: 11,
                            flexShrink: 0,
                          }}
                        >
                          Details <ArrowRight size={11} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Thinking Indicator */}
          {isThinking && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px 12px 12px 2px",
                  background: "var(--bg-surface-2)",
                  fontSize: 13,
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span className="animate-fade-up" style={{ animationDuration: "0.8s", animationIterationCount: "infinite" }}>
                  💬
                </span>
                AI is analyzing products and crafting your plan...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick action chips */}
        <div
          style={{
            padding: "8px 16px",
            display: "flex",
            gap: 6,
            overflowX: "auto",
            borderTop: "1px solid var(--border)",
            background: "var(--bg-surface)",
          }}
        >
          {[
            "I have $500 for a gaming setup",
            "Best headphones under $300",
            "Home office budget $1000",
            "Compare prices",
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleQuickAction(chip)}
              className="btn btn-ghost btn-sm"
              style={{
                borderRadius: "var(--radius-full)",
                fontSize: 10,
                padding: "4px 10px",
                height: 24,
                whiteSpace: "nowrap",
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          style={{
            padding: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderTop: "1px solid var(--border)",
          }}
        >
          <input
            type="text"
            placeholder="Tell me your budget and what you're looking for..."
            className="input"
            style={{ flex: 1, height: 36, fontSize: 13, borderRadius: "var(--radius-full)" }}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isThinking}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isThinking || !inputVal.trim()}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              opacity: isThinking || !inputVal.trim() ? 0.5 : 1,
            }}
          >
            <Send size={16} />
          </button>
        </form>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: "6px 20px 10px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <span style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
            <Clock size={10} /> History
          </span>
          <span style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
            <Star size={10} /> Saved
          </span>
          <span style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
            <HelpCircle size={10} /> Help
          </span>
        </div>
      </div>

      {/* Floating Star Widget on Bottom Right */}
      <div
        className="ai-chat-floating-star"
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--brand-gradient)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          color: "white",
          cursor: "pointer",
          zIndex: 999,
        }}
      >
        ✨
      </div>
    </div>
  );
}
