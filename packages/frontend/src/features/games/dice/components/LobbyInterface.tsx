import React, { useState } from 'react';

interface LobbyInterfaceProps {
  gameType: 'dice' | 'rps';
}

export const LobbyInterface: React.FC<LobbyInterfaceProps> = ({ gameType }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <h2>Lobby for {gameType}</h2>
      {/* Логика лобби */}
    </div>
  );
}; 