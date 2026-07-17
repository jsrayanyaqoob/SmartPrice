export default function AuthLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-app)",
        padding: 24,
      }}
    >
      <div className="card" style={{ padding: 40, width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            className="skeleton-pulse"
            style={{ width: 60, height: 60, borderRadius: 14, margin: "0 auto 16px" }}
          />
          <div
            className="skeleton-pulse"
            style={{ width: 160, height: 20, borderRadius: 6, margin: "0 auto 8px" }}
          />
          <div
            className="skeleton-pulse"
            style={{ width: 240, height: 12, borderRadius: 4, margin: "0 auto" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="skeleton-pulse" style={{ width: "30%", height: 10, borderRadius: 4 }} />
              <div
                className="skeleton-pulse"
                style={{ width: "100%", height: 40, borderRadius: 8 }}
              />
            </div>
          ))}
          <div className="skeleton-pulse" style={{ width: "100%", height: 44, borderRadius: 10, marginTop: 8 }} />
        </div>
      </div>
    </div>
  );
}
