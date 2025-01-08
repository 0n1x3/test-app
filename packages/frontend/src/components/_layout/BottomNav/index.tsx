'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/providers/i18n';
import './style.css';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="bottom-nav">
      <Link 
        href="/" 
        className={`nav-item ${pathname === '/' ? 'active' : ''}`}
      >
        <Icon icon="solar:gamepad-minimalistic-linear" />
        <span>{t('pages.home.title')}</span>
      </Link>

      <Link 
        href="/income" 
        className={`nav-item ${pathname === '/income' ? 'active' : ''}`}
      >
        <Icon icon="solar:dollar-minimalistic-linear" />
        <span>{t('pages.income.title')}</span>
      </Link>

      <Link 
        href="/tournament" 
        className={`nav-item ${pathname === '/tournament' ? 'active' : ''}`}
      >
        <Icon icon="solar:cup-star-linear" />
        <span>{t('pages.tournament.title')}</span>
      </Link>

      <Link 
        href="/friends" 
        className={`nav-item ${pathname === '/friends' ? 'active' : ''}`}
      >
        <Icon icon="solar:users-group-rounded-linear" />
        <span>{t('pages.friends.title')}</span>
      </Link>

      <Link 
        href="/wallet" 
        className={`nav-item ${pathname === '/wallet' ? 'active' : ''}`}
      >
        <Icon icon="solar:wallet-linear" />
        <span>{t('pages.wallet.title')}</span>
      </Link>
    </nav>
  );
} 