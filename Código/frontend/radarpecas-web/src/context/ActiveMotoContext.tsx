import { useState } from 'react';
import type { ReactNode } from 'react';
import { ActiveMotoContext } from './active-moto-context';
import type { ActiveMoto } from './active-moto-context';

export type { ActiveMoto } from './active-moto-context';

const STORAGE_KEY = 'radarpecas:active_moto';

export function ActiveMotoProvider({ children }: { children: ReactNode }) {
  const [activeMoto, setActiveMotoState] = useState<ActiveMoto | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as ActiveMoto) : null;
    } catch {
      return null;
    }
  });

  const setActiveMoto = (moto: ActiveMoto | null) => {
    setActiveMotoState(moto);
    if (moto) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(moto));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <ActiveMotoContext.Provider value={{ activeMoto, setActiveMoto }}>
      {children}
    </ActiveMotoContext.Provider>
  );
}
