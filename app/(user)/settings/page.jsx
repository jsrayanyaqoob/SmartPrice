"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { User, Lock, Bell, Shield, Globe, Link, Camera, Key, Mail, Smartphone, Eye, EyeOff, Save, AlertTriangle, CheckCircle, MapPin, Fingerprint, QrCode, Upload, Palette, CreditCard, ChevronRight } from "lucide-react";

const SECTIONS = [
  { id: "profile", label: "Profile Details", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "membership", label: "Membership", icon: CreditCard },
];

export default function SettingsPage() {
  useEffect(() => { document.title = "Settings - SmartPrice"; document.querySelector('meta[name="description"]')?.setAttribute('content', 'Manage your SmartPrice account settings, profile, security, notifications, and preferences.'); }, []);
  const [activeSection, setActiveSection] = useState("profile");
  const contentRef = useRef(null);

  const switchSection = (id) => {
    setActiveSection(id);
    // Scroll to top of settings content on section switch
    if (contentRef.current) {
      const top = contentRef.current.offsetTop - 88;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // ========= PROFILE STATE =========
  const [profileName, setProfileName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [tier, setTier] = useState("FREE");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // ========= SECURITY STATE =========
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorQr, setTwoFactorQr] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [twoFactorSetupMode, setTwoFactorSetupMode] = useState(false);
  const [twoFactorVerifying, setTwoFactorVerifying] = useState(false);
  const [twoFactorMessage, setTwoFactorMessage] = useState("");

  // ========= NOTIFICATION STATE =========
  const [notifPriceDrop10, setNotifPriceDrop10] = useState(true);
  const [notifPriceDrop20, setNotifPriceDrop20] = useState(true);
  const [notifPriceDrop30, setNotifPriceDrop30] = useState(true);
  const [notifWishlistChange, setNotifWishlistChange] = useState(true);
  const [notifNewInCategory, setNotifNewInCategory] = useState(false);
  const [notifWeeklyDeals, setNotifWeeklyDeals] = useState(false);
  const [notifDailyDeals, setNotifDailyDeals] = useState(true);
  const [notifFlashSale, setNotifFlashSale] = useState(true);
  const [notifAIInsights, setNotifAIInsights] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [frequency, setFrequency] = useState("Instant (Real-time)");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState("");

  // ========= APPEARANCE STATE =========
  const [compactView, setCompactView] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(true);

  // ========= LOAD =========
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.user) {
          setProfileName(data.user.name || "");
          setEmail(data.user.email || "");
          setTier(data.user.plan || "FREE");
          setAvatarUrl(data.user.avatarUrl || "");
          setTwoFactorEnabled(data.user.twoFactorEnabled || false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();

    try {
      const stored = localStorage.getItem("smartprice-settings");
      if (stored) {
        const p = JSON.parse(stored);
        setNotifPriceDrop10(p.priceDrop10 ?? true);
        setNotifPriceDrop20(p.priceDrop20 ?? true);
        setNotifPriceDrop30(p.priceDrop30 ?? true);
        setNotifWishlistChange(p.wishlistChange ?? true);
        setNotifNewInCategory(p.newInCategory ?? false);
        setNotifWeeklyDeals(p.weeklyDeals ?? false);
        setNotifDailyDeals(p.dailyDeals ?? true);
        setNotifFlashSale(p.flashSale ?? true);
        setNotifAIInsights(p.aiInsights ?? false);
        setNotifEmail(p.email ?? true);
        setNotifPush(p.push ?? true);
        setNotifSMS(p.sms ?? false);
        setFrequency(p.frequency || "Instant (Real-time)");
        setCompactView(p.compactView ?? false);
        setShowPriceHistory(p.showPriceHistory ?? true);
        setBio(p.bio || "");
        setWebsite(p.website || "");
        setTwitter(p.twitter || "");
        setGithub(p.github || "");
        setLocation(p.location || "");
      }
    } catch {}
  }, []);

  // ========= HANDLERS =========
  const handleUpdateProfile = async () => {
    setSaving(true);
    setProfileMessage("");
    setProfileSuccess(false);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update profile");
      setProfileMessage("Profile updated successfully.");
      setProfileSuccess(true);
    } catch (error) {
      setProfileMessage(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to change password");
      setPasswordMessage("Password changed successfully.");
      setPasswordSuccess(true);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (error) {
      setPasswordMessage(error.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailMessage("");
    if (!newEmail) { setEmailMessage("Please enter a new email address."); return; }
    setChangingEmail(true);
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send verification");
      setEmailMessage("Verification email sent to " + newEmail);
      setNewEmail("");
      // In dev mode, auto-confirm the email change with the returned token
      if (data.verificationToken) {
        setTimeout(async () => {
          const confirmRes = await fetch(`/api/auth/change-email?token=${data.verificationToken}`);
          const confirmData = await confirmRes.json();
          if (confirmData.success) {
            setEmail(data.verificationToken ? newEmail : email);
            setEmailMessage("Email changed successfully! (Dev auto-confirm)");
          }
        }, 500);
      }
    } catch (error) {
      setEmailMessage(error.message || "Failed to send verification.");
    } finally {
      setChangingEmail(false);
    }
  };

  const handleSetup2FA = async () => {
    setTwoFactorMessage("");
    setTwoFactorSetupMode(true);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTwoFactorSecret(data.secret);
      setTwoFactorQr(data.qrCode);
    } catch (error) {
      setTwoFactorMessage(error.message);
      setTwoFactorSetupMode(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorToken) { setTwoFactorMessage("Enter the 6-digit code from your authenticator app."); return; }
    setTwoFactorVerifying(true);
    setTwoFactorMessage("");
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: twoFactorToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTwoFactorEnabled(true);
      setTwoFactorSetupMode(false);
      setTwoFactorToken("");
      setTwoFactorMessage("Two-factor authentication enabled successfully.");
    } catch (error) {
      setTwoFactorMessage(error.message);
    } finally {
      setTwoFactorVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    setTwoFactorMessage("");
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: twoFactorToken || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTwoFactorEnabled(false);
      setTwoFactorSecret("");
      setTwoFactorQr("");
      setTwoFactorSetupMode(false);
      setTwoFactorMessage("Two-factor authentication disabled.");
    } catch (error) {
      setTwoFactorMessage(error.message);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert to base64 and send to API
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      try {
        const res = await fetch("/api/auth/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64 }),
        });
        const data = await res.json();
        if (data.success) {
          setAvatarUrl(data.avatarUrl);
        } else {
          // Fallback: Store as data URL directly in localStorage
          setAvatarUrl(base64);
          localStorage.setItem("smartprice-avatar", base64);
        }
      } catch (error) {
        console.error(error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePreferences = () => {
    setSavingPrefs(true);
    setPrefsMessage("");
    try {
      localStorage.setItem(
        "smartprice-settings",
        JSON.stringify({
          priceDrop10: notifPriceDrop10, priceDrop20: notifPriceDrop20,
          priceDrop30: notifPriceDrop30, wishlistChange: notifWishlistChange,
          newInCategory: notifNewInCategory, weeklyDeals: notifWeeklyDeals,
          dailyDeals: notifDailyDeals, flashSale: notifFlashSale,
          aiInsights: notifAIInsights, email: notifEmail, push: notifPush,
          sms: notifSMS, frequency, compactView, showPriceHistory,
          bio, website, twitter, github, location,
        })
      );
      setPrefsMessage("All settings saved successfully.");
    } catch {
      setPrefsMessage("Failed to save settings.");
    } finally {
      setSavingPrefs(false);
      setTimeout(() => setPrefsMessage(""), 3000);
    }
  };

  // ========= SUB-COMPONENTS =========
  const Label = ({ children }) => (
    <label className="input-label" style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, display: "block" }}>{children}</label>
  );

  const ToggleRow = ({ label, desc, checked, onChange }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{desc}</div>}
      </div>
      <label className="toggle" style={{ flexShrink: 0 }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-track"></span><span className="toggle-thumb"></span>
      </label>
    </div>
  );

  const SectionCard = ({ id, title, desc, icon, children }) => {
    const IconComponent = icon;
    return (
      <section id={id} style={{ scrollMarginTop: 80 }}>
        <div className="card animate-fade-up" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
              <IconComponent size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h3>
              {desc && <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>{desc}</p>}
            </div>
          </div>
          {children}
        </div>
      </section>
    );
  };

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* ============ SIDEBAR ============ */}
      <nav style={{
        position: "sticky", top: 88, width: 200, flexShrink: 0,
        display: "flex", flexDirection: "column", gap: 2,
        borderRight: "1px solid var(--border)", paddingRight: 16,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 12px", marginBottom: 4 }}>
          Sections
        </div>
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => switchSection(id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: activeSection === id ? 600 : 400,
              background: activeSection === id ? "var(--primary-light)" : "transparent",
              color: activeSection === id ? "var(--primary)" : "var(--text-secondary)",
              border: "none", cursor: "pointer", textAlign: "left", width: "100%",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { if (activeSection !== id) e.currentTarget.style.background = "var(--bg-surface-2)"; }}
            onMouseLeave={(e) => { if (activeSection !== id) e.currentTarget.style.background = "transparent"; }}
          >
            <Icon size={16} />
            <span style={{ flex: 1 }}>{label}</span>
            {activeSection === id && <ChevronRight size={14} />}
          </button>
        ))}
      </nav>

      {/* ============ CONTENT ============ */}
      <div ref={contentRef} style={{ flex: 1, maxWidth: 700, minWidth: 0, overflowY: "auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>
            {SECTIONS.find(s => s.id === activeSection)?.label || "Settings"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
            Manage your profile, security, notifications, and preferences.
          </p>
        </div>

        {/* ===== PROFILE ===== */}
        {activeSection === "profile" && (
          <SectionCard id="profile" title="Profile Details" desc="Your personal information and online presence." icon={User}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--bg-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", flexShrink: 0 }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <User size={32} style={{ opacity: 0.4 }} />
                  )}
                  <label
                    style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                  >
                    <Camera size={18} color="white" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
                  </label>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{profileName || "User"}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{email}</div>
                  <span className={`badge ${tier === "PRO" ? "badge-pro" : "badge-ghost"}`} style={{ fontSize: 9, marginTop: 4 }}>{tier}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div><Label>FULL NAME</Label><input type="text" className="input" value={profileName} onChange={(e) => setProfileName(e.target.value)} disabled={loading} placeholder="Your full name" /></div>
                <div><Label>EMAIL ADDRESS</Label><input type="email" className="input" value={email} disabled placeholder="your@email.com" /></div>
              </div>

              <div>
                <Label>BIO</Label>
                <textarea className="input" style={{ height: 80, resize: "vertical", padding: 10, fontSize: 13, fontFamily: "inherit" }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a bit about yourself..." maxLength={500} />
                <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "right", marginTop: 2 }}>{bio.length}/500</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div><Label>WEBSITE</Label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Globe size={14} style={{ opacity: 0.4, flexShrink: 0 }} /><input type="url" className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" /></div></div>
                <div><Label>LOCATION</Label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={14} style={{ opacity: 0.4, flexShrink: 0 }} /><input type="text" className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" /></div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div><Label>TWITTER / X</Label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Link size={14} style={{ opacity: 0.4, flexShrink: 0 }} /><input type="text" className="input" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@username" /></div></div>
                <div><Label>GITHUB</Label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Link size={14} style={{ opacity: 0.4, flexShrink: 0 }} /><input type="text" className="input" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="username" /></div></div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button className="btn btn-primary" onClick={handleUpdateProfile} disabled={saving || loading}>
                  {saving ? "Saving..." : "Save Profile"}
                </button>
                {profileMessage && (
                  <span style={{ fontSize: 13, color: profileSuccess ? "var(--success)" : "var(--danger)", display: "flex", alignItems: "center", gap: 4 }}>
                    {profileSuccess ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                    {profileMessage}
                  </span>
                )}
              </div>
            </div>
          </SectionCard>
        )}

        {/* ===== SECURITY ===== */}
        {activeSection === "security" && (
          <SectionCard id="security" title="Security" desc="Manage your password, email, and account security." icon={Shield}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Change Password */}
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 6 }}><Key size={14} /> Change Password</h4>
                <div><Label>CURRENT PASSWORD</Label><input type="password" className="input" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required style={{ maxWidth: 400 }} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <Label>NEW PASSWORD</Label>
                    <div style={{ position: "relative" }}>
                      <input type={showNewPassword ? "text" : "password"} className="input" placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ width: "100%" }} />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", opacity: 0.4, padding: 4 }}>
                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div><Label>CONFIRM NEW PASSWORD</Label><input type="password" className="input" placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button type="submit" className="btn btn-primary" disabled={changingPassword}>{changingPassword ? "Changing..." : "Change Password"}</button>
                  {passwordMessage && <span style={{ fontSize: 13, color: passwordSuccess ? "var(--success)" : "var(--danger)", display: "flex", alignItems: "center", gap: 4 }}>{passwordSuccess ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}{passwordMessage}</span>}
                </div>
              </form>

              <div style={{ borderTop: "1px solid var(--border)" }} />

              {/* Change Email */}
              <form onSubmit={handleChangeEmail} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 6 }}><Mail size={14} /> Change Email</h4>
                <div><Label>NEW EMAIL ADDRESS</Label><input type="email" className="input" placeholder="new@email.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required style={{ maxWidth: 400 }} /></div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button type="submit" className="btn btn-primary" disabled={changingEmail}>{changingEmail ? "Sending..." : "Send Verification"}</button>
                  {emailMessage && <span style={{ fontSize: 13, color: emailMessage.includes("successfully") ? "var(--success)" : "var(--danger)", display: "flex", alignItems: "center", gap: 4 }}>{emailMessage.includes("successfully") ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}{emailMessage}</span>}
                </div>
              </form>

              <div style={{ borderTop: "1px solid var(--border)" }} />

              {/* Two-Factor Auth */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}><Fingerprint size={14} /> Two-Factor Authentication</h4>
                
                {twoFactorSetupMode ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 16, background: "var(--bg-surface-2)", borderRadius: 10 }}>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                      Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy):
                    </p>
                    {twoFactorQr && (
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <img src={twoFactorQr} alt="QR Code" loading="lazy" decoding="async" style={{ width: 160, height: 160, borderRadius: 8 }} />
                      </div>
                    )}
                    <div>
                      <Label>VERIFICATION CODE</Label>
                      <div style={{ display: "flex", gap: 10 }}>
                        <input type="text" className="input" placeholder="000000" value={twoFactorToken} onChange={(e) => setTwoFactorToken(e.target.value)} style={{ maxWidth: 160, textAlign: "center", fontSize: 18, letterSpacing: 4 }} maxLength={6} />
                        <button className="btn btn-primary" onClick={handleVerify2FA} disabled={twoFactorVerifying}>{twoFactorVerifying ? "Verifying..." : "Verify"}</button>
                        <button className="btn btn-ghost" onClick={() => setTwoFactorSetupMode(false)}>Cancel</button>
                      </div>
                    </div>
                    {twoFactorMessage && <span style={{ fontSize: 12, color: twoFactorMessage.includes("successfully") ? "var(--success)" : "var(--danger)" }}>{twoFactorMessage}</span>}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <ToggleRow
                      label={twoFactorEnabled ? "2FA is enabled" : "2FA is disabled"}
                      desc={twoFactorEnabled ? "Your account is protected with two-factor authentication." : "Add an extra layer of security to your account."}
                      checked={twoFactorEnabled}
                      onChange={(val) => {
                        if (val) handleSetup2FA();
                        else handleDisable2FA();
                      }}
                    />
                    {twoFactorMessage && <span style={{ fontSize: 12, color: twoFactorMessage.includes("successfully") || twoFactorMessage.includes("enabled") ? "var(--success)" : "var(--danger)" }}>{twoFactorMessage}</span>}
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid var(--border)" }} />

              {/* Active Sessions */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}><Smartphone size={14} /> Active Sessions</h4>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Current session</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>1 active session</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>Revoke All</button>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ===== NOTIFICATIONS ===== */}
        {activeSection === "notifications" && (
          <SectionCard id="notifications" title="Notifications" desc="Fine-tune which alerts you receive and how." icon={Bell}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: "var(--text-muted)" }}>PRICE DROP ALERTS</h4>
              <ToggleRow label="10%+ Price Drop" desc="Tracked item drops by 10% or more" checked={notifPriceDrop10} onChange={setNotifPriceDrop10} />
              <ToggleRow label="20%+ Price Drop" desc="Significant 20%+ price drops" checked={notifPriceDrop20} onChange={setNotifPriceDrop20} />
              <ToggleRow label="30%+ Price Drop" desc="Major 30%+ price drops only" checked={notifPriceDrop30} onChange={setNotifPriceDrop30} />
              <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }} />
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: "var(--text-muted)" }}>WISHLIST & PRODUCTS</h4>
              <ToggleRow label="Wishlist Price Changes" desc="Any wishlist item changes price" checked={notifWishlistChange} onChange={setNotifWishlistChange} />
              <ToggleRow label="New Products in Category" desc="New products in favorite categories" checked={notifNewInCategory} onChange={setNotifNewInCategory} />
              <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }} />
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: "var(--text-muted)" }}>DEALS & PROMOTIONS</h4>
              <ToggleRow label="Flash Sales" desc="Limited-time flash sales" checked={notifFlashSale} onChange={setNotifFlashSale} />
              <ToggleRow label="Daily Deals Digest" desc="Best deals roundup" checked={notifDailyDeals} onChange={setNotifDailyDeals} />
              <ToggleRow label="Weekly Deals Roundup" desc="Weekly price trends" checked={notifWeeklyDeals} onChange={setNotifWeeklyDeals} />
              <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }} />
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: "var(--text-muted)" }}>AI & INSIGHTS</h4>
              <ToggleRow label="AI Insights & Tips" desc="Shopping tips and market insights" checked={notifAIInsights} onChange={setNotifAIInsights} />
              <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }} />
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: "var(--text-muted)" }}>DELIVERY METHOD</h4>
              <ToggleRow label="Email Notifications" desc="Receive via email" checked={notifEmail} onChange={setNotifEmail} />
              <ToggleRow label="Push Notifications" desc="Browser push notifications" checked={notifPush} onChange={setNotifPush} />
              <ToggleRow label="SMS Notifications" desc="Text message alerts" checked={notifSMS} onChange={setNotifSMS} />
              <div style={{ marginTop: 12 }}>
                <Label>DIGEST FREQUENCY</Label>
                <select className="input" style={{ height: 38, fontSize: 13, padding: "0 10px", marginTop: 4, maxWidth: 300 }} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  <option value="Instant (Real-time)">Instant (Real-time)</option>
                  <option value="Daily Digest">Daily Digest</option>
                  <option value="Weekly Summary">Weekly Summary</option>
                </select>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ===== APPEARANCE ===== */}
        {activeSection === "appearance" && (
          <SectionCard id="appearance" title="Appearance & Preferences" desc="Customize how SmartPrice looks and behaves." icon={Palette}>
            <ToggleRow label="Compact View" desc="Denser layout showing more items" checked={compactView} onChange={setCompactView} />
            <ToggleRow label="Show Price History" desc="Display price history charts on product pages" checked={showPriceHistory} onChange={setShowPriceHistory} />
          </SectionCard>
        )}

        {/* ===== MEMBERSHIP ===== */}
        {activeSection === "membership" && (
          <SectionCard id="membership" title="Membership & Subscription" desc={"You are currently on the " + tier + " plan."} icon={CreditCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span className={`badge ${tier === "PRO" ? "badge-pro" : "badge-ghost"}`} style={{ fontSize: 12, padding: "4px 14px" }}>{tier}</span>
              {tier === "FREE" && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Upgrade for unlimited alerts, AI predictions, and 30-day price history.</span>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {tier === "FREE" && <button className="btn btn-gradient">Upgrade to Pro</button>}
              {tier === "PRO" && <><button className="btn btn-ghost btn-sm">Cancel Subscription</button><button className="btn btn-primary btn-sm">Update Payment Method</button></>}
            </div>
          </SectionCard>
        )}

        {/* Save All */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 0 24px" }}>
          <button className="btn btn-gradient" onClick={handleSavePreferences} disabled={savingPrefs} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Save size={16} />{savingPrefs ? "Saving All..." : "Save All Settings"}
          </button>
          {prefsMessage && <span style={{ fontSize: 13, color: "var(--success)", marginLeft: 12, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={14} />{prefsMessage}</span>}
        </div>
      </div>
    </div>
  );
}
