'use client';

import { useEffect, useState } from 'react';
import { Game } from '@test-app/shared';
import { useSocket } from '@/hooks/useSocket';
import { GameCard } from './GameCard';

export function GameList() {
  const [games, setGames] = useState<Game[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    socket?.emit('getGames', {}, (response: { games: Game[] }) => {
      setGames(response.games);
    });

    socket?.on('gameCreated', (game: Game) => {
      setGames(prev => [...prev, game]);
    });

    socket?.on('gameUpdated', (updatedGame: Game) => {
      setGames(prev => prev.map(game => 
        game.id === updatedGame.id ? updatedGame : game
      ));
    });

    return () => {
      socket?.off('gameCreated');
      socket?.off('gameUpdated');
    };
  }, [socket]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Доступные игры</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
        {games.length === 0 && (
          <p className="text-gray-500">Нет доступных игр</p>
        )}
      </div>
    </div>
  );
}