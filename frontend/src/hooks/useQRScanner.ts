import { useEffect, useRef, useState, useCallback } from 'react';
import QrScanner from 'qr-scanner';

interface UseQRScannerOptions {
  onScan?: (text: string) => void;
}

export function useQRScanner(options: UseQRScannerOptions = {}) {
  const { onScan } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedText, setScannedText] = useState<string | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      
      if (!videoRef.current) {
        return;
      }

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setError('No camera found');
        setHasPermission(false);
        return;
      }

      // Create QrScanner instance
      // Using legacy API to get string result directly
      const qrScanner = new QrScanner(
        videoRef.current,
        (result: string) => {
          // Avoid duplicate scans
          if (lastScannedRef.current !== result) {
            lastScannedRef.current = result;
            setScannedText(result);
            if (onScan) {
              onScan(result);
            }
            setIsScanning(false);
          }
        },
        undefined, // onDecodeError
        undefined, // calculateScanRegion
        'environment' // preferredCamera - Use back camera on mobile
      );

      qrScannerRef.current = qrScanner;

      // Start scanning
      await qrScanner.start();
      setHasPermission(true);
      setIsScanning(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      setHasPermission(false);
      setIsScanning(false);
      console.error('QR Scanner error:', err);
    }
  }, [onScan]);

  const stopScanning = useCallback(() => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  // Function to scan from file
  const scanFromFile = useCallback(async (file: File) => {
    try {
      setError(null);
      const result = await QrScanner.scanImage(file);
      
      if (result) {
        if (lastScannedRef.current !== result) {
          lastScannedRef.current = result;
          setScannedText(result);
          if (onScan) {
            onScan(result);
          }
        }
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan image';
      setError(errorMessage);
      throw err;
    }
  }, [onScan]);

  return {
    videoRef,
    isScanning,
    error,
    hasPermission,
    scannedText,
    startScanning,
    stopScanning,
    scanFromFile,
  };
}

