'use client';

import { GameModes } from '@/components/_games/GameModes';
import { UserProfile } from '@/components/_user/UserProfile';
import { Balance } from '@/components/_wallet/Balance';
import { SafeArea } from '@/components/_layout/SafeArea';
import { PageTransition } from '@/components/_layout/PageTransition';
import { PageContainer } from '@/components/_layout/PageContainer';

export function HomePage() {
  return (
    <SafeArea>
      <PageTransition>
        <PageContainer>
          <div className="content-container home-content">
            <div className="header">
              <UserProfile />
            </div>
            <Balance />
            <GameModes />
          </div>
        </PageContainer>
      </PageTransition>
    </SafeArea>
  );
} 