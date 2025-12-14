import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { RedirectChain } from '../ui/RedirectChain';
import { Card } from '../ui/Card';
import { pageVariants, pageTransition } from '../../hooks/useAnimationVariants';
import { Link, LinkBreak, ArrowDown, ShieldCheck, Sparkle, CheckCircle } from 'phosphor-react';
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
      className="min-h-screen w-full flex flex-col items-center justify-center bg-background-primary p-4 sm:p-8 relative overflow-hidden"
    >
      {/* Background particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-accent-safe/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            opacity: [0, 0.6, 0],
            scale: [0, 2, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="w-full max-w-3xl space-y-4 sm:space-y-6 relative z-10">
        {/* Original URL (if shortened) */}
        {isShortened && originalUrl && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.1,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <Card className="p-4 sm:p-6 border-2 border-accent-suspicious/40 relative overflow-hidden bg-accent-suspicious/5">
              {/* Animated border glow */}
              <motion.div
                className="absolute inset-0 border-2 border-accent-suspicious rounded-xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  boxShadow: [
                    '0 0 0 0 rgba(255, 193, 7, 0.4)',
                    '0 0 0 8px rgba(255, 193, 7, 0)',
                    '0 0 0 0 rgba(255, 193, 7, 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                  }}
                  transition={{ 
                    delay: 0.2, 
                    type: "spring", 
                    stiffness: 200,
                  }}
                  whileHover={{
                    scale: 1.2,
                    rotate: 360,
                    transition: { duration: 0.5 },
                  }}
                  className="flex-shrink-0 mt-1 relative"
                >
                  <motion.div
                    animate={{
                      filter: [
                        'drop-shadow(0 0 5px rgba(255, 193, 7, 0.5))',
                        'drop-shadow(0 0 15px rgba(255, 193, 7, 0.8))',
                        'drop-shadow(0 0 5px rgba(255, 193, 7, 0.5))',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <LinkBreak size={28} weight="bold" className="text-accent-suspicious" />
                  </motion.div>
                  {/* Sparkles around icon */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        top: '50%',
                        left: '50%',
                        transformOrigin: '0 0',
                      }}
                      initial={{
                        rotate: (i * 90),
                        x: 0,
                        y: 0,
                        opacity: 0,
                      }}
                      animate={{
                        x: [0, 30, 0],
                        y: [0, 30, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: 'easeInOut',
                      }}
                    >
                      <Sparkle size={8} weight="fill" className="text-accent-suspicious" />
                    </motion.div>
                  ))}
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

        {/* Enhanced Arrow indicator for shortened URLs */}
        {isShortened && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.4, 
              type: "spring",
              stiffness: 200,
            }}
            className="flex justify-center relative"
          >
            <motion.div
              animate={{ 
                y: [0, 12, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="p-3 rounded-full bg-background-secondary relative"
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
                animate={{
                  filter: [
                    'drop-shadow(0 0 5px rgba(0, 255, 136, 0.5))',
                    'drop-shadow(0 0 15px rgba(0, 255, 136, 0.8))',
                    'drop-shadow(0 0 5px rgba(0, 255, 136, 0.5))',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative z-10"
              >
                <ArrowDown size={28} weight="bold" className="text-accent-safe" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Expanded/Final URL */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: isShortened ? 0.5 : 0.2,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          <Card className={`p-4 sm:p-6 relative overflow-hidden ${isShortened ? 'border-2 border-accent-safe/40 bg-accent-safe/5' : 'border border-background-tertiary'}`}>
            {/* Animated border glow for expanded URL */}
            {isShortened && (
              <motion.div
                className="absolute inset-0 border-2 border-accent-safe rounded-xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
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
            )}
            <div className="flex items-start gap-3 sm:gap-4 relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: isShortened ? 0.6 : 0.3, 
                  type: "spring", 
                  stiffness: 200,
                }}
                whileHover={{
                  scale: 1.2,
                  rotate: 360,
                  transition: { duration: 0.5 },
                }}
                className="flex-shrink-0 mt-1 relative"
              >
                {isShortened ? (
                  <motion.div
                    animate={{
                      filter: [
                        'drop-shadow(0 0 5px rgba(0, 255, 136, 0.5))',
                        'drop-shadow(0 0 15px rgba(0, 255, 136, 0.8))',
                        'drop-shadow(0 0 5px rgba(0, 255, 136, 0.5))',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <ShieldCheck size={28} weight="bold" className="text-accent-safe" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{
                      filter: [
                        'drop-shadow(0 0 3px rgba(160, 160, 160, 0.3))',
                        'drop-shadow(0 0 8px rgba(160, 160, 160, 0.5))',
                        'drop-shadow(0 0 3px rgba(160, 160, 160, 0.3))',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Link size={28} weight="bold" className="text-text-primary" />
                  </motion.div>
                )}
                {/* Sparkles around icon */}
                {isShortened && [...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                      transformOrigin: '0 0',
                    }}
                    initial={{
                      rotate: (i * 90),
                      x: 0,
                      y: 0,
                      opacity: 0,
                    }}
                    animate={{
                      x: [0, 30, 0],
                      y: [0, 30, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: 'easeInOut',
                    }}
                  >
                    <Sparkle size={8} weight="fill" className="text-accent-safe" />
                  </motion.div>
                ))}
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
                <div className="text-text-primary font-mono text-xs sm:text-sm break-all leading-relaxed relative">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {url.substring(0, revealedLength)}
                  </motion.span>
                  {revealedLength < url.length && (
                    <motion.span
                      animate={{ 
                        opacity: [1, 0],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        duration: 0.8, 
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="inline-block w-0.5 h-5 bg-accent-safe ml-1 rounded-full"
                      style={{
                        boxShadow: '0 0 8px rgba(0, 255, 136, 0.8)',
                      }}
                    />
                  )}
                  {revealedLength >= url.length && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="inline-block ml-2"
                    >
                      <CheckCircle size={16} weight="fill" className="text-accent-safe" />
                    </motion.span>
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

        {/* Enhanced Continue Button */}
        {revealedLength >= url.length && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.6,
              type: "spring",
              stiffness: 200,
            }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="relative w-full sm:w-auto px-8 py-4 bg-accent-safe text-background-primary rounded-xl font-medium transition-all touch-manipulation overflow-hidden group"
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent-safe via-accent-safe/80 to-accent-safe"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <motion.span
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <ShieldCheck size={20} weight="bold" />
                </motion.span>
                Continue to Analysis
              </span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

