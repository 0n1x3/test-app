'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Game, GameState, WSEvents } from '@test-app/shared/types';
import { useSocket } from '@/hooks/useSocket';
import { useTonConnect } from '@/hooks/useTonConnect';

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const { socket } = useSocket();
  const { connected, wallet } = useTonConnect();
  const [game, setGame] = useState<Game | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!socket || !connected) return;

    // Получаем информацию об игре
    socket.emit('getGame', { gameId }, (response: { game: Game }) => {
      setGame(response.game);
    });

    // Подписываемся на обновления состояния игры
    socket.on(WSEvents.GAME_STATE_UPDATE, (state: GameState) => {
      setGameState(state);
    });

    socket.on(WSEvents.PLAYER_JOINED, (data: { game: Game }) => {
      setGame(data.game);
    });

    socket.on(WSEvents.PLAYER_LEFT, (data: { game: Game }) => {
      setGame(data.game);
    });

    return () => {
      socket.off(WSEvents.GAME_STATE_UPDATE);
      socket.off(WSEvents.PLAYER_JOINED);
      socket.off(WSEvents.PLAYER_LEFT);
    };
  }, [socket, connected, gameId]);

  if (!game) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{game.name}</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Игроки:</h2>
        <ul className="space-y-2">
          {game.players.map(player => (
            <li key={player.id} className="flex items-center gap-2">
              <span className="text-gray-600">{player.address}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Статус: {game.status}</h2>
      </div>

      {/* Здесь будет игровой интерфейс */}
    </div>
  );
}