import type { Context } from 'hono';

export function corsMiddleware() {
  return async (c: Context, next: () => Promise<void>) => {
    const origin = c.req.header('Origin');
    
    // Get allowed origins from environment (comma-separated) or default to localhost
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:3000'];
    
    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
    }

    // Check if origin is allowed
    const isAllowed = origin && allowedOrigins.includes(origin);

    if (isAllowed && origin) {
      c.header('Access-Control-Allow-Origin', origin);
      c.header('Access-Control-Allow-Credentials', 'true');
      c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      c.header('Access-Control-Max-Age', '86400');
    }

    // Handle preflight requests
    if (c.req.method === 'OPTIONS') {
      return c.text('', 204);
    }

    await next();
  };
}

