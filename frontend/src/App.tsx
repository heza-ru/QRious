import { useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PreloaderScreen } from './components/screens/PreloaderScreen';
import { LaunchScreen } from './components/screens/LaunchScreen';
import { ScannerScreen } from './components/screens/ScannerScreen';
import { UrlRevealScreen } from './components/screens/UrlRevealScreen';
import { AnalysisScreen } from './components/screens/AnalysisScreen';
import { VerdictScreen } from './components/screens/VerdictScreen';
import { SCREENS, type Screen } from './utils/constants';
import { useUrlAnalysis } from './hooks/useUrlAnalysis';
import { expandUrl } from './services/api';
import type { UrlAnalysisResult, RedirectChainItem } from './services/api';

// Client-side fallback analysis function
function createFallbackAnalysis(url: string): UrlAnalysisResult {
  const reasons: string[] = [];
  let trustScore = 100;
  let verdict: 'safe' | 'suspicious' | 'dangerous' = 'safe';

  try {
    const urlObj = new URL(url);
    
    // Check HTTPS
    if (urlObj.protocol !== 'https:') {
      trustScore -= 20;
      reasons.push('URL does not use HTTPS');
    } else {
      reasons.push('HTTPS enabled');
    }

    // Check suspicious TLDs
    const suspiciousTlds = ['tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'click', 'download', 'stream'];
    const tld = urlObj.hostname.split('.').pop()?.toLowerCase() || '';
    if (suspiciousTlds.includes(tld)) {
      trustScore -= 15;
      reasons.push(`Suspicious TLD: .${tld}`);
    }

    // Check IP address
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(urlObj.hostname);
    if (isIpAddress) {
      trustScore -= 25;
      reasons.push('URL uses IP address instead of domain name');
    }

    // Check URL length
    if (urlObj.pathname.length > 200) {
      trustScore -= 10;
      reasons.push('URL appears obfuscated (excessive length)');
    }

    // Determine verdict
    if (trustScore >= 80) {
      verdict = 'safe';
    } else if (trustScore >= 50) {
      verdict = 'suspicious';
    } else {
      verdict = 'dangerous';
    }

    if (reasons.length === 0 && verdict === 'safe') {
      reasons.push('No security issues detected');
    }
  } catch (error) {
    trustScore = 0;
    verdict = 'dangerous';
    reasons.push('Invalid URL format');
  }

  return {
    trustScore: Math.max(0, Math.min(100, trustScore)),
    verdict,
    reasons,
    expandedUrl: url,
    redirectChain: [],
  };
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(SCREENS.PRELOADER);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);
  const [redirectChain, setRedirectChain] = useState<RedirectChainItem[]>([]);
  const [analysisResult, setAnalysisResult] = useState<UrlAnalysisResult | null>(null);
  const isProcessingScanRef = useRef(false);
  
  const { analyzeUrl } = useUrlAnalysis();

  // Handle preloader completion
  const handlePreloaderComplete = () => {
    setCurrentScreen(SCREENS.LAUNCH);
  };

  // Handle launch screen completion
  const handleLaunchComplete = () => {
    setTimeout(() => {
      setCurrentScreen(SCREENS.SCANNER);
    }, 1500);
  };

  // Handle QR scan - wrapped in useCallback to prevent unnecessary re-renders
  const handleScan = useCallback(async (url: string) => {
    // Prevent multiple simultaneous scans
    if (isProcessingScanRef.current) {
      console.warn('Scan already in progress, ignoring duplicate scan');
      return;
    }
    
    isProcessingScanRef.current = true;
    console.log('handleScan called with URL:', url);
    console.log('Current screen before scan:', currentScreen);
    
    try {
      // Immediately set the scanned URL and change screen to prevent going back to scanner
      setScannedUrl(url);
      console.log('Setting screen to ANALYSIS immediately');
      setCurrentScreen(SCREENS.ANALYSIS); // Show loading while expanding

      try {
        console.log('Expanding URL:', url);
        // Expand URL to get redirect chain
        const expansion = await expandUrl(url);
        console.log('URL expanded. Final URL:', expansion.finalUrl);
        setExpandedUrl(expansion.finalUrl);
        setRedirectChain(expansion.redirectChain);
        // Move to URL reveal screen after expansion
        console.log('Setting screen to URL_REVEAL');
        setCurrentScreen(SCREENS.URL_REVEAL);
      } catch (error) {
        console.error('Failed to expand URL:', error);
        // Continue with original URL if expansion fails
        setExpandedUrl(url);
        setRedirectChain([]);
        console.log('Setting screen to URL_REVEAL (fallback)');
        setCurrentScreen(SCREENS.URL_REVEAL);
      }
    } finally {
      // Reset the flag after a delay to allow navigation to complete
      setTimeout(() => {
        isProcessingScanRef.current = false;
      }, 2000);
    }
  }, []);

  // Handle scan again
  const handleScanAgain = useCallback(() => {
    setScannedUrl(null);
    setExpandedUrl(null);
    setRedirectChain([]);
    setAnalysisResult(null);
    setCurrentScreen(SCREENS.SCANNER);
  }, []);

  // Handle URL reveal continue
  const handleUrlRevealContinue = useCallback(async () => {
    if (!expandedUrl) {
      console.error('No expanded URL available');
      return;
    }

    // Set analysis screen first
    setCurrentScreen(SCREENS.ANALYSIS);

    try {
      // Analyze URL
      console.log('Starting URL analysis for:', expandedUrl);
      const result = await analyzeUrl(expandedUrl);
      console.log('Analysis result:', result);
      
      if (!result) {
        throw new Error('Analysis returned no result');
      }
      
      setAnalysisResult(result);
      
      // Move to verdict screen after analysis completes
      setCurrentScreen(SCREENS.VERDICT);
    } catch (error) {
      console.error('Failed to analyze URL:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        url: expandedUrl,
        apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      });
      
      // Create a fallback result using client-side analysis
      // This allows the app to work even if the backend is unavailable
      const fallbackResult = createFallbackAnalysis(expandedUrl);
      setAnalysisResult(fallbackResult);
      setCurrentScreen(SCREENS.VERDICT);
    }
  }, [expandedUrl, analyzeUrl]);

  // Handle scanner error
  const handleScannerError = (error: string) => {
    console.error('Scanner error:', error);
    // Could show an error screen or message
  };

  return (
    <div className="min-h-screen w-full bg-background-primary">
      <AnimatePresence mode="wait">
        {currentScreen === SCREENS.PRELOADER && (
          <PreloaderScreen key="preloader" onComplete={handlePreloaderComplete} />
        )}

        {currentScreen === SCREENS.LAUNCH && (
          <LaunchScreen key="launch" onComplete={handleLaunchComplete} />
        )}

        {currentScreen === SCREENS.SCANNER && (
          <ScannerScreen
            key="scanner"
            onScan={handleScan}
            onError={handleScannerError}
          />
        )}

        {currentScreen === SCREENS.URL_REVEAL && expandedUrl && (
          <UrlRevealScreen
            key="url-reveal"
            url={expandedUrl}
            originalUrl={scannedUrl || undefined}
            redirectChain={redirectChain}
            onContinue={handleUrlRevealContinue}
          />
        )}

        {currentScreen === SCREENS.ANALYSIS && (
          <AnalysisScreen 
            key="analysis" 
            url={expandedUrl || scannedUrl || 'Analyzing...'} 
          />
        )}

        {currentScreen === SCREENS.VERDICT && analysisResult && (
          <VerdictScreen
            key="verdict"
            result={analysisResult}
            onScanAgain={handleScanAgain}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

