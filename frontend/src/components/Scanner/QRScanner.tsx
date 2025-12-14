import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useQRScanner } from '../../hooks/useQRScanner';

interface QRScannerProps {
  onScan: (url: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const { videoRef, isScanning, error, hasPermission, startScanning, stopScanning } = useQRScanner({ onScan });
  const [showInstruction, setShowInstruction] = useState(true);

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, [startScanning, stopScanning]);

  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        setShowInstruction(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Listen for QR code detection from worker
  useEffect(() => {
    // This will be handled by the useQRScanner hook
    // We need to expose the scanned URL through a callback
    // For now, we'll use a custom event or prop callback
  }, []);

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-text-secondary text-center mb-6">
          Camera permission is required to scan QR codes.
        </div>
        <button
          onClick={startScanning}
          className="px-6 py-3 bg-background-secondary rounded-xl text-text-primary hover:bg-background-tertiary active:bg-background-tertiary transition-colors touch-manipulation min-h-[48px]"
        >
          Grant Permission
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Camera feed container */}
      <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-background-secondary max-h-[85vh]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Scan frame overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4/5 h-4/5 border-2 border-text-primary/20 rounded-xl relative">
            {/* Corner indicators */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-text-primary rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-text-primary rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-text-primary rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-text-primary rounded-br-xl" />

            {/* Animated scan line */}
            {isScanning && (
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-accent-safe/50"
                initial={{ top: 0 }}
                animate={{ top: '100%' }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </div>
        </div>

        {/* Instruction text */}
        <AnimatePresence>
          {showInstruction && isScanning && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-8 left-0 right-0 text-center"
            >
              <div className="text-text-secondary text-sm px-4">
                Position QR code within the frame
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

