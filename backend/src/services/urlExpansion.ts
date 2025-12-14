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
    const visitedUrls = new Set<string>(); // Prevent infinite loops

    // Normalize URL
    if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
      currentUrl = 'https://' + currentUrl;
    }

    while (depth < this.maxDepth) {
      // Normalize and check for loops
      try {
        const urlObj = new URL(currentUrl);
        const normalizedUrl = urlObj.href;
        
        if (visitedUrls.has(normalizedUrl)) {
          // Circular redirect detected
          break;
        }
        visitedUrls.add(normalizedUrl);
      } catch {
        // Invalid URL, break
        break;
      }

      try {
        // Try HEAD first for efficiency, but always use GET for shortened URL services
        const useHead = !this.isShortenedUrlService(currentUrl);
        const result = await this.followRedirect(currentUrl, useHead ? 'HEAD' : 'GET');
        
        redirectChain.push({
          url: currentUrl,
          statusCode: result.statusCode,
          method: result.method,
        });

        // Check for redirect status codes first
        if (result.statusCode >= 300 && result.statusCode < 400 && result.location) {
          const nextUrl = this.resolveUrl(currentUrl, result.location);
          if (nextUrl === currentUrl) {
            // No change in URL, break to avoid infinite loop
            break;
          }
          currentUrl = nextUrl;
          depth++;
        } else if (result.html) {
          // Check for meta refresh or JavaScript redirects in HTML (for any status code)
          const redirectUrl = this.extractRedirectFromHtml(result.html, currentUrl);
          if (redirectUrl && redirectUrl !== currentUrl) {
            currentUrl = redirectUrl;
            depth++;
          } else if (result.statusCode === 200) {
            // Final destination reached (200 and no redirect in HTML)
            break;
          } else {
            // Non-200 status and no redirect found, break
            break;
          }
        } else {
          // Final destination reached (no HTML to check)
          break;
        }
      } catch (error) {
        // If HEAD fails, try GET
        if (redirectChain.length === 0 || redirectChain[redirectChain.length - 1].method === 'HEAD') {
          try {
            const result = await this.followRedirect(currentUrl, 'GET');
            redirectChain.push({
              url: currentUrl,
              statusCode: result.statusCode,
              method: 'GET',
            });

            if (result.statusCode >= 300 && result.statusCode < 400 && result.location) {
              const nextUrl = this.resolveUrl(currentUrl, result.location);
              if (nextUrl === currentUrl) {
                break;
              }
              currentUrl = nextUrl;
              depth++;
            } else if (result.html) {
              const redirectUrl = this.extractRedirectFromHtml(result.html, currentUrl);
              if (redirectUrl && redirectUrl !== currentUrl) {
                currentUrl = redirectUrl;
                depth++;
              } else if (result.statusCode === 200) {
                break;
              } else {
                break;
              }
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

  private isShortenedUrlService(url: string): boolean {
    const shortenedDomains = [
      'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly',
      'short.link', 'cutt.ly', 'rebrand.ly', 'shorturl.at', 'tiny.cc'
    ];
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return shortenedDomains.some(domain => hostname.includes(domain));
    } catch {
      return false;
    }
  }

  private extractRedirectFromHtml(html: string, baseUrl: string): string | null {
    // Check for meta refresh redirect (more flexible pattern)
    const metaRefreshPatterns = [
      /<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"'>\s;]+)/i,
      /<meta[^>]*content=["'][^"']*url=([^"'>\s;]+)[^"']*["'][^>]*http-equiv=["']refresh["']/i,
    ];
    
    for (const pattern of metaRefreshPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        try {
          let url = match[1].trim();
          // Remove any trailing semicolons or quotes
          url = url.replace(/[;"']+$/, '');
          return new URL(url, baseUrl).href;
        } catch {
          continue;
        }
      }
    }

    // Check for JavaScript window.location redirects (more patterns)
    const jsPatterns = [
      /window\.location\s*=\s*["']([^"']+)["']/i,
      /window\.location\.href\s*=\s*["']([^"']+)["']/i,
      /window\.location\.replace\s*\(\s*["']([^"']+)["']/i,
      /location\.href\s*=\s*["']([^"']+)["']/i,
      /location\.replace\s*\(\s*["']([^"']+)["']/i,
    ];

    for (const pattern of jsPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        try {
          return new URL(match[1], baseUrl).href;
        } catch {
          continue;
        }
      }
    }

    // Check for <a> tags with redirect-like behavior (for some services)
    // This is less reliable but can catch some edge cases
    const linkMatch = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*class=["'][^"']*redirect/i);
    if (linkMatch && linkMatch[1]) {
      try {
        const url = new URL(linkMatch[1], baseUrl).href;
        // Only use if it's different from base
        if (url !== baseUrl) {
          return url;
        }
      } catch {
        // Ignore
      }
    }

    return null;
  }

  private async followRedirect(
    url: string,
    method: 'HEAD' | 'GET'
  ): Promise<{ statusCode: number; location?: string; method: string; html?: string }> {
    const controller = new AbortController();
    // Increase timeout for shortened URL services
    const timeout = this.isShortenedUrlService(url) ? this.timeout * 2 : this.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        signal: controller.signal,
        redirect: 'manual', // Handle redirects manually
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': method === 'GET' ? 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' : '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      clearTimeout(timeoutId);

      const location = response.headers.get('location') || 
                      response.headers.get('Location') || 
                      undefined;

      let html: string | undefined;
      // Read HTML for GET requests to check for meta refresh or JavaScript redirects
      // Also check for shortened URL services even if status is not 200
      if (method === 'GET') {
        try {
          const contentType = response.headers.get('content-type') || '';
          // Read HTML if it's HTML content, or if it's a shortened URL service (might have redirects in HTML)
          if (contentType.includes('text/html') || this.isShortenedUrlService(url)) {
            html = await response.text();
          }
        } catch {
          // Ignore errors reading body
        }
      }

      return {
        statusCode: response.status,
        location,
        method,
        html,
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

