import { motion } from 'framer-motion';
import { useState } from 'react';
import { TrustScore } from '../ui/TrustScore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Copy, Check, ArrowSquareOut } from 'phosphor-react';
import { pageVariants, pageTransition } from '../../hooks/useAnimationVariants';
import { copyToClipboard, getVerdictColor } from '../../utils/helpers';
import type { UrlAnalysisResult } from '../../services/api';

interface VerdictScreenProps {
  result: UrlAnalysisResult;
  onViewDetails?: () => void;
  onScanAgain?: () => void;
}

export function VerdictScreen({ result, onViewDetails, onScanAgain }: VerdictScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(result.expandedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const verdictColor = getVerdictColor(result.verdict);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-background-primary p-4 sm:p-8"
    >
      <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
        {/* Trust Score - Large, centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
            <TrustScore score={result.trustScore} verdict={result.verdict} />
        </motion.div>

        {/* Verdict Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Reasons */}
          {result.reasons.length > 0 && (
            <Card className="p-4 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="text-label text-text-secondary text-xs">ANALYSIS</div>
                <ul className="space-y-2">
                  {result.reasons.map((reason, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="text-text-secondary text-xs sm:text-sm flex items-start"
                    >
                      <span className="text-text-disabled mr-2 flex-shrink-0">•</span>
                      <span className="break-words">{reason}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {/* URL Display */}
          <Card className="p-4 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="text-label text-text-secondary text-xs">FINAL URL</div>
              <div className="text-text-primary font-mono text-xs sm:text-sm break-all">
                {result.expandedUrl}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto"
        >
          <Button
            onClick={handleCopy}
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto flex items-center justify-center gap-2 touch-manipulation"
          >
            {copied ? (
              <>
                <Check size={20} weight="bold" />
                Copied
              </>
            ) : (
              <>
                <Copy size={20} weight="bold" />
                Copy URL
              </>
            )}
          </Button>

          {onViewDetails && (
            <Button
              onClick={onViewDetails}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto flex items-center justify-center gap-2 touch-manipulation"
            >
              <ArrowSquareOut size={20} weight="bold" />
              View Details
            </Button>
          )}

          {onScanAgain && (
            <Button
              onClick={onScanAgain}
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto touch-manipulation"
            >
              Scan Again
            </Button>
          )}
        </motion.div>

        {/* Warning for dangerous URLs */}
        {result.verdict === 'dangerous' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`${verdictColor} text-center text-xs sm:text-sm p-3 sm:p-4 rounded-xl bg-accent-dangerous/10`}
          >
            This URL has been flagged as potentially dangerous. Proceed with caution.
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

