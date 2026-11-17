import { warmInitialBusca, warmInitialLojas } from './buscaWarmup';

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

function resolveImporter(basePath: string): Importer | undefined {
  if (ROUTE_IMPORTS[basePath]) return ROUTE_IMPORTS[basePath];
  if (/^\/lojas\/[^/]+\/avaliar$/.test(basePath)) {
    return () => import('../pages/AvaliarLojaPage');
  }
  if (/^\/lojas\/[^/]+$/.test(basePath)) {
    return () => import('../pages/LojaDetalhesPage');
  }
  if (/^\/ofertas\/[^/]+$/.test(basePath)) {
    return () => import('../pages/OfertaDetalhesPage');
  }
  return undefined;
}

function triggerImport(basePath: string): void {
  if (prefetched.has(basePath)) return;

  const loader = resolveImporter(basePath);
  if (!loader) return;

  prefetched.add(basePath);
  void loader().catch(() => {
    prefetched.delete(basePath);
  });
}

export function warmInitialRoute(path: string, search = ''): void {
  const basePath = path.split('?')[0] || '/';
  triggerImport(basePath);
  if (basePath === '/') {
    void import('../components/MapaExplorar').catch(() => {});
    warmInitialLojas();
  } else if (basePath === '/busca') {
    warmInitialBusca(search);
  }
}

export function prefetchRoute(path: string): void {
  const basePath = path.split('?')[0];
  if (shouldSkipPrefetch()) return;
  triggerImport(basePath);
}
