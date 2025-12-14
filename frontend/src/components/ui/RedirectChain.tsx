import { motion } from 'framer-motion';
import { Card } from './Card';

interface RedirectChainItem {
  url: string;
  statusCode: number;
  method: string;
}

interface RedirectChainProps {
  chain: RedirectChainItem[];
  className?: string;
}

export function RedirectChain({ chain, className = '' }: RedirectChainProps) {
  if (chain.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      <div className="text-label text-text-secondary mb-3 sm:mb-4 text-xs">REDIRECT CHAIN</div>
      {chain.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          <Card className="bg-background-secondary/50 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-text-secondary text-xs mb-1 sm:mb-2">
                  Step {index + 1} • {item.method} • {item.statusCode}
                </div>
                <div className="text-text-primary text-xs sm:text-sm font-mono break-all">
                  {item.url}
                </div>
              </div>
              {index < chain.length - 1 && (
                <div className="text-text-disabled text-xl sm:text-2xl flex-shrink-0">↓</div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

