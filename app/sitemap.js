export default function sitemap() {
  const baseUrl = "https://smartprice.io";

  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/forgot-password`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/check-email`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/reset-error`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
    { url: `${baseUrl}/help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/dashboard`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/products/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/insights`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/alerts`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/wishlist`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/settings`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/ai-assistant`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  const adminRoutes = [
    { url: `${baseUrl}/admin`, lastModified: new Date(), changeFrequency: "daily", priority: 0.3 },
    { url: `${baseUrl}/admin/analytics`, lastModified: new Date(), changeFrequency: "daily", priority: 0.2 },
    { url: `${baseUrl}/admin/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.2 },
    { url: `${baseUrl}/admin/deals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.2 },
    { url: `${baseUrl}/admin/users`, lastModified: new Date(), changeFrequency: "daily", priority: 0.2 },
    { url: `${baseUrl}/admin/stores`, lastModified: new Date(), changeFrequency: "daily", priority: 0.2 },
    { url: `${baseUrl}/admin/ai-management`, lastModified: new Date(), changeFrequency: "daily", priority: 0.2 },
    { url: `${baseUrl}/admin/price-monitoring`, lastModified: new Date(), changeFrequency: "daily", priority: 0.2 },
  ];

  return [...staticRoutes, ...adminRoutes].map((route) => ({
    url: route.url,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
