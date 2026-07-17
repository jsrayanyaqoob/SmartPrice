const reviews = [
  { name: "Sarah M.", rating: 5, text: "SmartPrice saved me over $800 on my holiday shopping. The AI alerts are incredibly accurate!", plan: "Pro", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop" },
  { name: "James T.", rating: 5, text: "I've tried every price comparison tool out there. SmartPrice is leagues ahead with its predictive analytics.", plan: "Free", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop" },
  { name: "Maria L.", rating: 5, text: "The real-time tracking is a game changer. Got my MacBook Pro at its lowest price ever. Highly recommend!", plan: "Pro", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&auto=format&fit=crop" },
];

export default function Testimonials() {
  return (
    <section style={{ padding: "80px 0", background: "white" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <h2 className="heading-2" style={{ marginBottom: 48 }}>Trusted by Smart Shoppers</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {reviews.map((review, i) => (
            <div
              key={i}
              className="card card-hover"
              style={{ padding: 28, textAlign: "left" }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {[...Array(review.rating)].map((_, j) => (
                  <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: 20, minHeight: 72 }}>
                &ldquo;{review.text}&rdquo;
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    overflow: "hidden",
                    flexShrink: 0,
                    border: "2px solid var(--primary-light)",
                  }}
                >
                  <img
                    src={review.avatar}
                    alt={review.name}
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{review.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{review.plan} User</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
