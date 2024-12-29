'use client';

export function GameModes() {
  return (
    <div className="game-modes">
      <div className="game-card">
        <div className="game-card-content">
          <div>
            <h2 className="game-card-title">Игра</h2>
            <p className="game-card-description">Побеждай и зарабатывай</p>
          </div>
          <div className="game-card-indicator"></div>
        </div>
      </div>

      <div className="game-card">
        <div className="game-card-content">
          <div>
            <h2 className="game-card-title">Турниры</h2>
            <p className="game-card-description">Сразись за призы</p>
          </div>
          <div className="game-card-indicator"></div>
        </div>
      </div>

      <div className="game-card">
        <div className="game-card-content">
          <div>
            <h2 className="game-card-title">Лидерборд</h2>
            <p className="game-card-description">Рейтинг лучших</p>
          </div>
          <div className="game-card-indicator"></div>
        </div>
      </div>
    </div>
  );
} 