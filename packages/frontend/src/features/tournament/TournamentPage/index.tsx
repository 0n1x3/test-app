'use client';

import { SafeArea } from '@/components/_layout/SafeArea';
import { PageTransition } from '@/components/_layout/PageTransition';
import { PageContainer } from '@/components/_layout/PageContainer';

export function TournamentPage() {
  return (
    <SafeArea>
      <PageTransition>
        <PageContainer>
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl text-gray-500">Турниры</h1>
          </div>
        </PageContainer>
      </PageTransition>
    </SafeArea>
  );
} 