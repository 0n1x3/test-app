'use client';

import { useEffect, useState } from 'react';
import { SafeArea } from '@/components/_layout/SafeArea';
import { PageContainer } from '@/components/_layout/PageContainer';
import { PageHeader } from '@/components/_layout/PageHeader';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/providers/i18n';
import { Level } from '../components/Level';
import { TasksList } from '../components/TasksList';
import './style.css';

export function IncomePage() {
  const { t } = useTranslation();
  const [userData, setUserData] = useState({ level: 1, experience: 0 });

  return (
    <SafeArea>
      <PageContainer>
        <PageHeader title={t('pages.income.title')} />
        <div className="income-page">
          <Level level={userData.level} experience={userData.experience} />
          <TasksList />
        </div>
      </PageContainer>
    </SafeArea>
  );
} 