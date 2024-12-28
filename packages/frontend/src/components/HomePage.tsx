'use client';

import { GameModes } from './GameModes';
import { UserProfile } from './UserProfile';
import { Balance } from './Balance';
import { SafeArea } from './SafeArea';

export function HomePage() {
  return (
    <SafeArea>
      <div className="content-container">
        <div className="header">
          <UserProfile />
        </div>
        <Balance />
        <GameModes />
      </div>
    </SafeArea>
  );
} 