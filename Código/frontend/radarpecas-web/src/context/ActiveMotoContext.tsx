import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';
import { ActiveMotoContext } from './active-moto-context';
import type { ActiveMoto } from './active-moto-context';

export type { ActiveMoto } from './active-moto-context';

function getStorageKey(userId?: string | null): string | null {
  return userId ? `radarpecas:active_moto:${userId}` : null;
}

export function ActiveMotoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [activeMoto, setActiveMotoState] = useState<ActiveMoto | null>(() => {
    // Remove chave global legada para evitar vazamento entre contas
    try {
      localStorage.removeItem('radarpecas:active_moto');
    } catch {
      // ignora erro de storage
    }

    if (!userId) return null;
    try {
      const key = getStorageKey(userId);
      const saved = key ? localStorage.getItem(key) : null;
      return saved ? (JSON.parse(saved) as ActiveMoto) : null;
    } catch {
      return null;
    }
  });

  // Sincroniza a moto ativa sempre que o usuário autenticado mudar (login, logout, troca de conta)
  useEffect(() => {
    try {
      localStorage.removeItem('radarpecas:active_moto');
    } catch {
      // ignora erro de storage
    }

    if (!userId) {
      setActiveMotoState(null);
      return;
    }

    try {
      const key = getStorageKey(userId);
      const saved = key ? localStorage.getItem(key) : null;
      setActiveMotoState(saved ? (JSON.parse(saved) as ActiveMoto) : null);
    } catch {
      setActiveMotoState(null);
    }
  }, [userId]);

  const setActiveMoto = useCallback(
    (moto: ActiveMoto | null) => {
      setActiveMotoState(moto);
      const key = getStorageKey(userId);
      if (!key) return;

      try {
        if (moto) {
          localStorage.setItem(key, JSON.stringify(moto));
        } else {
          localStorage.removeItem(key);
        }
      } catch {
        // ignora erro de storage
      }
    },
    [userId],
  );

  return (
    <ActiveMotoContext.Provider value={{ activeMoto, setActiveMoto }}>
      {children}
    </ActiveMotoContext.Provider>
  );
}

