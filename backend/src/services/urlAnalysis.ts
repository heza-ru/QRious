import type { UrlAnalysisResult, RedirectChainItem } from '../types/index.js';
import { urlExpansionService } from './urlExpansion.js';

interface HeuristicCheck {
  name: string;
  weight: number;
  passed: boolean;
  reason?: string;
}

interface GoogleSafeBrowsingResponse {
  matches?: Array<{
    threatType: string;
    platformType: string;
    threatEntryType: string;
    threat: {
      url: string;
    };
  }>;
}

interface VirusTotalResponse {
  response_code: number;
  positives?: number;
  total?: number;
  url?: string;
}

export class UrlAnalysisService {
  private suspiciousTlds = new Set([
    'tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'click', 'download', 'stream',
  ]);

  private knownMaliciousPatterns = [
    /bit\.ly/i,
    /tinyurl\.com/i,
    /t\.co/i,
    /goo\.gl/i,
    /ow\.ly/i,
  ];

  async analyzeUrl(url: string): Promise<UrlAnalysisResult> {
    // First expand the URL
    const expansion = await urlExpansionService.expandUrl(url);
    const finalUrl = expansion.finalUrl;

    // Run heuristic checks
    const heuristicChecks = this.runHeuristicChecks(finalUrl, expansion.redirectChain);

    // Run external API checks if configured
    const apiChecks = await this.runApiChecks(finalUrl);

    // Calculate trust score
    const trustScore = this.calculateTrustScore(heuristicChecks, apiChecks);

    // Determine verdict
    const verdict = this.determineVerdict(trustScore, heuristicChecks, apiChecks);

    // Collect reasons
    const reasons = this.collectReasons(heuristicChecks, apiChecks, verdict);

    return {
      trustScore,
      verdict,
      reasons,
      expandedUrl: finalUrl,
      redirectChain: expansion.redirectChain,
    };
  }

  private runHeuristicChecks(url: string, redirectChain: RedirectChainItem[]): HeuristicCheck[] {
    const checks: HeuristicCheck[] = [];

    try {
      const urlObj = new URL(url);

      // Check 1: HTTPS enforcement
      checks.push({
        name: 'HTTPS',
        weight: 20,
        passed: urlObj.protocol === 'https:',
        reason: urlObj.protocol === 'https:' ? undefined : 'URL does not use HTTPS',
      });

      // Check 2: Suspicious TLD
      const tld = urlObj.hostname.split('.').pop()?.toLowerCase() || '';
      checks.push({
        name: 'TLD',
        weight: 15,
        passed: !this.suspiciousTlds.has(tld),
        reason: this.suspiciousTlds.has(tld) ? `Suspicious TLD: .${tld}` : undefined,
      });

      // Check 3: IP address instead of domain
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(urlObj.hostname);
      checks.push({
        name: 'IP Address',
        weight: 25,
        passed: !isIpAddress,
        reason: isIpAddress ? 'URL uses IP address instead of domain name' : undefined,
      });

      // Check 4: Suspicious patterns in URL
      const hasSuspiciousPattern = this.knownMaliciousPatterns.some(pattern => pattern.test(url));
      checks.push({
        name: 'URL Pattern',
        weight: 10,
        passed: !hasSuspiciousPattern,
        reason: hasSuspiciousPattern ? 'URL matches known suspicious patterns' : undefined,
      });

      // Check 5: Redirect chain depth
      checks.push({
        name: 'Redirect Depth',
        weight: 10,
        passed: redirectChain.length <= 3,
        reason: redirectChain.length > 3 ? `Deep redirect chain (${redirectChain.length} hops)` : undefined,
      });

      // Check 6: URL obfuscation (excessive length, special characters)
      const pathLength = urlObj.pathname.length;
      const hasExcessiveLength = pathLength > 200;
      const hasManySpecialChars = (url.match(/[%&?=]/g) || []).length > 10;
      checks.push({
        name: 'Obfuscation',
        weight: 10,
        passed: !hasExcessiveLength && !hasManySpecialChars,
        reason: hasExcessiveLength || hasManySpecialChars ? 'URL appears obfuscated' : undefined,
      });

      // Check 7: Domain age / reputation (simplified - would need external service for real check)
      // For now, we'll check if it's a known good domain
      const knownGoodDomains = ['google.com', 'github.com', 'microsoft.com', 'apple.com'];
      const isKnownGood = knownGoodDomains.some(domain => urlObj.hostname.includes(domain));
      checks.push({
        name: 'Domain Reputation',
        weight: 10,
        passed: isKnownGood, // Only pass if domain is in known good list
        reason: undefined,
      });
    } catch (error) {
      // Invalid URL
      checks.push({
        name: 'URL Validity',
        weight: 100,
        passed: false,
        reason: 'Invalid URL format',
      });
    }

    return checks;
  }

