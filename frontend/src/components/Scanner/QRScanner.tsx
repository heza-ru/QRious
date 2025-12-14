import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useQRScanner } from '../../hooks/useQRScanner';
import { Upload } from 'phosphor-react';

interface QRScannerProps {
  onScan: (url: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const { videoRef, isScanning, error, hasPermission, startScanning, stopScanning, scanFromFile } = useQRScanner({ onScan });
  const [showInstruction, setShowInstruction] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      if (onError) {
        onError('Please select an image file');
      }
      return;
    }

    setIsUploading(true);
    try {
      await scanFromFile(file);
    } catch (err) {
      if (onError) {
        onError(err instanceof Error ? err.message : 'Failed to scan QR code from image');
      }
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

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
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera feed container */}
      <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-background-secondary max-h-[70vh]">
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

      {/* Upload button */}
      <button
        onClick={handleUploadClick}
        disabled={isUploading}
        className="flex items-center gap-2 px-6 py-3 bg-background-secondary rounded-xl text-text-primary hover:bg-background-tertiary active:bg-background-tertiary transition-colors touch-manipulation min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload size={20} weight="bold" />
        <span>{isUploading ? 'Scanning...' : 'Upload QR Code Image'}</span>
      </button>
    </div>
  );
}

