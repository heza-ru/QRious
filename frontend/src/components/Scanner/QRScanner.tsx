import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useQRScanner } from '../../hooks/useQRScanner';
import { Upload, CheckCircle, Sparkle, Scan } from 'phosphor-react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScan: (url: string) => void;
  onError?: (error: string) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  // Don't pass onScan to hook - we'll handle it ourselves after animation
  const { videoRef, isScanning, error, hasPermission, startScanning, stopScanning, scannedText } = useQRScanner({});
  const [showInstruction, setShowInstruction] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hasProcessedScan, setHasProcessedScan] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onScanRef = useRef(onScan);
  const pendingScanUrlRef = useRef<string | null>(null);
  
  // Keep onScan ref up to date
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  // Handle scanned text from camera
  useEffect(() => {
    if (scannedText && !hasProcessedScan) {
      console.log('QR Code detected from camera:', scannedText);
      handleScanResult(scannedText);
    }
  }, [scannedText, hasProcessedScan]);

  // Unified function to handle scan results (from camera or file)
  const handleScanResult = (url: string) => {
    if (hasProcessedScan) {
      console.log('Scan already processed, ignoring');
      return;
    }

    console.log('Processing scan result:', url);
    setHasProcessedScan(true);
    stopScanning();
    pendingScanUrlRef.current = url;

    // Get the scan area position for particles
    const videoContainer = videoRef.current?.parentElement;
    if (!videoContainer) {
      console.warn('Video container not found, calling onScan immediately');
      // Fallback: call onScan immediately if we can't show particles
      setTimeout(() => {
        if (onScanRef.current && pendingScanUrlRef.current) {
          onScanRef.current(pendingScanUrlRef.current);
        }
      }, 100);
      return;
    }

    const rect = videoContainer.getBoundingClientRect();
    const scanAreaWidth = rect.width * 0.8;
    const scanAreaHeight = rect.height * 0.8;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Generate particles
    const newParticles: Particle[] = [];
    const gridSize = 12;
    const spacing = Math.min(scanAreaWidth, scanAreaHeight) / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (Math.random() > 0.3) {
          const offsetX = (i - gridSize / 2) * spacing + (Math.random() - 0.5) * spacing * 0.5;
          const offsetY = (j - gridSize / 2) * spacing + (Math.random() - 0.5) * spacing * 0.5;

          newParticles.push({
            id: i * gridSize + j,
            x: centerX + offsetX,
            y: centerY + offsetY,
            size: spacing * 0.8 + Math.random() * spacing * 0.4,
            rotation: Math.random() * 360,
            color: Math.random() > 0.5 ? '#00FF88' : '#000000',
          });
        }
      }
    }

    setParticles(newParticles);
    setShowParticles(true);
    console.log('Particle animation started with', newParticles.length, 'particles');

    // After animation, call onScan
    const timer = setTimeout(() => {
      console.log('Particle animation complete, calling onScan');
      const currentOnScan = onScanRef.current;
      const urlToScan = pendingScanUrlRef.current;
      
      if (currentOnScan && urlToScan) {
        console.log('Calling onScan with URL:', urlToScan);
        try {
          currentOnScan(urlToScan);
          console.log('onScan called successfully');
        } catch (error) {
          console.error('Error in onScan callback:', error);
          // Reset on error
          setHasProcessedScan(false);
          setShowParticles(false);
          pendingScanUrlRef.current = null;
        }
      } else {
        console.error('Cannot call onScan - missing callback or URL', {
          hasCallback: !!currentOnScan,
          hasUrl: !!urlToScan
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  };

  // Start scanning on mount (only if not processed)
  useEffect(() => {
    if (!hasProcessedScan) {
      console.log('Starting scanner');
      startScanning();
    }
    return () => {
      console.log('Cleaning up scanner');
      stopScanning();
    };
  }, [startScanning, stopScanning, hasProcessedScan]);

  // Hide instruction after delay
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        setShowInstruction(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onError) {
        onError('Please select an image file');
      }
      return;
    }

    if (hasProcessedScan) {
      console.log('Scan already processed, ignoring file upload');
      return;
    }

    setIsUploading(true);
    try {
      stopScanning();
      console.log('Scanning file:', file.name);
      const result = await QrScanner.scanImage(file);
      
      if (result) {
        console.log('QR Code found in file:', result);
        handleScanResult(result);
      } else {
        if (onError) {
          onError('No QR code found in image');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan image';
      console.error('File scan error:', err);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    if (!hasProcessedScan) {
      fileInputRef.current?.click();
    }
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

      {/* QR Code Particle Explosion Overlay */}
      <AnimatePresence>
        {showParticles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ 
              perspective: '1000px',
              transformStyle: 'preserve-3d',
            }}
          >
            {particles.map((particle) => {
              const screenCenterX = window.innerWidth / 2;
              const screenCenterY = window.innerHeight / 2;
              const dx = screenCenterX - particle.x;
              const dy = screenCenterY - particle.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);
              const randomAngle = angle + (Math.random() - 0.5) * 0.5;
              const travelDistance = distance * 1.5 + Math.random() * 200;
              const finalX = particle.x + Math.cos(randomAngle) * travelDistance;
              const finalY = particle.y + Math.sin(randomAngle) * travelDistance;
              
              return (
                <motion.div
                  key={particle.id}
                  className="absolute"
                  initial={{
                    x: particle.x,
                    y: particle.y,
                    scale: 1,
                    rotateZ: particle.rotation,
                    opacity: 1,
                    z: 0,
                  }}
                  animate={{
                    x: finalX,
                    y: finalY,
                    scale: 4 + Math.random() * 3,
                    rotateZ: particle.rotation + (Math.random() - 0.5) * 1080,
                    rotateX: Math.random() * 720,
                    rotateY: Math.random() * 720,
                    opacity: [1, 1, 0.8, 0],
                    z: 800 + Math.random() * 400,
                  }}
                  transition={{
                    duration: 1.2 + Math.random() * 0.4,
                    ease: [0.2, 0, 0.2, 1],
                  }}
                  style={{
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    borderRadius: particle.color === '#000000' ? '2px' : '0px',
                    boxShadow: particle.color === '#00FF88' 
                      ? '0 0 15px rgba(0, 255, 136, 0.9), 0 0 30px rgba(0, 255, 136, 0.5), 0 0 50px rgba(0, 255, 136, 0.2)'
                      : '0 0 5px rgba(0, 0, 0, 0.5)',
                    transformStyle: 'preserve-3d',
                    left: 0,
                    top: 0,
                    marginLeft: `-${particle.size / 2}px`,
                    marginTop: `-${particle.size / 2}px`,
                    willChange: 'transform, opacity',
                  }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="w-4/5 h-4/5 border-2 border-accent-safe/40 rounded-xl relative">
            {/* Glowing border */}
            <motion.div
              className="absolute inset-0 border-2 border-accent-safe rounded-xl"
              animate={{
                opacity: [0.3, 0.7, 0.3],
                boxShadow: [
                  '0 0 0 0 rgba(0, 255, 136, 0.4)',
                  '0 0 0 8px rgba(0, 255, 136, 0)',
                  '0 0 0 0 rgba(0, 255, 136, 0)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Corner indicators */}
            {[
              { pos: 'top-left', classes: '-top-1 -left-1 border-t-2 border-l-2 rounded-tl-xl' },
              { pos: 'top-right', classes: '-top-1 -right-1 border-t-2 border-r-2 rounded-tr-xl' },
              { pos: 'bottom-left', classes: '-bottom-1 -left-1 border-b-2 border-l-2 rounded-bl-xl' },
              { pos: 'bottom-right', classes: '-bottom-1 -right-1 border-b-2 border-r-2 rounded-br-xl' },
            ].map((corner) => (
              <motion.div
                key={corner.pos}
                className={`absolute w-10 h-10 border-accent-safe ${corner.classes}`}
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: corner.pos === 'top-left' ? 0 : 
                         corner.pos === 'top-right' ? 0.2 :
                         corner.pos === 'bottom-left' ? 0.4 : 0.6,
                  ease: 'easeInOut',
                }}
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.6))',
                }}
              />
            ))}

            {/* Scan line */}
            {isScanning && !hasProcessedScan && (
              <>
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-safe to-transparent"
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    filter: 'blur(2px)',
                    boxShadow: '0 0 10px rgba(0, 255, 136, 0.8)',
                  }}
                />
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-accent-safe"
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    boxShadow: '0 0 8px rgba(0, 255, 136, 1)',
                  }}
                />
              </>
            )}
            
            {/* Scanning indicators */}
            {isScanning && !hasProcessedScan && (
              <>
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                      transformOrigin: '0 0',
                    }}
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: i * 0.3,
                    }}
                  >
                    <motion.div
                      style={{
                        transform: `translate(-50%, -50%) translateY(-${60 + i * 10}px)`,
                      }}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    >
                      <Scan size={12} weight="fill" className="text-accent-safe" />
                    </motion.div>
                  </motion.div>
                ))}
              </>
            )}

            {/* Success overlay */}
            <AnimatePresence>
              {hasProcessedScan && !showParticles && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.3 }}
                  transition={{ 
                    duration: 0.4,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-accent-safe/30 rounded-xl backdrop-blur-md"
                >
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-xl border-4 border-accent-safe"
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ 
                        scale: [0, 1.5 + i * 0.3, 1.5 + i * 0.3],
                        opacity: [0.8, 0, 0],
                      }}
                      transition={{ 
                        duration: 1,
                        delay: 0.1 + i * 0.15,
                        ease: 'easeOut',
                      }}
                      style={{
                        filter: 'blur(2px)',
                      }}
                    />
                  ))}
                  
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2
                    }}
                    className="relative z-10"
                  >
                    <motion.div
                      animate={{
                        filter: [
                          'drop-shadow(0 0 15px rgba(0, 255, 136, 0.8))',
                          'drop-shadow(0 0 30px rgba(0, 255, 136, 1))',
                          'drop-shadow(0 0 15px rgba(0, 255, 136, 0.8))',
                        ],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        filter: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                        scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                      }}
                    >
                      <CheckCircle 
                        size={100} 
                        weight="fill" 
                        className="text-accent-safe" 
                      />
                    </motion.div>
                    
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          top: '50%',
                          left: '50%',
                          transformOrigin: '0 0',
                        }}
                        initial={{
                          rotate: (i * 45),
                          x: 0,
                          y: 0,
                          opacity: 0,
                        }}
                        animate={{
                          x: [0, 70, 0],
                          y: [0, 70, 0],
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.3 + i * 0.1,
                          ease: 'easeInOut',
                        }}
                      >
                        <Sparkle size={16} weight="fill" className="text-accent-safe" />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Instruction text */}
        <AnimatePresence>
          {showInstruction && isScanning && !hasProcessedScan && (
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
      <motion.button
        onClick={handleUploadClick}
        disabled={isUploading || hasProcessedScan}
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
        }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center gap-3 px-8 py-4 bg-background-secondary rounded-xl text-text-primary hover:bg-background-tertiary active:bg-background-tertiary transition-all touch-manipulation min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-accent-safe/10 via-accent-safe/5 to-accent-safe/10"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          animate={{
            rotate: isUploading ? 360 : 0,
            scale: isUploading ? [1, 1.2, 1] : 1,
          }}
          transition={{
            rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="relative z-10"
        >
          <Upload size={22} weight="bold" className="text-accent-safe" />
        </motion.div>
        <span className="relative z-10 font-medium">
          {isUploading ? 'Scanning...' : 'Upload QR Code Image'}
        </span>
      </motion.button>
    </div>
  );
}
