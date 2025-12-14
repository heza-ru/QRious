import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../hooks/useAnimationVariants';

interface AnalysisScreenProps {
  url: string;
}

export function AnalysisScreen({ url }: AnalysisScreenProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-background-primary p-4 sm:p-8"
    >
      <div className="w-full max-w-md space-y-6 sm:space-y-8 text-center px-4">
        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto relative">
            {/* Subtle pulse animation */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-text-secondary/20"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-text-secondary/30"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.3,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-text-secondary" />
            </div>
          </div>
        </motion.div>

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="text-text-primary text-base sm:text-lg">Analyzing URL</div>
          <div className="text-text-secondary text-xs sm:text-sm font-mono break-all">
            {url}
          </div>
        </motion.div>

        {/* Subtle background pulse */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, rgba(160, 160, 160, 0.02) 0%, transparent 70%)',
              'radial-gradient(circle at 50% 50%, rgba(160, 160, 160, 0.04) 0%, transparent 70%)',
              'radial-gradient(circle at 50% 50%, rgba(160, 160, 160, 0.02) 0%, transparent 70%)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </motion.div>
  );
}

