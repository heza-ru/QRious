import { motion } from 'framer-motion';
import { ShieldCheck } from 'phosphor-react';
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
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto relative">
            {/* Outer pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-accent-safe/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-accent-safe/20"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.3,
              }}
            />
            {/* Rotating shield icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <ShieldCheck size={40} weight="duotone" className="text-accent-safe" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-text-primary text-lg sm:text-xl font-medium flex items-center justify-center gap-2"
          >
            <ShieldCheck size={20} weight="bold" className="text-accent-safe" />
            Analyzing URL Security
          </motion.div>
          <div className="text-text-secondary text-xs sm:text-sm font-mono break-all bg-background-secondary/50 p-3 rounded-lg">
            {url}
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-1 bg-accent-safe/20 rounded-full overflow-hidden"
          >
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="h-full w-1/3 bg-accent-safe rounded-full"
            />
          </motion.div>
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

