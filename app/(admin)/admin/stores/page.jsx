"use client";

import { useState, useEffect } from "react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Page-view audit log
    fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", entity: "stores", details: "Viewed Store Network page" }),
    }).catch(() => {});

    const fetchStores = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          const products = data.products || [];

          const storeMap = {};
          products.forEach((p) => {
            const storeName = p.source || p.bestStore || "Unknown";
            if (!storeMap[storeName]) {
              storeMap[storeName] = { name: storeName, count: 0 };
            }
            storeMap[storeName].count++;
          });

          const storeList = Object.entries(storeMap).map(([name, data], idx) => ({
            id: idx + 1,
            name,
            domain: name ? `${name.toLowerCase().replace(/\s+/g, "")}.com` : "N/A",
            products: data.count,
          }));

          setStores(storeList);
        }
      } catch (err) {
        console.error("Failed to fetch stores:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const onlineCount = stores.length;

  return (
    <AdminPageLayout title="Store Network" subtitle="View connected retail stores tracked in the product feed.">
      <AdminPageLayout.KPIGrid>
        {[
          { label: "Total Stores", val: `${stores.length}`, color: "var(--primary)" },
          { label: "Unique Sources", val: `${onlineCount}`, color: "var(--success)" },
          { label: "Products Mapped", val: `${stores.reduce((s, st) => s + st.products, 0)}`, color: "var(--info)" },
        ].map((s, idx) => (
          <AdminPageLayout.KPICard key={idx} label={s.label} value={s.val} color={s.color} delay={idx} />
        ))}
      </AdminPageLayout.KPIGrid>

      <AdminPageLayout.Section title="Connected Stores">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton-pulse" style={{ height: 40, borderRadius: 8 }} />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="table-empty">No stores found. Products need to be fetched first.</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>STORE</th>
                  <th>DOMAIN</th>
                  <th>PRODUCTS</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td className="store-name">{store.name}</td>
                    <td className="text-secondary">{store.domain}</td>
                    <td className="store-products">{store.products}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPageLayout.Section>
    </AdminPageLayout>
  );
}
