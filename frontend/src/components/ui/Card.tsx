import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  const baseStyles = 'glass rounded-2xl p-4 sm:p-6';
  
  return (
    <motion.div
      whileHover={hover && onClick ? { y: -2 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

