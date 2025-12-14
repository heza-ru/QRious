import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../hooks/useAnimationVariants';

interface LaunchScreenProps {
  onComplete: () => void;
}

export function LaunchScreen({ onComplete }: LaunchScreenProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-background-primary relative overflow-hidden px-4"
      onAnimationComplete={onComplete}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10"
      >
        <div className="text-display text-text-primary mb-4 text-center text-5xl sm:text-display">QRious</div>
      </motion.div>

      {/* Supporting text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-text-secondary text-sm sm:text-base mt-4 relative z-10 text-center"
      >
        Secure QR Code Scanner
      </motion.div>
    </motion.div>
  );
}

