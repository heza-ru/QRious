import { motion } from 'framer-motion';
import { QrCode, ShieldCheck, Sparkle } from 'phosphor-react';
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
    >
      {/* Multi-layered animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0, 255, 136, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(0, 255, 136, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0, 255, 136, 0.2) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-accent-safe/40 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8">
        {/* Icon with dramatic animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 12,
            duration: 1,
          }}
          className="relative"
        >
          {/* Glowing background */}
          <motion.div
            className="absolute inset-0 bg-accent-safe/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="relative"
          >
            <motion.div
              animate={{
                filter: [
                  'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))',
                  'drop-shadow(0 0 20px rgba(0, 255, 136, 0.8))',
                  'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <QrCode size={80} weight="duotone" className="text-accent-safe" />
            </motion.div>
          </motion.div>
          
          {/* Multiple pulsing rings with glow */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-accent-safe"
              style={{
                filter: 'blur(1px)',
              }}
              animate={{
                scale: [1, 1.5 + i * 0.2, 1],
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
          
          {/* Sparkle effects */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 0',
              }}
              initial={{
                rotate: (i * 45),
                x: 0,
                y: 0,
                opacity: 0,
              }}
              animate={{
                x: [0, 60, 0],
                y: [0, 60, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
                ease: 'easeInOut',
              }}
            >
              <Sparkle size={12} weight="fill" className="text-accent-safe" />
            </motion.div>
          ))}
        </motion.div>

        {/* Main Title with dramatic letter-by-letter animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center relative"
        >
          <motion.h1
            className="text-display text-text-primary mb-3 sm:mb-4 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {'QRious'.split('').map((letter, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 30, rotateX: -90 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  rotateX: 0,
                }}
                transition={{
                  delay: 0.4 + index * 0.12,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                whileHover={{
                  scale: 1.2,
                  y: -5,
                  filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.8))',
                }}
                className="inline-block mx-0.5 relative"
              >
                {letter === ' ' ? '\u00A0' : letter}
                <motion.span
                  className="absolute inset-0 text-accent-safe blur-sm opacity-50"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.1,
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              </motion.span>
            ))}
          </motion.h1>
        </motion.div>

        {/* Supporting text with animated icon */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.4 }}
          className="flex items-center gap-3 text-text-secondary text-sm sm:text-base relative z-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
            }}
            transition={{ 
              delay: 1.2, 
              type: "spring",
              stiffness: 200,
            }}
            whileHover={{
              scale: 1.2,
              rotate: 360,
              transition: { duration: 0.6 },
            }}
            className="relative"
          >
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
              <ShieldCheck size={24} weight="bold" className="text-accent-safe" />
            </motion.div>
          </motion.div>
          <motion.span
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Secure QR Code Scanner
          </motion.span>
        </motion.div>

        {/* Enhanced loading indicator with glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex gap-2 mt-6"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="relative"
            >
              <motion.div
                className="w-3 h-3 rounded-full bg-accent-safe"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                  boxShadow: [
                    '0 0 0 0 rgba(0, 255, 136, 0.4)',
                    '0 0 0 8px rgba(0, 255, 136, 0)',
                    '0 0 0 0 rgba(0, 255, 136, 0)',
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Auto-complete after animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onAnimationComplete={onComplete}
      />
    </motion.div>
  );
}

