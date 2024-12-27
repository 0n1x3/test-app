'use client';

export function UserProfile() {
  return (
    <div className="user-profile">
      <div className="user-avatar">
        <span className="text-2xl">👤</span>
      </div>
      <div className="user-info">
        <h2 className="user-name">Player</h2>
        <div className="user-level">Level 1</div>
      </div>
    </div>
  );
} 