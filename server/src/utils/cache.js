/**
 * Simple in-memory cache with TTL support
 * In production, consider using Redis for distributed caching
 */
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Set cache entry with TTL in seconds
   */
  set(key, value, ttlSeconds = 300) { // Default 5 minutes
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set the value
    this.cache.set(key, value);

    // Set TTL timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlSeconds * 1000);

    this.timers.set(key, timer);
  }

  /**
   * Get cache entry
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete cache entry
   */
  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    // Delete from cache
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const cache = new MemoryCache();

/**
 * Cache middleware factory
 */
export const cacheMiddleware = (ttlSeconds = 300, keyGenerator = null) => {
  return (req, res, next) => {
    // Generate cache key
    const key = keyGenerator
      ? keyGenerator(req)
      : `${req.method}:${req.originalUrl}`;

    // Try to get from cache
    const cachedData = cache.get(key);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data, ttlSeconds);
      }
      return originalJson.call(this, data);
    };

    next();
  };
};