'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import './style.css';

const GRID_SIZE = 8;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cells, setCells] = useState<number[]>([]);

  useEffect(() => {
    const total = GRID_SIZE * GRID_SIZE;
    const randomOrder = Array.from({ length: total }, (_, i) => i)
      .sort(() => Math.random() - 0.5);
    setCells(randomOrder);
  }, [pathname]);

  return (
    <div className="page-transition">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          className="page-content"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname + '-grid'}
          initial="initial"
          animate="animate"
          exit="exit"
          className="transition-grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          }}
        >
          {cells.map((index) => (
            <motion.div
              key={index}
              variants={{
                initial: { backgroundColor: '#000', opacity: 1 },
                animate: { backgroundColor: '#000', opacity: 0 },
                exit: { backgroundColor: '#000', opacity: 0 },
              }}
              transition={{
                duration: 0.2,
                delay: index * 0.005,
                ease: 'easeOut',
              }}
              className="transition-cell"
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 