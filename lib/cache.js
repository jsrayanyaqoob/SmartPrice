/**
 * Simple in-memory cache with TTL support.
 * Used by API routes to reduce expensive database queries.
 */

const store = new Map();
const timers = new Map();

const cache = {
  /**
   * Get a cached value by key.
   * Returns undefined if the key doesn't exist or has expired.
   */
  get(key) {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      timers.delete(key);
      return undefined;
    }
    return entry.value;
  },

  /**
   * Set a cached value with an optional TTL in milliseconds.
   * Default TTL is 60 seconds.
   */
  set(key, value, ttlMs = 60_000) {
    // Clear any existing expiry timer for this key
    if (timers.has(key)) {
      clearTimeout(timers.get(key));
    }

    store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });

    // Set a cleanup timer
    timers.set(key, setTimeout(() => {
      store.delete(key);
      timers.delete(key);
    }, ttlMs));
  },

  /**
   * Delete a specific key from the cache.
   */
  del(key) {
    store.delete(key);
    if (timers.has(key)) {
      clearTimeout(timers.get(key));
      timers.delete(key);
    }
  },

  /**
   * Invalidate all cache entries matching a key prefix.
   * Useful for clearing related caches after a mutation.
   */
  delPrefix(prefix) {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) {
        store.delete(key);
        if (timers.has(key)) {
          clearTimeout(timers.get(key));
          timers.delete(key);
        }
      }
    }
  },

  /**
   * Clear the entire cache.
   */
  flush() {
    store.clear();
    for (const timer of timers.values()) {
      clearTimeout(timer);
    }
    timers.clear();
  },

  /**
   * Get cache stats (useful for debugging).
   */
  stats() {
    return {
      size: store.size,
      keys: Array.from(store.keys()),
    };
  },
};

export default cache;
