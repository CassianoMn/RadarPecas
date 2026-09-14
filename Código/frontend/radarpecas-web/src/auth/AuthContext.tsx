import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, getToken, setToken } from '../lib/api';
import { AuthContext } from './auth-context';

export interface User {
  id: string;
  nome: string;
  email: string;
  tipo: string;
}

interface LoginResponse {
  token: string;
  usuario: User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await api<User>('/auth/me');
        setUser(me);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const data = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    setToken(data.token);
    setUser(data.usuario);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
