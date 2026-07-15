"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [profileName, setProfileName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("FREE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.user) {
          setProfileName(data.user.name || "User");
          setEmail(data.user.email || "");
          setTier(data.user.plan || "FREE");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update profile");
      }

      setMessage("Profile updated successfully.");
      window.location.reload();
    } catch (error) {
      setMessage(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>
          Settings
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Manage your account preferences, billing, and notification rules.
        </p>
      </div>

      {/* Profile Section */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Profile Details</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="input-label">Full Name</label>
            <input
              type="text"
              className="input"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <button className="btn btn-primary" style={{ width: "fit-content", marginTop: 4 }} onClick={handleUpdateProfile} disabled={saving}>
            {saving ? "Updating..." : "Update Profile"}
          </button>
          {message ? <div style={{ fontSize: 13, color: message.includes("success") ? "var(--success)" : "var(--danger)" }}>{message}</div> : null}
        </div>
      </div>

      {/* Plan Section */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Membership & Subscription</h3>
          <span className="badge badge-pro">{tier} Plan</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.5 }}>
          You have active access to advanced price histories, Unlimited tracking items, and priority AI notifications. Next renewal date: Nov 12, 2026.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-sm">Cancel Subscription</button>
          <button className="btn btn-primary btn-sm">Update Payment Method</button>
        </div>
      </div>
    </div>
  );
}
