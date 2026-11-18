import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { User } from '../../auth/AuthContext';
import { AuthContext } from '../../auth/auth-context';
import type { AuthContextValue } from '../../auth/auth-context';
import { RequireAuth } from '../RequireAuth';

const dummyUser: User = {
  id: '1',
  nome: 'Teste',
  email: 'teste@radarpecas.com.br',
  tipoUsuario: 'MOTOCICLISTA',
};

function makeAuthValue(overrides: Partial<AuthContextValue>): AuthContextValue {
  return {
    user: null,
    loading: false,
    login: async () => dummyUser,
    registerMotociclista: async () => dummyUser,
    registerLojista: async () => ({ ...dummyUser, tipoUsuario: 'LOJISTA' }),
    updateProfile: async () => {},
    refreshUser: async () => {},
    logout: () => {},
    ...overrides,
  };
}

function LoginProbe() {
  const location = useLocation();
  const state = location.state as { from?: string } | null;
  return <div>Tela de Login (origem: {state?.from ?? 'nenhuma'})</div>;
}

describe('RequireAuth', () => {
  it('exibe indicador de carregamento enquanto loading=true', () => {
    render(
      <AuthContext.Provider value={makeAuthValue({ loading: true })}>
        <MemoryRouter initialEntries={['/garagem']}>
          <RequireAuth>
            <div>Conteúdo Protegido</div>
          </RequireAuth>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('redireciona usuário anônimo para /login preservando state.from', () => {
    render(
      <AuthContext.Provider value={makeAuthValue({ loading: false, user: null })}>
        <MemoryRouter initialEntries={['/garagem']}>
          <Routes>
            <Route
              path="/garagem"
              element={
                <RequireAuth>
                  <div>Conteúdo Protegido</div>
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginProbe />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    expect(screen.getByText('Tela de Login (origem: /garagem)')).toBeInTheDocument();
  });

  it('renderiza filhos quando o usuário está autenticado', () => {
    const user: User = {
      id: 'u-1',
      nome: 'Lucas',
      email: 'lucas@radarpecas.com.br',
      tipoUsuario: 'MOTOCICLISTA',
    };

    render(
      <AuthContext.Provider value={makeAuthValue({ loading: false, user })}>
        <MemoryRouter initialEntries={['/garagem']}>
          <RequireAuth>
            <div>Conteúdo Protegido</div>
          </RequireAuth>
        </MemoryRouter>
      </AuthContext.Provider>,
    );

    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });
});
