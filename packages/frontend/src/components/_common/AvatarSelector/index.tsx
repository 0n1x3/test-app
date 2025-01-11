import { useState } from 'react';
import { Icon } from '@iconify/react';
import './style.css';

interface AvatarSelectorProps {
  currentAvatar: string;
  onSelect: (avatarUrl: string) => void;
}

export function AvatarSelector({ currentAvatar, onSelect }: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const avatars = [
    '/avatars/nft1.png',
    '/avatars/nft2.png',
    '/avatars/nft3.png',
    '/avatars/nft4.png',
    '/avatars/nft5.png',
    '/avatars/nft6.png',
    '/avatars/nft7.png',
    '/avatars/nft8.png',
    '/avatars/nft9.png',
    '/avatars/nft10.png',
    '/avatars/nft11.png',
    '/avatars/nft12.png',
    '/avatars/nft17.png',
    '/avatars/nft18.png',
    '/avatars/nft40.png',
    '/avatars/nft42.png',
  ];

  return (
    <div className="avatar-selector">
      <div className="avatar-container">
        <div className="current-avatar">
          <img src={currentAvatar} alt="Current avatar" />
        </div>
        <button 
          className="change-avatar-button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <Icon icon="solar:refresh-circle-linear" />
        </button>
      </div>
      
      {isOpen && (
        <div className="avatar-grid">
          {avatars.map((avatar, index) => (
            <div 
              key={index} 
              className="avatar-option"
              onClick={() => {
                onSelect(avatar);
                setIsOpen(false);
              }}
            >
              <img src={avatar} alt={`Avatar option ${index + 1}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 