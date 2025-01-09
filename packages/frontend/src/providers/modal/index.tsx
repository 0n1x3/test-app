'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ModalContextType = {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
};

const ModalContext = createContext<ModalContextType>({
  showSettings: false,
  setShowSettings: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <ModalContext.Provider value={{ showSettings, setShowSettings }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext); 