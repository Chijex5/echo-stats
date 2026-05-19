"use client";

import React, { createContext, useContext, useState } from "react";

interface MobileNavContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const MobileNavContext = createContext<MobileNavContextValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
});

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((prev) => !prev);

  return (
    <MobileNavContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export const useMobileNav = () => useContext(MobileNavContext);
