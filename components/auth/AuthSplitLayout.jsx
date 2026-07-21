export default function AuthSplitLayout({ children, title, subtitle, rightContent }) {
  return (
    <div className="auth-layout">
      {/* Left Panel - Form */}
      <div className="auth-form-panel">
        <div className="auth-form-scroll">
          {children}
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="auth-visual-panel">
        {/* Central visual area */}
        <div
          style={{
            width: "70%",
            maxWidth: 400,
            aspectRatio: "4/3",
            borderRadius: 16,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 32, color: "white", letterSpacing: "-0.03em" }}>SmartPrice</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "center" }}>
            Shop smarter, save more
          </span>
        </div>

        {/* Floating info card */}
        {rightContent && (
          <div
            style={{
              position: "absolute",
              bottom: 60,
              right: 40,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 14,
              padding: "16px 20px",
              maxWidth: 260,
              color: "white",
            }}
          >
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}
