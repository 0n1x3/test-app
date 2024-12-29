'use client';

import { GameModes } from './GameModes';
import { UserProfile } from './UserProfile';
import { Balance } from './Balance';
import { SafeArea } from './SafeArea';
import { PageTransition } from './PageTransition';

export function HomePage() {
  return (
    <SafeArea>
      <PageTransition>
        <div className="page-container">
          <div className="content-container">
            <div className="header">
              <UserProfile />
            </div>
            <Balance />
            <GameModes />
          </div>
        </div>
      </PageTransition>
    </SafeArea>
  );
} 