'use client';

import { SafeArea } from '@/components/_layout/SafeArea';
import { PageTransition } from '@/components/_layout/PageTransition';
import { PageContainer } from '@/components/_layout/PageContainer';

export function IncomePage() {
  return (
    <SafeArea>
      <PageTransition>
        <PageContainer>
          <div className="page-header">
            <h1>Доход</h1>
          </div>
          <div className="flex items-center justify-center flex-1">
            {/* контент */}
          </div>
        </PageContainer>
      </PageTransition>
    </SafeArea>
  );
} 