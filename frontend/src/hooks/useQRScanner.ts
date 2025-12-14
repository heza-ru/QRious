import { useEffect, useRef, useState, useCallback } from 'react';

interface UseQRScannerOptions {
  onScan?: (text: string) => void;
}

export function useQRScanner(options: UseQRScannerOptions = {}) {
  const { onScan } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedText, setScannedText] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  useEffect(() => {
    // Create canvas for frame extraction
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    canvasRef.current = canvas;

    // Create worker
    const worker = new Worker(
      new URL('../components/Scanner/QRDecoder.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event) => {
      if (event.data.success && event.data.text) {
        // Avoid duplicate scans
        if (lastScannedRef.current !== event.data.text) {
          lastScannedRef.current = event.data.text;
          setScannedText(event.data.text);
          if (onScan) {
            onScan(event.data.text);
          }
          setIsScanning(false);
        }
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
    };

    workerRef.current = worker;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      worker.terminate();
      stopScanning();
    };
  }, [onScan]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !workerRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Send to worker
    workerRef.current.postMessage({
      imageData: imageData.data.buffer,
      width: canvas.width,
      height: canvas.height,
    }, [imageData.data.buffer]);
  }, []);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setHasPermission(true);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);

        // Start capturing frames after video is ready
        const startCapture = () => {
          if (videoRef.current?.readyState === 4) {
            const captureLoop = () => {
              if (videoRef.current?.readyState === 4 && streamRef.current) {
                captureFrame();
              }
              if (streamRef.current) {
                animationFrameRef.current = requestAnimationFrame(captureLoop);
              }
            };
            captureLoop();
          } else {
            // Wait for video to be ready
            setTimeout(startCapture, 100);
          }
        };
        startCapture();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access camera');
      setHasPermission(false);
      setIsScanning(false);
    }
  }, [captureFrame]);

  const stopScanning = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  }, []);

  return {
    videoRef,
    isScanning,
    error,
    hasPermission,
    scannedText,
    startScanning,
    stopScanning,
  };
}

