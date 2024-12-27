'use client';

import { GameModes } from './GameModes';
import { UserProfile } from './UserProfile';
import { Balance } from './Balance';

export function HomePage() {
  return (
    <div className="game-container">
      <div className="safe-container">
        <div className="content-wrapper">
          <div className="header">
            <UserProfile />
          </div>
          <Balance />
          <GameModes />
        </div>
      </div>
    </div>
  );
} 