'use client';

import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  anyModalOpen: boolean;
  setAnyModalOpen: (open: boolean) => void;
  /** The "Add restaurant" form. Opened from the navbar (desktop), the floating + button
   *  (tablet) or the mobile bottom bar, and rendered by the Navbar. */
  addRestaurantOpen: boolean;
  setAddRestaurantOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType>({
  anyModalOpen: false,
  setAnyModalOpen: () => {},
  addRestaurantOpen: false,
  setAddRestaurantOpen: () => {},
});

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [anyModalOpen, setAnyModalOpen] = useState(false);
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false);
  return (
    <ModalContext.Provider value={{ anyModalOpen, setAnyModalOpen, addRestaurantOpen, setAddRestaurantOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => useContext(ModalContext);
