# SmartPrice

AI-powered price comparison and tracking platform. Scan thousands of retailers to find the lowest prices, get AI-powered deal alerts, and compare products side-by-side.

## Tech Stack

- **Framework:** Next.js 16
- **Database:** PostgreSQL (via Prisma)
- **Data Sources:** Apify web scraping datasets
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Styling:** Tailwind CSS 4 + custom design system
- **Deployment:** Vercel-ready (standalone output)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
# Copy the template (create one if none exists):
# DATABASE_URL=postgresql://...
# JWT_SECRET=your-secret-key
# APIFY_TOKEN=your-apify-token
# CRON_SECRET=your-cron-secret (for automated syncs)

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
```

## Product Data Pipeline

The platform fetches product data from **Apify web scraping datasets** and stores it in PostgreSQL for fast querying.

### Adding More Data Sources

Edit `lib/product-sync.js` and add new Apify dataset URLs to the `DATA_SOURCES` object:

```js
const DATA_SOURCES = {
  electronics: [
    process.env.APIFY_DATASET_URL,
    "https://api.apify.com/v2/datasets/YOUR_DATASET_ID/items",
  ],
  fashion: [
    // Add fashion retailer dataset URLs here
  ],
  home: [
    // Add home/garden dataset URLs here
  ],
  sports: [
    // Add sports/outdoor dataset URLs here
  ],
};
```

To get dataset IDs:
1. Go to [Apify Store](https://apify.com/store)
2. Run the **E-commerce Scraping Tool** or a specific retailer actor
3. After the run completes, copy the **Dataset ID** from the run output
4. Add it to `DATA_SOURCES` above

### Manual Sync

**Via Admin UI:** Go to Admin → Settings → Product Database Sync → "Sync Products Now"

**Via API:** `POST /api/products/sync` (requires admin auth)

**Via cron:** `GET /api/cron/sync-products?secret=YOUR_CRON_SECRET`

### Automated Sync (Scheduled)

**Option 1: Vercel Cron (if deployed on Vercel)**

The `vercel.json` file includes a cron job that syncs products every 6 hours.
Add a `CRON_SECRET` environment variable in your Vercel dashboard.

**Option 2: External cron service (cron-job.org, cronitor, etc.)**
Set up a scheduled HTTPS request to:
```
https://your-domain.com/api/cron/sync-products?secret=YOUR_CRON_SECRET
```

**Option 3: GitHub Actions**
Create a `.github/workflows/sync-products.yml` workflow that calls the sync endpoint.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT token signing |
| `APIFY_TOKEN` | ✅ | Apify API token for data source access |
| `CRON_SECRET` | ⬜ | Secret key for protecting cron endpoints |
| `GEMINI_API_KEY` | ⬜ | Google Gemini API key for AI assistant |
| `NEXT_PUBLIC_DISABLE_AUTH` | ⬜ | Set to "true" to bypass auth in dev |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Apify Documentation](https://docs.apify.com/)
