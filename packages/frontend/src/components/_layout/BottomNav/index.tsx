'use client';

import { useRouter, usePathname } from 'next/navigation';
import './style.css';

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: 'game', label: 'Главная', icon: '🏠', path: '/' },
    { id: 'income', label: 'Доход', icon: '💰', path: '/income' },
    { id: 'tournament', label: 'Турниры', icon: '🏆', path: '/tournament' },
    { id: 'friends', label: 'Друзья', icon: '👥', path: '/friends' },
    { id: 'wallet', label: 'Кошелек', icon: '👛', path: '/wallet' },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${pathname === tab.path ? 'active' : ''}`}
          onClick={() => router.push(tab.path)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
} 