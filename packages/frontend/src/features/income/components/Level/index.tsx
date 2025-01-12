'use client';

import { useTranslation } from '@/providers/i18n';
import './style.css';

interface LevelProps {
  level: number;
  experience: number;
}

export function Level({ level, experience }: LevelProps) {
  const { t } = useTranslation();

  return (
    <div className="level-card">
      <div className="level-header">
        <div className="level-title">
          {t('pages.income.level')} {level}
        </div>
        <div className="level-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(experience % 1000) / 10}%` }}
            />
          </div>
          <div className="progress-text">
            {experience % 1000} / 1000 XP
          </div>
        </div>
      </div>
    </div>
  );
} 