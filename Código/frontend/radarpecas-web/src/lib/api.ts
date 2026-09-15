export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: string[] | null;
}

export class ApiError extends Error {
  status: number;
  errors: string[];

  constructor(message: string, status: number, errors: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:5150/api';

const TOKEN_KEY = 'radarpecas:token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function toMessage(status: number, fallback: string): string {
  if (status === 401) return 'Sessão expirada. Entre de novo.';
  if (status === 403) return 'Você não tem acesso a isso.';
  if (status === 404) return 'Não encontrado.';
  if (status >= 500) return 'Erro no servidor. Tente de novo.';
  return fallback;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const isJson = res.headers.get('content-type')?.includes('json');

  if (!isJson) {
    if (!res.ok) throw new ApiError(toMessage(res.status, 'Erro inesperado.'), res.status);
    return undefined as T;
  }

  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok || body.success === false) {
    throw new ApiError(
      body.message || toMessage(res.status, 'Erro inesperado.'),
      res.status,
      body.errors ?? [],
    );
  }

  return (body.data ?? undefined) as T;
}

export const apiBaseUrl = BASE_URL;
