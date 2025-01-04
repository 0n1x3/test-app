'use client';

import { motion } from 'framer-motion';
import './style.css';

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      style={{ 
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0
      }}
    >
      {children}
    </motion.div>
  );
} 