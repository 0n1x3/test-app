'use client';

import { useEffect, useState } from 'react';
import type { Task } from '../../../../types';
import './style.css';

export function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const webApp = window.Telegram?.WebApp;
        if (!webApp) return;

        const initData = (webApp as any).initData;
        const endpoint = activeTab === 'active' ? 'active' : 'completed';
        const method = activeTab === 'active' ? 'POST' : 'GET';

        const url = method === 'GET' 
          ? `https://test.timecommunity.xyz/api/tasks/${endpoint}?initData=${encodeURIComponent(initData)}`
          : `https://test.timecommunity.xyz/api/tasks/${endpoint}`;

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          ...(method === 'POST' ? { body: JSON.stringify({ initData }) } : {})
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Fetched ${activeTab} tasks:`, data);
          setTasks(data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [activeTab]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (tasks.length === 0) {
    return <div>No active tasks</div>;
  }

  return (
    <div className="tasks-container">
      <div className="tasks-tabs">
        <button 
          className={activeTab === 'active' ? 'active' : ''} 
          onClick={() => setActiveTab('active')}
        >
          Активные
        </button>
        <button 
          className={activeTab === 'completed' ? 'active' : ''} 
          onClick={() => setActiveTab('completed')}
        >
          Завершенные
        </button>
      </div>
      <div className="tasks-list">
        {tasks.map(task => (
          <div key={task._id} className="task-card">
            <div className="task-info">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
            </div>
            <div className="task-reward">
              <span>{task.reward}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 