const categories = [
  {
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=300&h=300&auto=format&fit=crop",
    description: "Laptops, phones, accessories & more",
    dotColor: "#6b33f6",
    overlayColor: "#ede9ff",
  },
  {
    name: "Fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=300&h=300&auto=format&fit=crop",
    description: "Clothing, shoes & accessories",
    dotColor: "#ef4444",
    overlayColor: "#fee2e2",
  },
  {
    name: "Home & Garden",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&h=300&auto=format&fit=crop",
    description: "Furniture, decor & outdoor",
    dotColor: "#10b981",
    overlayColor: "#d1fae5",
  },
  {
    name: "Sports",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&h=300&auto=format&fit=crop",
    description: "Gear, equipment & activewear",
    dotColor: "#f59e0b",
    overlayColor: "#fef3c7",
  },
];

export default function CategoryGrid() {
  return (
    <section style={{ padding: "80px 0", background: "white" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div className="section-label" style={{ marginBottom: 8 }}>BROWSE BY CATEGORY</div>
        <h2 className="heading-2" style={{ marginBottom: 12 }}>Shop by Category</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 40, maxWidth: 450, marginLeft: "auto", marginRight: "auto" }}>
          Find the best deals across thousands of products, all in one place
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="card card-hover category-card"
              style={{
                padding: 0,
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid var(--border)",
                background: "white",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              {/* Image with CSS hover zoom */}
              <div
                className="category-img-wrap"
                style={{
                  height: 160,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  className="category-img"
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {/* Overlay gradient */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(transparent 40%, ${cat.overlayColor}88 100%)`,
                }} />
              </div>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: cat.dotColor,
                  }} />
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{cat.name}</h3>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                  {cat.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > div > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          section > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
