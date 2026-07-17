"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

export default function AlertButton({ productId, productName, compact = false }) {
  const [open, setOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateAlert = async () => {
    if (!targetPrice || isNaN(parseFloat(targetPrice))) {
      setMessage("Please enter a valid target price.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          targetPrice: parseFloat(targetPrice),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create alert");

      setMessage("✅ Alert created! We'll notify you when the price drops.");
      setTargetPrice("");
      setTimeout(() => {
        setMessage("");
        setOpen(false);
      }, 3000);
    } catch (err) {
      setMessage(err.message || "Failed to create alert. Are you logged in?");
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(!open)}
          className="btn btn-ghost btn-sm"
          style={{ padding: "5px 10px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <Bell size={12} /> Set Alert
        </button>
        {open && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: 6,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 14,
              boxShadow: "var(--shadow-lg)",
              zIndex: 50,
              width: 240,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Set Price Alert</div>
            <input
              type="number"
              placeholder="Target price ($)"
              className="input"
              style={{ height: 34, fontSize: 12, marginBottom: 8 }}
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" style={{ width: "100%", height: 32 }} onClick={handleCreateAlert} disabled={loading}>
              {loading ? "Creating..." : "Notify Me"}
            </button>
            {message && (
              <div style={{ fontSize: 11, marginTop: 6, color: message.includes("✅") ? "var(--success)" : "var(--danger)" }}>
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className={`btn ${open ? "btn-primary" : "btn-ghost"}`}
        style={{ padding: "10px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <Bell size={14} />
        {open ? "Close" : "Set Alert"}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 8,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 18,
            boxShadow: "var(--shadow-lg)",
            zIndex: 50,
            width: 280,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Set Price Alert</div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 12px" }}>
            We&apos;ll notify you when <strong>{productName || "this product"}</strong> drops to your target price.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>$</span>
              <input
                type="number"
                placeholder="Target price"
                className="input"
                style={{ height: 38, fontSize: 13, paddingLeft: 24 }}
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateAlert(); }}
              />
            </div>
            <button className="btn btn-gradient btn-sm" style={{ height: 38 }} onClick={handleCreateAlert} disabled={loading}>
              {loading ? "..." : "Alert"}
            </button>
          </div>
          {message && (
            <div style={{ fontSize: 12, marginTop: 8, color: message.includes("✅") ? "var(--success)" : "var(--danger)", fontWeight: 500 }}>
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
