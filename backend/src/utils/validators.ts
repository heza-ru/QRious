import { z } from 'zod';

export const scanRequestSchema = z.object({
  qrData: z.string().optional(),
  url: z.string().url().optional(),
}).refine(data => data.qrData || data.url, {
  message: 'Either qrData or url must be provided',
});

export const expandRequestSchema = z.object({
  url: z.string().url(),
});

export const analyzeRequestSchema = z.object({
  url: z.string().url(),
});

export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove dangerous protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol');
    }
    return urlObj.href;
  } catch {
    // If URL parsing fails, try to fix it
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  }
}

