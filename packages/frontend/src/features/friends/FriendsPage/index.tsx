'use client';

import { SafeArea } from '@/components/_layout/SafeArea';
import { PageContainer } from '@/components/_layout/PageContainer';
import './style.css';
import { PageHeader } from '@/components/_layout/PageHeader';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  earnings: {
    ton: number;
    usdt: number;
    time: number;
  };
}

export function FriendsPage() {
  // Временные данные для демонстрации
  const friends: Friend[] = [
    {
      id: '1',
      name: 'TIME',
      avatar: '/assets/tokens/time.png',
      earnings: { ton: 1.05, usdt: 2.34, time: 1.17 }
    },
    {
      id: '2',
      name: 'Sleepton',
      avatar: '/assets/avatars/default.png',
      earnings: { ton: 0.51, usdt: 0.89, time: 0.32 }
    },
    {
      id: '3',
      name: 'vlad.fura',
      avatar: '/assets/avatars/default.png',
      earnings: { ton: 0.12, usdt: 0.45, time: 0.28 }
    }
  ];

  const totalEarnings = friends.reduce(
    (acc, friend) => ({
      ton: acc.ton + friend.earnings.ton,
      usdt: acc.usdt + friend.earnings.usdt,
      time: acc.time + friend.earnings.time
    }),
    { ton: 0, usdt: 0, time: 0 }
  );

  return (
    <SafeArea>
      <PageContainer>
        <PageHeader title="Друзья" />
        
        <div className="friends-page">
          <div className="earnings-card">
            <div className="earnings-subtitle">
              Выплаты доли игровых комиссий в 1%
            </div>
            <div className="earnings-grid">
              <div className="token-earning">
                <img src="/assets/tokens/ton.png" alt="TON" className="token-icon" />
                <span className="token-amount">{totalEarnings.ton.toFixed(2)}</span>
              </div>
              <div className="token-earning">
                <img src="/assets/tokens/usdt.png" alt="USDT" className="token-icon" />
                <span className="token-amount">{totalEarnings.usdt.toFixed(2)}</span>
              </div>
              <div className="token-earning">
                <img src="/assets/tokens/time.png" alt="TIME" className="token-icon" />
                <span className="token-amount">{totalEarnings.time.toFixed(2)}</span>
              </div>
            </div>
            <button className="claim-button">Claim</button>
          </div>

          <div className="friends-section">
            <div className="section-title">Frens</div>
            <div className="friends-list">
              {friends.map(friend => (
                <div key={friend.id} className="friend-item">
                  <div className="friend-info">
                    <img src={friend.avatar} alt={friend.name} className="friend-avatar" />
                    <span className="friend-name">{friend.name}</span>
                  </div>
                  <div className="friend-earnings">
                    <div className="token-earning small">
                      <img src="/assets/tokens/ton.png" alt="TON" className="token-icon" />
                      <span>{friend.earnings.ton}</span>
                    </div>
                    <div className="token-earning small">
                      <img src="/assets/tokens/usdt.png" alt="USDT" className="token-icon" />
                      <span>{friend.earnings.usdt}</span>
                    </div>
                    <div className="token-earning small">
                      <img src="/assets/tokens/time.png" alt="TIME" className="token-icon" />
                      <span>{friend.earnings.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="invite-button">
            Invite frens
          </button>
        </div>
      </PageContainer>
    </SafeArea>
  );
} 