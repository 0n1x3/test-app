'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import './style.css';

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: 'game', label: 'Игра', icon: 'solar:gamepad-minimalistic-linear', path: '/' },
    { id: 'income', label: 'Доход', icon: 'solar:hand-money-linear', path: '/income' },
    { id: 'tournament', label: 'Турниры', icon: 'solar:cup-star-linear', path: '/tournament' },
    { id: 'friends', label: 'Друзья', icon: 'solar:users-group-rounded-linear', path: '/friends' },
    { id: 'wallet', label: 'Кошелек', icon: 'solar:wallet-linear', path: '/wallet' },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${pathname === tab.path ? 'active' : ''}`}
          onClick={() => router.push(tab.path)}
        >
          <Icon className="nav-icon" icon={tab.icon} />
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
} 