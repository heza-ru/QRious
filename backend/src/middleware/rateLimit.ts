interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

export class RateLimiter {
  private buckets: Map<string, RateLimitEntry>;
  private maxTokens: number;
  private refillRate: number; // tokens per millisecond
  private windowMs: number;

  constructor(requestsPerMinute: number = 100) {
    this.buckets = new Map();
    this.maxTokens = requestsPerMinute;
    this.windowMs = 60 * 1000; // 1 minute
    this.refillRate = requestsPerMinute / this.windowMs;
  }

  getMaxTokens(): number {
    return this.maxTokens;
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    let entry = this.buckets.get(identifier);

    if (!entry) {
      entry = {
        tokens: this.maxTokens,
        lastRefill: now,
      };
      this.buckets.set(identifier, entry);
    }

    // Refill tokens based on time passed
    const timePassed = now - entry.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;
    entry.tokens = Math.min(this.maxTokens, entry.tokens + tokensToAdd);
    entry.lastRefill = now;

    // Check if request is allowed
    if (entry.tokens >= 1) {
      entry.tokens -= 1;
      const resetAt = now + ((this.maxTokens - entry.tokens) / this.refillRate);
      return {
        allowed: true,
        remaining: Math.floor(entry.tokens),
        resetAt: Math.ceil(resetAt),
      };
    } else {
      const resetAt = now + ((1 - entry.tokens) / this.refillRate);
      return {
        allowed: false,
        remaining: 0,
        resetAt: Math.ceil(resetAt),
      };
    }
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now();
    const maxAge = this.windowMs * 2; // Keep entries for 2 windows

    for (const [key, entry] of this.buckets.entries()) {
      if (now - entry.lastRefill > maxAge) {
        this.buckets.delete(key);
      }
    }
  }
}

// Singleton instance
const requestsPerMinute = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '100', 10);
export const rateLimiter = new RateLimiter(requestsPerMinute);

// Cleanup every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);

