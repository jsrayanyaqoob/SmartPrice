const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for casual shoppers looking to save",
    features: [
      "Price comparison across 10+ stores",
      "Basic price alerts (3 per month)",
      "7-day price history",
      "Email notifications",
      "Community deals access",
    ],
    cta: "Get Started Free",
    ctaStyle: "outline",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious savers who never miss a deal",
    features: [
      "Price comparison across 50,000+ stores",
      "Unlimited price alerts",
      "AI predictive price forecasting",
      "30-day price history & charts",
      "SMS & email notifications",
      "Real-time price drops",
      "Priority support",
    ],
    cta: "Start Free Trial",
    ctaStyle: "gradient",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$29",
    period: "/month",
    description: "For teams and power users who need it all",
    features: [
      "Everything in Pro",
      "API access & integrations",
      "Custom price tracking rules",
      "Multi-product monitoring",
      "Export & reporting tools",
      "Dedicated account manager",
      "White-label alerts",
      "99.9% uptime SLA",
    ],
    cta: "Contact Sales",
    ctaStyle: "outline",
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section
      style={{
        padding: "80px 0",
        background: "var(--bg-app)",
        position: "relative",
        overflow: "hidden",
      }}
      id="pricing"
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(107,51,246,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>
            PRICING
          </div>
          <h2 className="heading-2" style={{ marginBottom: 12 }}>
            Simple, Transparent Pricing
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            Start free — upgrade when you&apos;re ready to save more. No hidden fees, no surprises.
          </p>
        </div>

        <div
          className="pricing-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            alignItems: "start",
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card ${plan.popular ? "pricing-card-popular" : ""}`}
              style={{
                background: plan.popular ? "white" : "white",
                border: plan.popular
                  ? "2px solid var(--primary)"
                  : "1px solid var(--border)",
                borderRadius: 20,
                padding: plan.popular ? "36px 28px" : "32px 28px",
                position: "relative",
                boxShadow: plan.popular
                  ? "0 12px 40px rgba(107,51,246,0.15)"
                  : "var(--shadow-card)",
                transition: "all 0.3s ease",
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--brand-gradient)",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 16px",
                    borderRadius: "var(--radius-full)",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              {/* Plan icon */}
              {/* <div
                style={{
                  fontSize: 32,
                  marginBottom: 12,
                }}
              >
                {plan.icon}
              </div> */}

              {/* Plan name */}
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 4,
                  color: "var(--text-primary)",
                }}
              >
                {plan.name}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                {plan.description}
              </p>

              {/* Price */}
              <div style={{ marginBottom: 24 }}>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {plan.price}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 28,
                }}
              >
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      color: "var(--text-secondary)",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={plan.popular ? "var(--primary)" : "var(--success)"}
                      strokeWidth="2.5"
                      style={{ flexShrink: 0 }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`btn ${plan.ctaStyle === "gradient" ? "btn-gradient" : "btn-outline"} btn-pill`}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Money back guarantee */}
        <div
          style={{
            textAlign: "center",
            marginTop: 40,
            padding: "20px 24px",
            background: "white",
            borderRadius: 16,
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 24 }}>🛡️</span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            30-Day Money-Back Guarantee
          </span>
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            — No questions asked. Upgrade, downgrade, or cancel anytime.
          </span>
        </div>
      </div>

      <style>{`
        .pricing-card {
          transition: all 0.3s ease;
        }
        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(107,51,246,0.12) !important;
        }
        .pricing-card-popular:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(107,51,246,0.2) !important;
        }
        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
            max-width: 400px;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
}
