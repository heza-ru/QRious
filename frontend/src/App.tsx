import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LaunchScreen } from './components/screens/LaunchScreen';
import { ScannerScreen } from './components/screens/ScannerScreen';
import { UrlRevealScreen } from './components/screens/UrlRevealScreen';
import { AnalysisScreen } from './components/screens/AnalysisScreen';
import { VerdictScreen } from './components/screens/VerdictScreen';
import { SCREENS, type Screen } from './utils/constants';
import { useUrlAnalysis } from './hooks/useUrlAnalysis';
import { expandUrl } from './services/api';
import type { UrlAnalysisResult, RedirectChainItem } from './services/api';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(SCREENS.LAUNCH);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);
  const [redirectChain, setRedirectChain] = useState<RedirectChainItem[]>([]);
  const [analysisResult, setAnalysisResult] = useState<UrlAnalysisResult | null>(null);
  
  const { analyzeUrl } = useUrlAnalysis();

  // Handle launch screen completion
  const handleLaunchComplete = () => {
    setTimeout(() => {
      setCurrentScreen(SCREENS.SCANNER);
    }, 1500);
  };

  // Handle QR scan - wrapped in useCallback to prevent unnecessary re-renders
  const handleScan = useCallback(async (url: string) => {
    setScannedUrl(url);
    setCurrentScreen(SCREENS.ANALYSIS); // Show loading while expanding

    try {
      // Expand URL to get redirect chain
      const expansion = await expandUrl(url);
      setExpandedUrl(expansion.finalUrl);
      setRedirectChain(expansion.redirectChain);
      // Move to URL reveal screen after expansion
      setCurrentScreen(SCREENS.URL_REVEAL);
    } catch (error) {
      console.error('Failed to expand URL:', error);
      // Continue with original URL if expansion fails
      setExpandedUrl(url);
      setRedirectChain([]);
      setCurrentScreen(SCREENS.URL_REVEAL);
    }
  }, []);

  // Handle URL reveal continue
  const handleUrlRevealContinue = async () => {
    if (!expandedUrl) return;

    setCurrentScreen(SCREENS.ANALYSIS);

    try {
      // Analyze URL
      const result = await analyzeUrl(expandedUrl);
      setAnalysisResult(result);
      
      // Move to verdict screen after analysis completes
      setCurrentScreen(SCREENS.VERDICT);
    } catch (error) {
      console.error('Failed to analyze URL:', error);
      // Show error or fallback - could add an error screen here
      // For now, go back to scanner
      handleScanAgain();
    }
  };

  // Handle scan again
  const handleScanAgain = () => {
    setScannedUrl(null);
    setExpandedUrl(null);
    setRedirectChain([]);
    setAnalysisResult(null);
    setCurrentScreen(SCREENS.SCANNER);
  };

  // Handle scanner error
  const handleScannerError = (error: string) => {
    console.error('Scanner error:', error);
    // Could show an error screen or message
  };

  return (
    <div className="min-h-screen w-full bg-background-primary">
      <AnimatePresence mode="wait">
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

