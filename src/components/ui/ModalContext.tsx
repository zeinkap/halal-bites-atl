'use client';

import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  anyModalOpen: boolean;
  setAnyModalOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType>({
  anyModalOpen: false,
  setAnyModalOpen: () => {},
});

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [anyModalOpen, setAnyModalOpen] = useState(false);
  return (
    <ModalContext.Provider value={{ anyModalOpen, setAnyModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => useContext(ModalContext); 