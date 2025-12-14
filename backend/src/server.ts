import { Hono } from 'hono';
import { apiRouter } from './routes/index.js';
import { logger } from './utils/logger.js';

const app = new Hono();

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API routes
app.route('/api', apiRouter);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Not found',
      message: 'The requested resource was not found',
    },
    404
  );
});

// Security headers middleware
app.use('*', async (c, next) => {
  // Security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  c.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://*;"
  );

  await next();
});

// Request size limit middleware
app.use('*', async (c, next) => {
  const contentLength = c.req.header('content-length');
  if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
    // 1MB limit
    return c.json(
      {
        error: 'Request too large',
        message: 'Request body exceeds maximum size',
      },
      413
    );
  }
  await next();
});

// Error handler
app.onError((err, c) => {
  logger.error('Unhandled error', err);
  return c.json(
    {
      error: 'Internal server error',
      message: 'An unexpected error occurred',
    },
    500
  );
});

const port = parseInt(process.env.PORT || '3001', 10);

export default {
  port,
  fetch: app.fetch,
};

// Start server
if (import.meta.main) {
  logger.info(`Server starting on port ${port}`);
  Bun.serve({
    port,
    fetch: app.fetch,
  });
  logger.info(`Server running at http://localhost:${port}`);
}

