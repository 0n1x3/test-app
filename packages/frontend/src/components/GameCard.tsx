'use client';

import Link from 'next/link';
import { Game } from '@test-app/shared';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/game/${game.id}`}>
      <div className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
        <div className="text-sm text-gray-600">
          <p>Статус: {game.status}</p>
          <p>Игроки: {game.players.length}</p>
        </div>
      </div>
    </Link>
  );
}
