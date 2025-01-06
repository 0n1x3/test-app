'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import './style.css';

const GRID_SIZE = 8;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [cells, setCells] = useState<number[]>([]);

  useEffect(() => {
    const total = GRID_SIZE * GRID_SIZE;
    const randomOrder = Array.from({ length: total }, (_, i) => i)
      .sort(() => Math.random() - 0.5);
    setCells(randomOrder);
  }, []);

  return (
    <div className="page-transition">
      {children}
      <motion.div
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
    </div>
  );
} 