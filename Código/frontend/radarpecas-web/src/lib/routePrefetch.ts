const prefetched = new Set<string>();

type Importer = () => Promise<unknown>;

const ROUTE_IMPORTS: Record<string, Importer> = {
  '/': () => import('../pages/HomePage'),
  '/lojas': () => import('../pages/LojasPage'),
  '/busca': () => import('../pages/BuscaPage'),
  '/garagem': () => import('../pages/GaragemPage'),
  '/garagem/adicionar': () => import('../pages/AdicionarMotoPage'),
  '/perfil': () => import('../pages/PerfilPage'),
  '/login': () => import('../pages/LoginPage'),
  '/cadastro': () => import('../pages/CadastroPage'),
  '/lojista': () => import('../pages/LojistaPage'),
};

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

function shouldSkipPrefetch(): boolean {
  if (typeof navigator === 'undefined') return true;
  if (!navigator.onLine) return true;
  const conn = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  return conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g';
}

export function prefetchRoute(path: string): void {
  const basePath = path.split('?')[0];
  if (prefetched.has(basePath) || shouldSkipPrefetch()) return;

  const loader = ROUTE_IMPORTS[basePath];
  if (!loader) return;

  prefetched.add(basePath);
  void loader().catch(() => {
    prefetched.delete(basePath);
  });
}
