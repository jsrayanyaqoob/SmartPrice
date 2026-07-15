const stats = [
  { value: "$42M+", label: "User Savings" },
  { value: "50k+", label: "Retail Stores" },
  { value: "2M+", label: "Daily Alerts Sent" },
  { value: "4.9/5", label: "App Rating" },
];

export default function StatsBar() {
  return (
    <section
      style={{
        padding: "56px 0",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1e1b4b 100%)",
        color: "white",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 32,
            textAlign: "center",
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontSize: "clamp(28px, 4vw, 42px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  marginBottom: 6,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#9ca3af" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          section > div > div { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
