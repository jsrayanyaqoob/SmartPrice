export default function AIFeatures() {
  return (
    <section style={{ padding: "80px 0", background: "white" }} id="features">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <h2 className="heading-1" style={{ marginBottom: 12 }}>Powered by Advanced AI</h2>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto 56px" }}>
          We use sophisticated machine learning models to analyze market trends and predict price movements before they happen.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, textAlign: "left" }}>
          {/* Real-time Price Engine */}
          <div className="card" style={{ padding: 28, gridRow: "span 2" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </div>
            <h3 className="heading-3" style={{ marginBottom: 8 }}>Real-time Price Engine</h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
              Our AI monitors over 50,000 stores every 60 seconds. When a price drops anywhere, you&apos;re the first to know.
            </p>
            {/* Visual placeholder */}
            <div style={{
              height: 180, borderRadius: 12, 
              background: "linear-gradient(135deg, var(--primary-light) 0%, #ddd6fe 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "var(--primary)", fontWeight: 600,
            }}>
              Track Smarter. Save Bigger.
            </div>
          </div>

          {/* Predictive Analytics */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Predictive Analytics</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Wait or buy? Our AI analyzes historical patterns to tell you if a better deal is coming next week.
            </p>
          </div>

          {/* Smart Alerts */}
          <div className="card" style={{ 
            padding: 28, background: "var(--brand-gradient)", color: "white",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Smart Alerts</h3>
            <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.7 }}>
              Set your target price and let our agents do the work. We&apos;ll notify you instantly when the threshold is met.
            </p>
            {/* Decorative number */}
            <div style={{
              position: "absolute", bottom: -10, right: 16, fontSize: 80, fontWeight: 900,
              opacity: 0.1, lineHeight: 1,
            }}>
              4
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #features > div > div:last-child { grid-template-columns: 1fr !important; }
          #features > div > div:last-child > div:first-child { grid-row: span 1 !important; }
        }
      `}</style>
    </section>
  );
}
