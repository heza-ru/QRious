import { API_BASE_URL } from '../utils/constants';

export interface RedirectChainItem {
  url: string;
  statusCode: number;
  method: string;
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

export async function scanQRCode(data: ScanRequest): Promise<{ url: string }> {
  const response = await fetch(`${API_BASE_URL}/api/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Failed to scan QR code');
  }

  return response.json();
}

export async function expandUrl(url: string): Promise<{
  finalUrl: string;
  redirectChain: RedirectChainItem[];
  depth: number;
}> {
  const response = await fetch(`${API_BASE_URL}/api/expand`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Failed to expand URL');
  }

  return response.json();
}

export async function analyzeUrl(url: string): Promise<UrlAnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Failed to analyze URL');
  }

  return response.json();
}

export async function scanAndAnalyze(data: ScanRequest): Promise<UrlAnalysisResult & { url: string }> {
  const response = await fetch(`${API_BASE_URL}/api/scan-and-analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Failed to scan and analyze');
  }

  return response.json();
}

