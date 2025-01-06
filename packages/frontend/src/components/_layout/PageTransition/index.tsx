'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import './style.css';

const GRID_SIZE = 8;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [prevChildren, setPrevChildren] = useState(children);
  const [cells, setCells] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (pathname) {
      setIsTransitioning(true);
      setPrevChildren(children);
      
      const total = GRID_SIZE * GRID_SIZE;
      const randomOrder = Array.from({ length: total }, (_, i) => i)
        .sort(() => Math.random() - 0.5);
      setCells(randomOrder);

      // Сбрасываем состояние перехода после анимации
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <div className="page-transition">
      {/* Предыдущая страница */}
      {isTransitioning && (
        <div className="page-layer previous">
          {prevChildren}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="transition-grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            }}
          >
            {cells.map((index) => (
              <motion.div
                key={`prev-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
      )}

      {/* Новая страница */}
      <div className="page-layer current">
        {children}
        <motion.div
          initial="initial"
          animate="animate"
          className="transition-grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          }}
        >
          {cells.map((index) => (
            <motion.div
              key={`current-${index}`}
              variants={{
                initial: { opacity: 1 },
                animate: { opacity: 0 },
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
    </div>
  );
} 