import { motion } from 'framer-motion';
import { QRScanner } from '../Scanner/QRScanner';
import { pageVariants, pageTransition } from '../../hooks/useAnimationVariants';

interface ScannerScreenProps {
  onScan: (url: string) => void;
  onError?: (error: string) => void;
}

export function ScannerScreen({ onScan, onError }: ScannerScreenProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-background-primary p-4 sm:p-8"
    >
      <div className="w-full max-w-2xl h-full flex items-center justify-center">
        <QRScanner onScan={onScan} onError={onError} />
      </div>
    </motion.div>
  );
}

