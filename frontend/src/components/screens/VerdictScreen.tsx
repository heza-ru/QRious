import { motion } from 'framer-motion';
import { useState } from 'react';
import { TrustScore } from '../ui/TrustScore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Copy, Check, ArrowSquareOut, ShieldCheck, Warning, XCircle, Link } from 'phosphor-react';
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
  
  const getVerdictIcon = () => {
    switch (result.verdict) {
      case 'safe':
        return <ShieldCheck size={24} weight="fill" className="text-accent-safe" />;
      case 'suspicious':
        return <Warning size={24} weight="fill" className="text-accent-suspicious" />;
      case 'dangerous':
        return <XCircle size={24} weight="fill" className="text-accent-dangerous" />;
      default:
        return <Link size={24} weight="bold" className="text-text-secondary" />;
    }
  };

  const getVerdictMessage = () => {
    switch (result.verdict) {
      case 'safe':
        return 'This URL appears to be safe to visit.';
      case 'suspicious':
        return 'This URL has some suspicious characteristics. Proceed with caution.';
      case 'dangerous':
        return 'This URL has been flagged as potentially dangerous. Do not visit.';
      default:
        return '';
    }
  };

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
          {/* Verdict Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className={`p-4 sm:p-6 border-2 ${
              result.verdict === 'safe' ? 'border-accent-safe/30 bg-accent-safe/5' :
              result.verdict === 'suspicious' ? 'border-accent-suspicious/30 bg-accent-suspicious/5' :
              'border-accent-dangerous/30 bg-accent-dangerous/5'
            }`}>
              <div className="flex items-start gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="flex-shrink-0"
                >
                  {getVerdictIcon()}
                </motion.div>
                <div className="flex-1">
                  <div className={`text-sm sm:text-base font-medium mb-1 ${verdictColor}`}>
                    {result.verdict.toUpperCase()} URL
                  </div>
                  <div className="text-text-secondary text-xs sm:text-sm">
                    {getVerdictMessage()}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Reasons */}
          {result.reasons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="text-label text-text-secondary text-xs flex items-center gap-2">
                    <ShieldCheck size={16} weight="bold" />
                    ANALYSIS DETAILS
                  </div>
                  <ul className="space-y-2">
                    {result.reasons.map((reason, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="text-text-secondary text-xs sm:text-sm flex items-start gap-2"
                      >
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                          className={`flex-shrink-0 mt-1 ${
                            result.verdict === 'safe' ? 'text-accent-safe' :
                            result.verdict === 'suspicious' ? 'text-accent-suspicious' :
                            'text-accent-dangerous'
                          }`}
                        >
                          {result.verdict === 'safe' ? (
                            <ShieldCheck size={16} weight="fill" />
                          ) : result.verdict === 'suspicious' ? (
                            <Warning size={16} weight="fill" />
                          ) : (
                            <XCircle size={16} weight="fill" />
                          )}
                        </motion.span>
                        <span className="break-words flex-1">{reason}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          )}

          {/* URL Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="p-4 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="text-label text-text-secondary text-xs flex items-center gap-2">
                  <Link size={16} weight="bold" />
                  FINAL URL
                </div>
                <div className="text-text-primary font-mono text-xs sm:text-sm break-all">
                  {result.expandedUrl}
                </div>
              </div>
            </Card>
          </motion.div>
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="relative"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 0 0 rgba(255, 68, 68, 0.4)',
                  '0 0 0 8px rgba(255, 68, 68, 0)',
                  '0 0 0 0 rgba(255, 68, 68, 0)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`${verdictColor} text-center text-xs sm:text-sm p-4 sm:p-5 rounded-xl bg-accent-dangerous/10 border-2 border-accent-dangerous/30 flex items-center justify-center gap-3`}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <XCircle size={24} weight="fill" className="text-accent-dangerous" />
              </motion.div>
              <div>
                <div className="font-semibold mb-1">⚠️ WARNING</div>
                <div>This URL has been flagged as potentially dangerous. Do not visit this link.</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

