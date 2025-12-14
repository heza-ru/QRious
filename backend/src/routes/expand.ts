import { Hono } from 'hono';
import { expandRequestSchema, sanitizeUrl } from '../utils/validators.js';
import { urlExpansionService } from '../services/urlExpansion.js';
import { cacheService } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export const expandRouter = new Hono();

expandRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate request
    const validationResult = expandRequestSchema.safeParse(body);
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
    const cacheKey = `expand:${url}`;

    // Check cache
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return c.json(cached);
    }

    // Expand URL
    const result = await urlExpansionService.expandUrl(url);

    // Cache the result
    cacheService.set(cacheKey, result);

    return c.json(result);
  } catch (error) {
    logger.error('Error in expand endpoint', error);
    return c.json(
      {
        error: 'Internal server error',
        message: 'An error occurred while expanding the URL',
      },
      500
    );
  }
});

