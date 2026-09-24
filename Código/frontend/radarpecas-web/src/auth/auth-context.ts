import { createContext } from 'react';
import type { User } from './AuthContext';

export interface UpdateProfileInput {
  nome: string;
  email?: string;
  senhaAtual?: string;
  novaSenha?: string;
}

export interface RegisterLojistaInput {
  nome: string;
  nomeFantasia: string;
  cnpj?: string;
  email: string;
  senha: string;
  enderecoCompleto?: string;
  telefoneContato?: string;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<User>;
  registerMotociclista: (nome: string, email: string, senha: string) => Promise<User>;
  registerLojista: (input: RegisterLojistaInput) => Promise<User>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
