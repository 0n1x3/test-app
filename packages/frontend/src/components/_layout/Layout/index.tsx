'use client';

import { BottomNav } from '../BottomNav';
import { SafeArea } from '../SafeArea';
import './style.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <div className="page-wrapper">
        {children}
      </div>
      <BottomNav />
    </div>
  );
} 