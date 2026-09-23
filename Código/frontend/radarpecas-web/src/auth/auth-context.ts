import { createContext } from 'react';
import type { User } from './AuthContext';

export interface UpdateProfileInput {
  nome: string;
  email?: string;
  senhaAtual?: string;
  novaSenha?: string;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  registerMotociclista: (nome: string, email: string, senha: string) => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
