'use client';

import { useEffect, useState } from 'react';
import { SafeArea } from '@/components/_layout/SafeArea';
import { PageContainer } from '@/components/_layout/PageContainer';
import { PageHeader } from '@/components/_layout/PageHeader';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import './style.css';

interface Task {
  _id: string;
  title: string;
  reward: number;
  isActive: boolean;
}

export function IncomePage() {
  const { t } = useTranslation();
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [currentTab, setCurrentTab] = useState<'active' | 'completed'>('active');
  const [userData, setUserData] = useState({ level: 1, experience: 0 });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) return;

      const initData = (webApp as any).initData;
      
      const [activeResponse, completedResponse] = await Promise.all([
        fetch('https://test.timecommunity.xyz/api/tasks/active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData })
        }),
        fetch('https://test.timecommunity.xyz/api/tasks/completed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData })
        })
      ]);

      if (activeResponse.ok && completedResponse.ok) {
        const [active, completed] = await Promise.all([
          activeResponse.json(),
          completedResponse.json()
        ]);
        setActiveTasks(active);
        setCompletedTasks(completed);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) return;

      const initData = (webApp as any).initData;
      
      const response = await fetch('https://test.timecommunity.xyz/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, taskId })
      });

      if (response.ok) {
        await fetchTasks(); // Обновляем списки заданий
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  return (
    <SafeArea>
      <PageContainer>
        <PageHeader title={t('pages.income.title')} />
        <div className="income-page">
          <div className="level-card">
            <div className="level-header">
              <div className="level-title">
                {t('pages.income.level')} {userData.level}
              </div>
              <div className="level-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(userData.experience % 1000) / 10}%` }}
                  />
                </div>
                <div className="progress-text">
                  {userData.experience % 1000} / 1000 XP
                </div>
              </div>
            </div>
          </div>
          
          <div className="tasks-section">
            <div className="tasks-tabs">
              <button 
                className={`tab ${currentTab === 'active' ? 'active' : ''}`}
                onClick={() => setCurrentTab('active')}
              >
                {t('pages.income.tabs.active')}
              </button>
              <button 
                className={`tab ${currentTab === 'completed' ? 'active' : ''}`}
                onClick={() => setCurrentTab('completed')}
              >
                {t('pages.income.tabs.completed')}
              </button>
            </div>

            <div className="tasks-list">
              {(currentTab === 'active' ? activeTasks : completedTasks).map(task => (
                <div key={task._id} className="task-card">
                  <div className="task-info">
                    <div className="task-title">{task.title}</div>
                  </div>
                  <div className="task-reward">
                    <Icon 
                      icon="material-symbols:diamond-rounded"
                      className="reward-icon"
                      style={{ color: '#2196F3' }}
                    />
                    <span>{task.reward}</span>
                    {currentTab === 'active' && (
                      <button 
                        className="collect-button"
                        onClick={() => handleCompleteTask(task._id)}
                      >
                        {t('pages.income.collect')}
                      </button>
                    )}
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