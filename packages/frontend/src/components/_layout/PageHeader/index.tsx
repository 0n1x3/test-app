'use client';

import { Settings } from '@/components/_common/Settings';
import './style.css';

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <Settings />
    </div>
  );
} 