// Cherokee Bank - Redis Configuration
import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (url) {
      redis = new Redis(url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        lazyConnect: true,
      });
    } else {
      // In-memory fallback for development without Redis
      console.warn('⚠️ REDIS_URL not set. Using in-memory store (not suitable for production).');
      redis = new Redis({
        host: '127.0.0.1',
        port: 6379,
        lazyConnect: true,
        retryStrategy() {
          return null; // Don't retry in dev fallback
        },
      });
    }
  }
  return redis;
}

// Simple in-memory cache fallback when Redis is unavailable
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const r = getRedis();
    return await r.get(key);
  } catch {
    const item = memoryCache.get(key);
    if (item && item.expiresAt > Date.now()) return item.value;
    memoryCache.delete(key);
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  try {
    const r = getRedis();
    await r.setex(key, ttlSeconds, value);
  } catch {
    memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const r = getRedis();
    await r.del(key);
  } catch {
    memoryCache.delete(key);
  }
}

export async function cacheIncr(key: string, ttlSeconds?: number): Promise<number> {
  try {
    const r = getRedis();
    const val = await r.incr(key);
    if (ttlSeconds && val === 1) {
      await r.expire(key, ttlSeconds);
    }
    return val;
  } catch {
    const item = memoryCache.get(key);
    const current = item ? parseInt(item.value, 10) : 0;
    const next = current + 1;
    const exp = ttlSeconds ? Date.now() + ttlSeconds * 1000 : Date.now() + 60000;
    memoryCache.set(key, { value: String(next), expiresAt: item?.expiresAt || exp });
    return next;
  }
}
