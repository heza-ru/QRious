import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { RedirectChain } from '../ui/RedirectChain';
import { pageVariants, pageTransition } from '../../hooks/useAnimationVariants';
import type { RedirectChainItem } from '../../services/api';

interface UrlRevealScreenProps {
  url: string;
  redirectChain: RedirectChainItem[];
  onContinue: () => void;
}

export function UrlRevealScreen({ url, redirectChain, onContinue }: UrlRevealScreenProps) {
  const [revealedLength, setRevealedLength] = useState(0);

  useEffect(() => {
    // Character-by-character reveal animation
    if (revealedLength < url.length) {
      const timer = setTimeout(() => {
        setRevealedLength(prev => Math.min(prev + 1, url.length));
      }, 20); // Adjust speed as needed
      return () => clearTimeout(timer);
    }
  }, [revealedLength, url.length]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-background-primary p-4 sm:p-8"
    >
      <div className="w-full max-w-3xl space-y-4 sm:space-y-8">
        {/* URL Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-4 sm:p-8"
        >
          <div className="text-label text-text-secondary mb-3 sm:mb-4">DETECTED URL</div>
          <div className="text-text-primary font-mono text-xs sm:text-sm break-all leading-relaxed">
            {url.substring(0, revealedLength)}
            {revealedLength < url.length && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-0.5 h-5 bg-text-primary ml-1"
              />
            )}
          </div>
        </motion.div>

        {/* Redirect Chain */}
        {redirectChain.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RedirectChain chain={redirectChain} />
          </motion.div>
        )}

        {/* Continue Button */}
        {revealedLength >= url.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="w-full sm:w-auto px-8 py-4 bg-background-secondary text-text-primary rounded-xl font-medium hover:bg-background-tertiary active:bg-background-tertiary transition-colors touch-manipulation"
            >
              Continue to Analysis
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

