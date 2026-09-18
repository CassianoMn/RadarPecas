import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, ApiError, getToken, setToken } from '../lib/api';
import { AuthContext } from './auth-context';

export interface User {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: string;
  lojaId?: string | null;
  nomeLoja?: string | null;
}

interface LoginResponse {
  token: string;
  userId: string;
  nome: string;
  email: string;
  tipoUsuario: string;
  lojaId?: string | null;
  nomeLoja?: string | null;
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
    if (!data?.token || !data?.userId) {
      throw new ApiError('Resposta de login inválida.', 500);
    }
    setToken(data.token);
    setUser({
      id: data.userId,
      nome: data.nome,
      email: data.email,
      tipoUsuario: data.tipoUsuario,
      lojaId: data.lojaId,
      nomeLoja: data.nomeLoja,
    });
  }, []);

  const registerMotociclista = useCallback(async (nome: string, email: string, senha: string) => {
    const data = await api<LoginResponse>('/auth/register-motociclista', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha }),
    });
    if (!data?.token || !data?.userId) {
      throw new ApiError('Resposta de cadastro inválida.', 500);
    }
    setToken(data.token);
    setUser({
      id: data.userId,
      nome: data.nome,
      email: data.email,
      tipoUsuario: data.tipoUsuario,
      lojaId: data.lojaId,
      nomeLoja: data.nomeLoja,
    });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, registerMotociclista, logout }),
    [user, loading, login, registerMotociclista, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
