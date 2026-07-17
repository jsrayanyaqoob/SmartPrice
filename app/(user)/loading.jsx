import { SkeletonProductCard } from "@/components/ui/Skeleton";
import { SkeletonCard } from "@/components/ui/Skeleton";

export default function UserPortalLoading() {
  return (
    <div className="portal-content" style={{ padding: 28 }}>
      {/* Breadcrumb skeleton */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
        <div className="skeleton-pulse" style={{ width: 70, height: 12, borderRadius: 4 }} />
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>/</span>
        <div className="skeleton-pulse" style={{ width: 100, height: 12, borderRadius: 4 }} />
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>/</span>
        <div className="skeleton-pulse" style={{ width: 80, height: 12, borderRadius: 4 }} />
      </div>

      {/* Page title skeleton */}
      <div className="skeleton-pulse" style={{ width: 220, height: 28, borderRadius: 6, marginBottom: 8 }} />
      <div className="skeleton-pulse" style={{ width: 340, height: 14, borderRadius: 4, marginBottom: 24 }} />

      {/* KPI cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="card"
            style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}
          >
            <div className="skeleton-pulse" style={{ width: "60%", height: 10, borderRadius: 4 }} />
            <div className="skeleton-pulse" style={{ width: "40%", height: 24, borderRadius: 6 }} />
            <div className="skeleton-pulse" style={{ width: "50%", height: 10, borderRadius: 4 }} />
          </div>
        ))}
      </div>

      {/* Content cards skeleton */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="skeleton-pulse" style={{ width: 140, height: 16, borderRadius: 4 }} />
          <div className="skeleton-pulse" style={{ width: 80, height: 16, borderRadius: 4 }} />
        </div>
        <SkeletonCard lines={4} />
      </div>

      {/* Product cards grid skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {[...Array(6)].map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </div>
    </div>
  );
}
