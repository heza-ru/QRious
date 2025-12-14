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

      // Clean up any existing scanner instance before creating a new one
      if (qrScannerRef.current) {
        try {
          qrScannerRef.current.stop();
          qrScannerRef.current.destroy();
        } catch (cleanupError) {
          console.error('Error cleaning up existing scanner:', cleanupError);
        }
        qrScannerRef.current = null;
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

      // Start scanning BEFORE assigning to ref
      // If start() fails, we need to explicitly destroy the instance
      try {
        await qrScanner.start();
      } catch (startError) {
        // Explicitly destroy the instance if start() fails
        try {
          qrScanner.destroy();
        } catch (destroyError) {
          console.error('Error destroying scanner after failed start:', destroyError);
        }
        throw startError; // Re-throw to be handled by outer catch
      }
      
      // Only assign to ref after successful start
      qrScannerRef.current = qrScanner;
      setHasPermission(true);
      setIsScanning(true);
    } catch (err) {
      // Error handling - the qrScanner instance has already been destroyed if start() failed
      // The ref cleanup at the start of this function handles any previous instances.
      
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

