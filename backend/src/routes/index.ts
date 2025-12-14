import { Hono } from 'hono';
import { scanRouter } from './scan.js';
import { expandRouter } from './expand.js';
import { analyzeRouter } from './analyze.js';
import { rateLimiter } from '../middleware/rateLimit.js';
import { corsMiddleware } from '../middleware/cors.js';
import { logger } from '../utils/logger.js';
import { scanRequestSchema, sanitizeUrl } from '../utils/validators.js';

export const apiRouter = new Hono();

// Apply CORS middleware
apiRouter.use('*', corsMiddleware());

// Rate limiting middleware
apiRouter.use('*', async (c, next) => {
  const clientIp = c.req.header('x-forwarded-for') || 
                   c.req.header('x-real-ip') || 
                   'unknown';
  
  const rateLimitResult = rateLimiter.check(clientIp);
  
  // Set rate limit headers
  c.header('X-RateLimit-Limit', rateLimiter.getMaxTokens().toString());
  c.header('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  c.header('X-RateLimit-Reset', new Date(rateLimitResult.resetAt).toISOString());
  
  if (!rateLimitResult.allowed) {
    return c.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
      },
      429
    );
  }
  
  await next();
});

// Mount routes
apiRouter.route('/scan', scanRouter);
apiRouter.route('/expand', expandRouter);
apiRouter.route('/analyze', analyzeRouter);

// Combined scan-and-analyze endpoint
apiRouter.post('/scan-and-analyze', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate scan request
    const scanValidation = scanRequestSchema.safeParse(body);
    if (!scanValidation.success) {
      return c.json(
        {
          error: 'Validation failed',
          message: scanValidation.error.errors[0].message,
        },
        400
      );
    }

    // Extract URL
    let url: string | null = null;
    if (body.url) {
      url = sanitizeUrl(body.url);
    } else if (body.qrData) {
      try {
        url = sanitizeUrl(body.qrData);
      } catch (error) {
        return c.json(
          {
            error: 'Invalid QR data',
            message: 'Could not extract URL from QR code data',
          },
          400
        );
      }
    }

    if (!url) {
      return c.json(
        {
          error: 'Missing data',
          message: 'Either qrData or url must be provided',
        },
        400
      );
    }

    // Analyze URL (this includes expansion)
    const { urlAnalysisService } = await import('../services/urlAnalysis.js');
    const result = await urlAnalysisService.analyzeUrl(url);
    
    return c.json({
      url,
      ...result,
    });
  } catch (error) {
    logger.error('Error in scan-and-analyze endpoint', error);
    return c.json(
      {
        error: 'Internal server error',
        message: 'An error occurred while processing the request',
      },
      500
    );
  }
});

