const steps = [
  {
    number: "01",
    title: "Search Any Product",
    description:
      "Type a product, brand, or paste a URL. Our AI instantly scans thousands of retailers across the web to find every listing.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&h=400&auto=format&fit=crop",
    color: "#ede9ff",
  },
  {
    number: "02",
    title: "Compare Prices Instantly",
    description:
      "See all prices side-by-side with real-time updates. Our predictive AI tells you when to buy for the biggest savings.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&h=400&auto=format&fit=crop",
    color: "#dbeafe",
  },
  {
    number: "03",
    title: "Save Big & Get Alerts",
    description:
      "Set your target price and get instant notifications when it drops. Smart shoppers save an average of $320 per year.",
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=600&h=400&auto=format&fit=crop",
    color: "#d1fae5",
  },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: "80px 0", background: "white" }} id="how-it-works">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div className="section-label" style={{ marginBottom: 8 }}>HOW IT WORKS</div>
        <h2 className="heading-2" style={{ marginBottom: 12 }}>
          Start Saving in 3 Simple Steps
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            marginBottom: 56,
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          No sign-up required. Just search, compare, and save — it&apos;s that easy.
        </p>

        <div
          className="how-it-works-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 32,
            textAlign: "left",
          }}
        >
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="how-it-works-card"
              style={{
                position: "relative",
              }}
            >
              {/* Step Image */}
              <div
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  marginBottom: 24,
                  position: "relative",
                  aspectRatio: "3/2",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                }}
              >
                <img
                  src={step.image}
                  alt={step.title}
                  loading="lazy"
                  decoding="async"
                  className="how-it-works-img"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {/* Overlay with step number */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    background: "white",
                    borderRadius: "var(--radius-full)",
                    padding: "4px 12px",
                    fontWeight: 800,
                    fontSize: 13,
                    color: "var(--primary)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>{step.icon}</span>
                  <span>Step {step.number}</span>
                </div>
              </div>

              {/* Content */}
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: "var(--text-primary)",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {step.description}
              </p>

              {/* Decorative connector arrow (except last) */}
              {index < steps.length - 1 && (
                <div
                  className="how-it-works-connector"
                  style={{
                    position: "absolute",
                    top: 72,
                    right: -28,
                    color: "var(--primary-light)",
                    fontSize: 24,
                    fontWeight: 300,
                    lineHeight: 1,
                    zIndex: 2,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.3">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .how-it-works-img {
          transition: transform 0.5s ease;
        }
        .how-it-works-card:hover .how-it-works-img {
          transform: scale(1.08);
        }
        @media (max-width: 768px) {
          .how-it-works-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .how-it-works-connector {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
