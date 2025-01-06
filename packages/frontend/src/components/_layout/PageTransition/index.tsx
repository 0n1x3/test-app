'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import './style.css';

const GRID_SIZE = 8;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [prevChildren, setPrevChildren] = useState(children);
  const [cells, setCells] = useState<number[]>([]);

  useEffect(() => {
    if (pathname) {
      setPrevChildren(children);
      const total = GRID_SIZE * GRID_SIZE;
      const randomOrder = Array.from({ length: total }, (_, i) => i)
        .sort(() => Math.random() - 0.5);
      setCells(randomOrder);
    }
  }, [pathname]);

  return (
    <div className="page-transition">
      <div className="page-layer">
        {prevChildren}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          className="page-layer"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          {children}
          <div className="transition-overlay">
            {cells.map((index) => (
              <motion.div
                key={index}
                className="transition-cell"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.005,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 