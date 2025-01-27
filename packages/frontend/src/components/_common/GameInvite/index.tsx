import React, { useState } from 'react';

interface GameInviteProps {
  gameType: 'dice' | 'rps';
}

export const GameInvite: React.FC<GameInviteProps> = ({ gameType }) => {
  const [inviteCode, setInviteCode] = useState('');

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${inviteCode}`);
  };

  return (
    <div className="game-invite">
      <input 
        value={inviteCode} 
        readOnly 
        placeholder="Invite code"
      />
      <button onClick={copyLink}>Copy Link</button>
    </div>
  );
}; 