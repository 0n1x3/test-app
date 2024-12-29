'use client';

import { GameModes } from './GameModes';
import { UserProfile } from './UserProfile';
import { Balance } from './Balance';
import { SafeArea } from './SafeArea';
import { PageTransition } from './PageTransition';
import { PageContainer } from './PageContainer';

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