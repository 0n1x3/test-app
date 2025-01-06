'use client';

import { SafeArea } from '@/components/_layout/SafeArea';
import { PageTransition } from '@/components/_layout/PageTransition';
import { PageContainer } from '@/components/_layout/PageContainer';
import { Icon } from '@iconify/react';
import './style.css';

interface Task {
  id: string;
  title: string;
  reward: number;
  progress: number;
  total: number;
}

export function IncomePage() {
  const level = 5;
  const experience = 1250;
  const nextLevel = 2000;
  const progress = (experience / nextLevel) * 100;

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Выиграй 3 игры подряд',
      reward: 100,
      progress: 1,
      total: 3
    },
    {
      id: '2',
      title: 'Пригласи 5 друзей',
      reward: 250,
      progress: 2,
      total: 5
    },
    {
      id: '3',
      title: 'Сыграй 10 игр',
      reward: 150,
      progress: 7,
      total: 10
    }
  ];

  return (
    <SafeArea>
      <PageTransition>
        <PageContainer>
          <div className="page-header">
            <h1>Доход</h1>
          </div>
          
          <div className="income-page">
            {/* Уровень и прогресс */}
            <div className="level-card">
              <div className="level-header">
                <div className="level-title">Level {level}</div>
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
                <Icon icon="ion:diamond" className="token-icon" style={{ color: '#FF3B30' }} />
                <span className="balance-amount">1,234.56</span>
              </div>
            </div>

            {/* Задания */}
            <div className="tasks-section">
              <div className="section-title">Задания</div>
              <div className="tasks-list">
                {tasks.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-info">
                      <div className="task-title">{task.title}</div>
                      <div className="task-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${(task.progress / task.total) * 100}%` 
                            }}
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
                        style={{ color: '#FF3B30' }}
                      />
                      <span>{task.reward}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageContainer>
      </PageTransition>
    </SafeArea>
  );
} 