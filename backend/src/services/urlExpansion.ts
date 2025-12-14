import type { RedirectChainItem, UrlExpansionResult } from '../types/index.js';

interface ExpansionOptions {
  maxDepth?: number;
  timeout?: number;
}

export class UrlExpansionService {
  private maxDepth: number;
  private timeout: number;

  constructor(options: ExpansionOptions = {}) {
    this.maxDepth = options.maxDepth || parseInt(process.env.MAX_REDIRECT_DEPTH || '10', 10);
    this.timeout = options.timeout || parseInt(process.env.REQUEST_TIMEOUT_MS || '5000', 10);
  }

  async expandUrl(url: string): Promise<UrlExpansionResult> {
    const redirectChain: RedirectChainItem[] = [];
    let currentUrl = url;
    let depth = 0;

    // Normalize URL
    if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
      currentUrl = 'https://' + currentUrl;
    }

    while (depth < this.maxDepth) {
      try {
        const result = await this.followRedirect(currentUrl, redirectChain.length === 0 ? 'HEAD' : 'GET');
        
        redirectChain.push({
          url: currentUrl,
          statusCode: result.statusCode,
          method: result.method,
        });

        // If it's a redirect, continue following
        if (result.statusCode >= 300 && result.statusCode < 400 && result.location) {
          currentUrl = this.resolveUrl(currentUrl, result.location);
          depth++;
        } else {
          // Final destination reached
          break;
        }
      } catch (error) {
        // If HEAD fails, try GET
        if (redirectChain.length === 0) {
          try {
            const result = await this.followRedirect(currentUrl, 'GET');
            redirectChain.push({
              url: currentUrl,
              statusCode: result.statusCode,
              method: 'GET',
            });

            if (result.statusCode >= 300 && result.statusCode < 400 && result.location) {
              currentUrl = this.resolveUrl(currentUrl, result.location);
              depth++;
            } else {
              break;
            }
          } catch (getError) {
            // Both HEAD and GET failed, return what we have
            break;
          }
        } else {
          // Error during redirect chain, return what we have
          break;
        }
      }
    }

    return {
      finalUrl: currentUrl,
      redirectChain,
      depth,
    };
  }

  private async followRedirect(
    url: string,
    method: 'HEAD' | 'GET'
  ): Promise<{ statusCode: number; location?: string; method: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        signal: controller.signal,
        redirect: 'manual', // Handle redirects manually
        headers: {
          'User-Agent': 'QRious/1.0',
        },
      });

      clearTimeout(timeoutId);

      const location = response.headers.get('location') || undefined;

      return {
        statusCode: response.status,
        location,
        method,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private resolveUrl(base: string, relative: string): string {
    try {
      return new URL(relative, base).href;
    } catch {
      // If URL resolution fails, try relative as absolute
      if (relative.startsWith('http://') || relative.startsWith('https://')) {
        return relative;
      }
      // Fallback to base URL
      return base;
    }
  }
}

export const urlExpansionService = new UrlExpansionService();

