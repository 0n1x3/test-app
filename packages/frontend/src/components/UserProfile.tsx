'use client';

import { CoinsDisplay } from './CoinsDisplay';

export function UserProfile() {
  return (
    <div className="header">
      <div className="user-profile">
        <div className="user-avatar">
          <span className="text-2xl">👤</span>
        </div>
        <div className="user-info">
          <h2 className="user-name">Player</h2>
          <div className="user-level">Level 1</div>
        </div>
      </div>
      <CoinsDisplay amount={1056} />
    </div>
  );
} 