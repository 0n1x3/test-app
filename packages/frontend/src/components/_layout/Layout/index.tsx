'use client';

import { SafeArea } from '../SafeArea';
import { BottomNav } from '../BottomNav';
import { PageTransition } from '../PageTransition';
import './style.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <SafeArea>
        <PageTransition>
          <main className="main-content">
            {children}
          </main>
        </PageTransition>
        <BottomNav />
      </SafeArea>
    </div>
  );
} 