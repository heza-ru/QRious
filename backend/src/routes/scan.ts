import { Hono } from 'hono';
import { scanRequestSchema, sanitizeUrl } from '../utils/validators.js';
import { logger } from '../utils/logger.js';
import type { ScanRequest } from '../types/index.js';

export const scanRouter = new Hono();

scanRouter.post('/', async (c) => {
  try {
    const body = await c.req.json() as ScanRequest;
    
    // Validate request
    const validationResult = scanRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          error: 'Validation failed',
          message: validationResult.error.errors[0].message,
        },
        400
      );
    }

    let url: string | null = null;

    // If URL is provided directly, use it
    if (body.url) {
      url = sanitizeUrl(body.url);
    } else if (body.qrData) {
      // Extract URL from QR code data
      // For now, assume qrData is the URL string
      // In a real implementation, you'd decode the QR code image/data here
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

    return c.json({
      url,
      message: 'URL extracted successfully',
    });
  } catch (error) {
    logger.error('Error in scan endpoint', error);
    return c.json(
      {
        error: 'Internal server error',
        message: 'An error occurred while processing the request',
      },
      500
    );
  }
});

