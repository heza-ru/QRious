export interface RedirectChainItem {
  url: string;
  statusCode: number;
  method: string;
}

export interface UrlExpansionResult {
  finalUrl: string;
  redirectChain: RedirectChainItem[];
  depth: number;
}

export interface UrlAnalysisResult {
  trustScore: number;
  verdict: 'safe' | 'suspicious' | 'dangerous';
  reasons: string[];
  expandedUrl: string;
  redirectChain: RedirectChainItem[];
}

export interface ScanRequest {
  qrData?: string;
  url?: string;
}

export interface ApiError {
  error: string;
  message: string;
  code?: string;
}

