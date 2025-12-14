import { motion, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getVerdictColor, getVerdictBgColor } from '../../utils/helpers';

interface TrustScoreProps {
  score: number;
  verdict: 'safe' | 'suspicious' | 'dangerous';
  className?: string;
}

export function TrustScore({ score, verdict, className = '' }: TrustScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const spring = useSpring(0, { stiffness: 50, damping: 30 });

  useEffect(() => {
    spring.set(score);
  }, [score, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayScore(Math.round(latest));
    });
    return () => unsubscribe();
  }, [spring]);

  const verdictColor = getVerdictColor(verdict);
  const verdictBg = getVerdictBgColor(verdict);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`relative ${verdictBg} rounded-full p-6 sm:p-8 mb-4 sm:mb-6`}
    >
        <motion.div
          className={`text-display-sm sm:text-display ${verdictColor}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {displayScore}
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className={`text-label ${verdictColor} text-base sm:text-lg`}
      >
        {verdict.toUpperCase()}
      </motion.div>
    </div>
  );
}

