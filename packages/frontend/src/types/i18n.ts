export type Language = 'ru' | 'en' | 'zh';

export interface Translation {
  pages: {
    home: {
      title: string;
      games: {
        rps: string;
        checkers: string;
        chess: string;
        durak: string;
        dice: string;
      };
      playButton: string;
    };
    income: {
      title: string;
      level: string;
      tasks: {
        active: string;
        completed: string;
        collect: string;
        noActive: string;
        noCompleted: string;
      };
      claim: string;
      tabs: {
        active: string;
        completed: string;
      };
      collect: string;
    };
    tournament: {
      title: string;
      participants: string;
      prize: string;
      joinButton: string;
    };
    friends: {
      title: string;
      inviteButton: string;
    };
    wallet: {
      title: string;
      deposit: string;
      withdraw: string;
    };
  };
  settings: {
    title: string;
    music: string;
    sounds: string;
    vibration: string;
    language: string;
    addToHome: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
  };
} 