export function Skeleton({ width, height, borderRadius = 8, style }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: width || "100%",
        height: height || 20,
        borderRadius,
        background: "var(--bg-surface-2)",
        animation: "skeleton-pulse 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ lines = 3, style }) {
  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, ...style }}>
      <Skeleton height={24} width="60%" />
      <Skeleton height={14} width="40%" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={`${80 - i * 15}%`} />
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Skeleton width={80} height={32} borderRadius={6} />
        <Skeleton width={100} height={32} borderRadius={6} />
      </div>
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, minHeight: 330 }}>
      <Skeleton height={150} borderRadius={14} />
      <Skeleton height={16} width="40%" borderRadius={999} />
      <Skeleton height={18} width="90%" />
      <Skeleton height={14} width="60%" />
      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        <Skeleton width={50} height={14} />
        <Skeleton width={80} height={14} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <Skeleton width={60} height={20} />
        <Skeleton width={80} height={32} borderRadius={6} />
      </div>
    </div>
  );
}
