import { Hono } from 'hono';
import { analyzeRequestSchema, sanitizeUrl } from '../utils/validators.js';
import { urlAnalysisService } from '../services/urlAnalysis.js';
import { cacheService } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export const analyzeRouter = new Hono();

analyzeRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate request
    const validationResult = analyzeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          error: 'Validation failed',
          message: validationResult.error.errors[0].message,
        },
        400
      );
    }

    const url = sanitizeUrl(body.url);
    const cacheKey = `analyze:${url}`;

    // Check cache
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return c.json(cached);
    }

    // Analyze URL
    const result = await urlAnalysisService.analyzeUrl(url);

    // Cache the result
    cacheService.set(cacheKey, result);

    return c.json(result);
  } catch (error) {
    logger.error('Error in analyze endpoint', error);
    return c.json(
      {
        error: 'Internal server error',
        message: 'An error occurred while analyzing the URL',
      },
      500
    );
  }
});

