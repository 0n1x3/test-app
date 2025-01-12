'use client';

import { useEffect, useState } from 'react';
import type { Task } from '../../../types';
import './style.css';

export function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const webApp = window.Telegram?.WebApp;
        if (!webApp) return;

        const initData = (webApp as any).initData;
        const response = await fetch('https://test.timecommunity.xyz/api/tasks/active', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched tasks:', data);
          setTasks(data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (tasks.length === 0) {
    return <div>No active tasks</div>;
  }

  return (
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
  );
} 