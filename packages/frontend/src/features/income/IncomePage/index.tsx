'use client';

import { SafeArea } from '@/components/_layout/SafeArea';
import { PageContainer } from '@/components/_layout/PageContainer';
import { PageHeader } from '@/components/_layout/PageHeader';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import './style.css';

interface Task {
  id: string;
  title: string;
  reward: number;
  progress: number;
  total: number;
}

export function IncomePage() {
  const { t } = useTranslation();
  const level = 5;
  const experience = 1250;
  const nextLevel = 2000;
  const progress = (experience / nextLevel) * 100;

  const tasks: Task[] = [
    {
      id: '1',
      title: t('pages.income.tasks.win3games'),
      reward: 100,
      progress: 1,
      total: 3
    },
    {
      id: '2',
      title: t('pages.income.tasks.invite5friends'),
      reward: 250,
      progress: 2,
      total: 5
    },
    {
      id: '3',
      title: t('pages.income.tasks.play10games'),
      reward: 150,
      progress: 7,
      total: 10
    }
  ];

  return (
    <SafeArea>
      <PageContainer>
        <PageHeader title={t('pages.income.title')} />
        <div className="income-page">
          <div className="level-card">
            <div className="level-header">
              <div className="level-title">
                {t('pages.income.level')} {level}
              </div>
              <div className="level-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="progress-text">
                  {experience} / {nextLevel} XP
                </div>
              </div>
            </div>
            <div className="token-balance">
              <Icon icon="ion:diamond" className="token-icon" style={{ color: '#FFD700' }} />
              <span className="balance-amount">1,234.56</span>
            </div>
          </div>
          
          <div className="tasks-section">
            <div className="section-title">{t('pages.income.tasks.title')}</div>
            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-info">
                    <div className="task-title">{task.title}</div>
                    <div className="task-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(task.progress / task.total) * 100}%` }}
                        />
                      </div>
                      <div className="progress-text">
                        {task.progress}/{task.total}
                      </div>
                    </div>
                  </div>
                  <div className="task-reward">
                    <Icon 
                      icon="ion:diamond" 
                      className="reward-icon"
                      style={{ color: '#FFD700' }}
                    />
                    <span style={{ color: '#FFFFFF' }}>{task.reward}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </SafeArea>
  );
} 