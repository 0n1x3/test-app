'use client';

export function GameModes() {
  return (
    <div className="game-modes">
      <div className="game-card">
        <div className="game-card-content">
          <div>
            <h2 className="game-card-title">Tournament</h2>
            <p className="game-card-description">Compete for prizes</p>
          </div>
          <div className="game-card-indicator"></div>
        </div>
      </div>

      <div className="game-card">
        <div className="game-card-content">
          <div>
            <h2 className="game-card-title">Practice</h2>
            <p className="game-card-description">Improve your skills</p>
          </div>
          <div className="game-card-indicator"></div>
        </div>
      </div>

      <div className="game-card">
        <div className="game-card-content">
          <div>
            <h2 className="game-card-title">Leaderboard</h2>
            <p className="game-card-description">Check your ranking</p>
          </div>
          <div className="game-card-indicator"></div>
        </div>
      </div>
    </div>
  );
} 