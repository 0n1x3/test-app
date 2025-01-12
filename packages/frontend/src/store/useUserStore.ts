import { create } from 'zustand';

interface UserState {
  balance: number;
  level: number;
  experience: number;
  setUserData: (data: { balance: number; level: number; experience: number }) => void;
  fetchUserData: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  balance: 0,
  level: 1,
  experience: 0,
  setUserData: (data) => set(data),
  fetchUserData: async () => {
    try {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) return;

      const initData = (webApp as any).initData;
      const response = await fetch('https://test.timecommunity.xyz/api/users/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });

      if (response.ok) {
        const data = await response.json();
        set({ 
          balance: data.balance || 0,
          level: data.level || 1,
          experience: data.experience || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
})); 