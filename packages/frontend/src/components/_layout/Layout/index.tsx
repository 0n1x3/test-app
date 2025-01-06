'use client';

import { SafeArea } from '../SafeArea';
import { BottomNav } from '../BottomNav';
import { Header } from '../Header';
import './style.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <SafeArea>
        <Header />
        <main className="main-content">
          {children}
        </main>
        <BottomNav />
      </SafeArea>
    </div>
  );
} 