  private async runApiChecks(url: string): Promise<{ passed: boolean; reason?: string }[]> {
    const results: { passed: boolean; reason?: string }[] = [];

    // Google Safe Browsing API check
    const safeBrowsingKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    if (safeBrowsingKey) {
      try {
        const safeBrowsingResult = await this.checkGoogleSafeBrowsing(url, safeBrowsingKey);
        results.push(safeBrowsingResult);
      } catch (error) {
        // API check failed, don't penalize
        console.error('Google Safe Browsing API check failed:', error);
      }
    }

    // VirusTotal API check (optional)
    const virusTotalKey = process.env.VIRUSTOTAL_API_KEY;
    if (virusTotalKey) {
      try {
        const virusTotalResult = await this.checkVirusTotal(url, virusTotalKey);
        results.push(virusTotalResult);
      } catch (error) {
        // API check failed, don't penalize
        console.error('VirusTotal API check failed:', error);
      }
    }

    return results;
  }

  private async checkGoogleSafeBrowsing(url: string, apiKey: string): Promise<{ passed: boolean; reason?: string }> {
    try {
      const response = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client: {
              clientId: 'qrious',
              clientVersion: '1.0',
            },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url }],
            },
          }),
        }
      );

      if (!response.ok) {
        return { passed: true }; // Don't penalize on API error
      }

      const data = (await response.json()) as GoogleSafeBrowsingResponse;
      if (data.matches && data.matches.length > 0) {
        const threatTypes = data.matches.map((m) => m.threatType).join(', ');
        return {
          passed: false,
          reason: `Flagged by Google Safe Browsing: ${threatTypes}`,
        };
      }

      return { passed: true };
    } catch (error) {
      return { passed: true }; // Don't penalize on API error
    }
  }

  private async checkVirusTotal(url: string, apiKey: string): Promise<{ passed: boolean; reason?: string }> {
    try {
      // First, submit URL for scanning
      const submitResponse = await fetch('https://www.virustotal.com/vtapi/v2/url/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          apikey: apiKey,
          url: url,
        }),
      });

      if (!submitResponse.ok) {
        return { passed: true }; // Don't penalize on API error
      }

      // For simplicity, we'll just check the report endpoint
      // In production, you'd want to handle the async nature of VirusTotal scanning
      const reportResponse = await fetch(
        `https://www.virustotal.com/vtapi/v2/url/report?apikey=${apiKey}&resource=${encodeURIComponent(url)}`
      );

      if (!reportResponse.ok) {
        return { passed: true };
      }

      const data = (await reportResponse.json()) as VirusTotalResponse;
      if (data.response_code === 1 && data.positives && data.positives > 0) {
        return {
          passed: false,
          reason: `Flagged by ${data.positives} security vendors on VirusTotal`,
        };
      }

      return { passed: true };
    } catch (error) {
      return { passed: true }; // Don't penalize on API error
    }
  }

  private calculateTrustScore(
    heuristicChecks: HeuristicCheck[],
    apiChecks: { passed: boolean; reason?: string }[]
  ): number {
    let score = 100;
    let totalWeight = 0;

    // Deduct points for failed heuristic checks
    for (const check of heuristicChecks) {
      totalWeight += check.weight;
      if (!check.passed) {
        score -= check.weight;
      }
    }

    // Deduct points for failed API checks (heavier weight)
    for (const apiCheck of apiChecks) {
      if (!apiCheck.passed) {
        score -= 30; // API failures are more significant
      }
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  private determineVerdict(
    trustScore: number,
    heuristicChecks: HeuristicCheck[],
    apiChecks: { passed: boolean; reason?: string }[]
  ): 'safe' | 'suspicious' | 'dangerous' {
    // Check for critical failures first
    const criticalFailures = apiChecks.filter(c => !c.passed);
    if (criticalFailures.length > 0) {
      return 'dangerous';
    }

    // Check for high-weight heuristic failures
    const highWeightFailures = heuristicChecks.filter(
      c => !c.passed && c.weight >= 20
    );
    if (highWeightFailures.length > 0) {
      return 'dangerous';
    }

    // Use trust score thresholds
    if (trustScore >= 80) {
      return 'safe';
    } else if (trustScore >= 50) {
      return 'suspicious';
    } else {
      return 'dangerous';
    }
  }

  private collectReasons(
    heuristicChecks: HeuristicCheck[],
    apiChecks: { passed: boolean; reason?: string }[],
    verdict: 'safe' | 'suspicious' | 'dangerous'
  ): string[] {
    const reasons: string[] = [];

    // Add failed heuristic check reasons
    for (const check of heuristicChecks) {
      if (!check.passed && check.reason) {
        reasons.push(check.reason);
      }
    }

    // Add failed API check reasons
    for (const apiCheck of apiChecks) {
      if (!apiCheck.passed && apiCheck.reason) {
        reasons.push(apiCheck.reason);
      }
    }

    // Add positive reasons for safe verdicts
    if (verdict === 'safe' && reasons.length === 0) {
      reasons.push('No security issues detected');
      reasons.push('HTTPS enabled');
      reasons.push('Valid domain name');
    }

    return reasons;
  }
}

export const urlAnalysisService = new UrlAnalysisService();

