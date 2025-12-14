import { motion } from 'framer-motion';
import { ShieldCheck, Sparkle, Lock, MagnifyingGlass } from 'phosphor-react';
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
      className="min-h-screen w-full flex flex-col items-center justify-center bg-background-primary p-4 sm:p-8 relative overflow-hidden"
    >
      {/* Animated background particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-accent-safe/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            opacity: [0, 0.8, 0],
            scale: [0, 2, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="w-full max-w-md space-y-6 sm:space-y-8 text-center px-4 relative z-10">
        {/* Dramatic Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="relative mx-auto"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto relative">
            {/* Glowing background */}
            <motion.div
              className="absolute inset-0 bg-accent-safe/20 rounded-full blur-3xl"
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
            
            {/* Multiple pulse rings */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-accent-safe"
                style={{
                  filter: 'blur(1px)',
                }}
                animate={{
                  scale: [1, 1.4 + i * 0.15, 1],
                  opacity: [0.6 - i * 0.15, 0, 0.6 - i * 0.15],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
              />
            ))}
            
            {/* Rotating shield icon with glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="relative"
              >
                <motion.div
                  animate={{
                    filter: [
                      'drop-shadow(0 0 10px rgba(0, 255, 136, 0.6))',
                      'drop-shadow(0 0 20px rgba(0, 255, 136, 0.9))',
                      'drop-shadow(0 0 10px rgba(0, 255, 136, 0.6))',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <ShieldCheck size={56} weight="duotone" className="text-accent-safe" />
                </motion.div>
              </motion.div>
            </div>
            
            {/* Orbiting icons */}
            {[Lock, MagnifyingGlass, Sparkle].map((Icon, i) => (
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
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.5,
                }}
              >
                <motion.div
                  style={{
                    transform: `translate(-50%, -50%) translateY(-80px)`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                >
                  <Icon size={20} weight="fill" className="text-accent-safe" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Status Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="space-y-4"
        >
          <motion.div
            animate={{ 
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-text-primary text-lg sm:text-xl font-medium flex items-center justify-center gap-3"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <ShieldCheck size={24} weight="bold" className="text-accent-safe" />
            </motion.div>
            <span>Analyzing URL Security</span>
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: 'linear', delay: 1 },
                scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
              }}
            >
              <ShieldCheck size={24} weight="bold" className="text-accent-safe" />
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-text-secondary text-xs sm:text-sm font-mono break-all bg-background-secondary/70 p-4 rounded-xl border border-accent-safe/20 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-safe/10 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <span className="relative z-10">{url}</span>
          </motion.div>
          
          {/* Enhanced progress bar */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="h-2 bg-accent-safe/20 rounded-full overflow-hidden relative"
          >
            <motion.div
              animate={{ 
                x: ['-100%', '100%'],
                width: ['30%', '40%', '30%'],
              }}
              transition={{ 
                x: { duration: 1.5, repeat: Infinity, ease: 'linear' },
                width: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="h-full bg-gradient-to-r from-accent-safe/50 via-accent-safe to-accent-safe/50 rounded-full relative"
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
        </motion.div>
      </div>
    </motion.div>
  );
}

