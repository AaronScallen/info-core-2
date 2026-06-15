import { Request, Response, NextFunction } from "express";

// Simple in-memory cache (for production, use Redis)
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private cache: Map<string, CacheEntry> = new Map();

  set(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cacheService = new CacheService();

/**
 * Middleware to cache GET requests
 * Usage: router.get('/api/employees', cacheMiddleware(300), getAllEmployees)
 */
export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Create cache key from URL and query params
    const cacheKey = `${req.path}:${JSON.stringify(req.query)}`;

    // Check cache
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return res.json(cachedData);
    }

    console.log(`[CACHE MISS] ${cacheKey}`);

    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to cache the response
    res.json = function (data: any) {
      cacheService.set(cacheKey, data, ttlSeconds);
      return originalJson(data);
    };

    next();
  };
};

/**
 * Middleware to invalidate cache after mutations
 * Usage: router.post('/api/employees', invalidateCacheMiddleware('employees'), createEmployee)
 */
export const invalidateCacheMiddleware = (pattern: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to invalidate cache after successful response
    res.json = function (data: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`[CACHE INVALIDATE] Pattern: ${pattern}`);
        cacheService.invalidate(pattern);
      }
      return originalJson(data);
    };

    next();
  };
};
