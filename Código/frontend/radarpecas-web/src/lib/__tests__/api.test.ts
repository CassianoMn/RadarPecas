import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, getToken, setToken } from '../api';

describe('api client e storage de token', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persiste o token em localStorage quando remember=true e em sessionStorage quando remember=false', () => {
    setToken('token-persistente', true);
    expect(localStorage.getItem('radarpecas:token')).toBe('token-persistente');
    expect(sessionStorage.getItem('radarpecas:token')).toBeNull();
    expect(getToken()).toBe('token-persistente');

    setToken('token-sessao', false);
    expect(sessionStorage.getItem('radarpecas:token')).toBe('token-sessao');
    expect(localStorage.getItem('radarpecas:token')).toBeNull();
    expect(getToken()).toBe('token-sessao');

    setToken(null);
    expect(getToken()).toBeNull();
  });

  it('envia header Authorization Bearer e desembrulha data de ApiResponse em sucesso', async () => {
    setToken('jwt-abc-123');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, message: 'OK', data: { id: 42 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const resultado = await api<{ id: number }>('/pecas/42');

    expect(resultado).toEqual({ id: 42 });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe('Bearer jwt-abc-123');
  });

  it('lança ApiError com status e mensagem do servidor quando a resposta falha', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          message: 'Credenciais inválidas.',
          errors: ['Senha incorreta'],
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(api('/auth/login', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'Credenciais inválidas.',
      errors: ['Senha incorreta'],
    } satisfies Partial<ApiError>);
  });
});
