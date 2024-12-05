'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useTonConnect } from '@/hooks/useTonConnect';

interface CreateGameModalProps {
  onClose: () => void;
}

export function CreateGameModal({ onClose }: CreateGameModalProps) {
  const [name, setName] = useState('');
  const { socket } = useSocket();
  const { wallet } = useTonConnect();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet) return;

    const creator = {
      id: wallet.account.address,
      address: wallet.account.address,
      balance: '0'
    };

    socket?.emit('createGame', { name, creator }, (response: any) => {
      if (response.success) {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Создать новую игру</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Название игры</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}