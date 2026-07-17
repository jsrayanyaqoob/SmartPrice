export default function MarketingLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app)" }}>
      {/* Hero skeleton */}
      <div
        style={{
          padding: "80px 24px 60px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div
          className="skeleton-pulse"
          style={{
            width: 120,
            height: 14,
            borderRadius: 4,
            marginBottom: 16,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
        <div
          className="skeleton-pulse"
          style={{
            width: "70%",
            height: 48,
            borderRadius: 8,
            marginBottom: 16,
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: 600,
          }}
        />
        <div
          className="skeleton-pulse"
          style={{
            width: "50%",
            height: 14,
            borderRadius: 4,
            marginBottom: 32,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
        <div
          className="skeleton-pulse"
          style={{
            width: 180,
            height: 44,
            borderRadius: 999,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>

      {/* Features skeleton */}
      <div style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div
          className="skeleton-pulse"
          style={{
            width: 100,
            height: 12,
            borderRadius: 4,
            marginBottom: 8,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
        <div
          className="skeleton-pulse"
          style={{
            width: 240,
            height: 24,
            borderRadius: 6,
            marginBottom: 32,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="card skeleton-pulse"
              style={{ padding: 24, height: 180, border: "1px solid var(--border)" }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 16, background: "var(--border)" }} />
              <div style={{ width: "70%", height: 14, borderRadius: 4, marginBottom: 8, background: "var(--border)" }} />
              <div style={{ width: "90%", height: 10, borderRadius: 4, background: "var(--border)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
