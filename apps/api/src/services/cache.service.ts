import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * In-memory cache abstraction for import drafts.
 * Can be swapped to Redis in production by implementing the same interface.
 */

interface CacheEntry<T> {
  data: T;
  expires_at: number; // timestamp ms
}

const store = new Map<string, CacheEntry<unknown>>();

// Periodic cleanup of expired entries (every 60 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expires_at <= now) {
      store.delete(key);
    }
  }
}, 60_000);

export const cacheService = {
  /**
   * Store data with a TTL.
   */
  set<T>(key: string, data: T, ttlMinutes: number = env.IMPORT_TTL_MINUTES): void {
    store.set(key, {
      data,
      expires_at: Date.now() + ttlMinutes * 60 * 1000,
    });
    logger.info(`Cache SET: ${key} (TTL: ${ttlMinutes}m)`);
  },

  /**
   * Retrieve data if it exists and hasn't expired.
   */
  get<T>(key: string): T | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expires_at <= Date.now()) {
      store.delete(key);
      return null;
    }
    return entry.data as T;
  },

  /**
   * Delete a cache entry.
   */
  delete(key: string): boolean {
    return store.delete(key);
  },
};
