import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sparkle } from 'phosphor-react';

interface PreloaderScreenProps {
  onComplete: () => void;
}

export function PreloaderScreen({ onComplete }: PreloaderScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress - faster loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 3;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        onComplete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-background-primary relative overflow-hidden"
    >
      {/* Enhanced animated background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 30% 50%, rgba(0, 255, 136, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(0, 255, 136, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 50%, rgba(0, 255, 136, 0.2) 0%, transparent 50%), radial-gradient(circle at 30% 50%, rgba(0, 255, 136, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 50%, rgba(0, 255, 136, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(0, 255, 136, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2 + Math.random() * 1,
            repeat: Infinity,
            delay: Math.random() * 1.5,
            ease: 'easeInOut',
          }}
        >
          <Sparkle size={16} weight="fill" className="text-accent-safe" />
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Enhanced loading spinner with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.6,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="relative w-20 h-20"
        >
          {/* Glowing background */}
          <motion.div
            className="absolute inset-0 bg-accent-safe/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          <motion.div
            className="absolute inset-0 border-4 border-accent-safe/20 rounded-full"
          />
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-t-accent-safe rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.6))',
            }}
          />
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-r-accent-safe/50 rounded-full"
            animate={{ rotate: -360 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>

        {/* Enhanced Progress Bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '200px' }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="w-[200px] h-2 bg-background-secondary rounded-full overflow-hidden relative"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-accent-safe/50 via-accent-safe to-accent-safe/50 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.div
              className="absolute inset-0 bg-white/30"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        </motion.div>

        {/* Enhanced Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0.5, 1, 0.5], y: 0 }}
          transition={{
            opacity: {
              duration: 1.5,
              repeat: Infinity,
              delay: 0.3,
            },
            y: {
              duration: 0.4,
              delay: 0.3,
            },
          }}
          className="text-text-disabled text-xs mt-2 font-medium"
        >
          Initializing...
        </motion.div>
      </div>
    </motion.div>
  );
}
