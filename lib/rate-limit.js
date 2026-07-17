/**
 * Simple in-memory sliding window rate limiter.
 * Tracks request counts per IP address within a time window.
 * When the limit is exceeded, returns a 429 Too Many Requests response.
 *
 * Usage in an API route:
 *   import { rateLimit } from "@/lib/rate-limit";
 *   const limiter = rateLimit({ windowMs: 60_000, max: 30 });
 *   const response = limiter.check(request);
 *   if (response) return response; // 429
 */

const stores = new Map();

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * Create a rate limiter instance.
 * @param {object} options
 * @param {number} options.windowMs  - Time window in milliseconds (default: 60_000 = 1 minute)
 * @param {number} options.max       - Max requests per window (default: 60)
 * @param {string} options.keyPrefix - Optional prefix for the store key (e.g. "login:")
 */
export function rateLimit({ windowMs = 60_000, max = 60, keyPrefix = "" } = {}) {
  // Periodically clean up stale entries (every 5 minutes)
  if (stores.size === 0) {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of stores.entries()) {
        if (now - entry.resetTime > windowMs) {
          stores.delete(key);
        }
      }
    }, 300_000);
  }

  return {
    /**
     * Check if the request is within the rate limit.
     * @returns {Response|null} A 429 Response if over limit, or null if allowed.
     */
    check(request) {
      const ip = getClientIp(request);
      const key = `${keyPrefix}${ip}`;
      const now = Date.now();

      let entry = stores.get(key);
      if (!entry || now > entry.resetTime) {
        entry = { count: 0, resetTime: now + windowMs };
        stores.set(key, entry);
      }

      entry.count += 1;

      const remaining = Math.max(0, max - entry.count);
      const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

      // Attach rate limit headers to the response
      const headers = {
        "X-RateLimit-Limit": String(max),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(resetSeconds),
        "Retry-After": String(resetSeconds),
      };

      if (entry.count > max) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          {
            status: 429,
            headers: { ...headers, "Content-Type": "application/json" },
          }
        );
      }

      return null; // Allowed
    },

    /**
     * Reset the rate limit counter for a given request (e.g. on successful login).
     */
    reset(request) {
      const ip = getClientIp(request);
      stores.delete(`${keyPrefix}${ip}`);
    },

    /**
     * Get the current store (useful for testing / monitoring).
     */
    _store: stores,
  };
}

/**
 * Pre-configured rate limiters for common scenarios.
 */
export const authLimiter = rateLimit({ windowMs: 60_000, max: 10, keyPrefix: "auth:" });
export const apiLimiter = rateLimit({ windowMs: 60_000, max: 60, keyPrefix: "api:" });
export const adminLimiter = rateLimit({ windowMs: 60_000, max: 30, keyPrefix: "admin:" });
export const syncLimiter = rateLimit({ windowMs: 300_000, max: 5, keyPrefix: "sync:" });
