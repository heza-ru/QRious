import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { RedirectChain } from '../ui/RedirectChain';
import { Card } from '../ui/Card';
import { pageVariants, pageTransition } from '../../hooks/useAnimationVariants';
import { Link, LinkBreak, ArrowDown, ShieldCheck } from 'phosphor-react';
import type { RedirectChainItem } from '../../services/api';

interface UrlRevealScreenProps {
  url: string;
  originalUrl?: string;
  redirectChain: RedirectChainItem[];
  onContinue: () => void;
}

export function UrlRevealScreen({ url, originalUrl, redirectChain, onContinue }: UrlRevealScreenProps) {
  const [revealedLength, setRevealedLength] = useState(0);
  const isShortened = originalUrl && originalUrl !== url;

  useEffect(() => {
    // Reset revealed length when URL changes
    setRevealedLength(0);
  }, [url]);

  useEffect(() => {
    // Character-by-character reveal animation
    if (revealedLength < url.length) {
      const timer = setTimeout(() => {
        setRevealedLength(prev => Math.min(prev + 1, url.length));
      }, 15);
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
      <div className="w-full max-w-3xl space-y-4 sm:space-y-6">
        {/* Original URL (if shortened) */}
        {isShortened && originalUrl && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 sm:p-6 border-2 border-accent-suspicious/30">
              <div className="flex items-start gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex-shrink-0 mt-1"
                >
                  <LinkBreak size={24} weight="bold" className="text-accent-suspicious" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-label text-accent-suspicious text-xs">SHORTENED URL</span>
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="px-2 py-0.5 bg-accent-suspicious/20 text-accent-suspicious text-xs rounded-full"
                    >
                      Hidden Destination
                    </motion.span>
                  </div>
                  <div className="text-text-primary font-mono text-xs sm:text-sm break-all">
                    {originalUrl}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Arrow indicator for shortened URLs */}
        {isShortened && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="p-2 rounded-full bg-background-secondary"
            >
              <ArrowDown size={24} weight="bold" className="text-text-secondary" />
            </motion.div>
          </motion.div>
        )}

        {/* Expanded/Final URL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isShortened ? 0.5 : 0.2 }}
        >
          <Card className={`p-4 sm:p-6 ${isShortened ? 'border-2 border-accent-safe/30' : ''}`}>
            <div className="flex items-start gap-3 sm:gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: isShortened ? 0.6 : 0.3, type: "spring", stiffness: 200 }}
                className="flex-shrink-0 mt-1"
              >
                {isShortened ? (
                  <ShieldCheck size={24} weight="bold" className="text-accent-safe" />
                ) : (
                  <Link size={24} weight="bold" className="text-text-primary" />
                )}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className={`text-label text-xs ${isShortened ? 'text-accent-safe' : 'text-text-secondary'}`}>
                    {isShortened ? 'REAL DESTINATION' : 'DETECTED URL'}
                  </span>
                  {isShortened && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 }}
                      className="px-2 py-0.5 bg-accent-safe/20 text-accent-safe text-xs rounded-full flex items-center gap-1"
                    >
                      <ShieldCheck size={12} weight="fill" />
                      Expanded
                    </motion.span>
                  )}
                </div>
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
              </div>
            </div>
          </Card>
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

