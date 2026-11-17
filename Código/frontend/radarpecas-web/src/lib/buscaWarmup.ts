import { api, getToken } from './api';
import { getStoredUserCoords } from './location';
import type { BuscaResultado, Loja } from '../types';
import type { DistanciaPill } from '../components/FiltrosOfertas';

export const BUSCA_PAGE_SIZE = 12;

export function parseDistancia(raw: string | null): DistanciaPill {
  if (raw === '5km' || raw === '15km' || raw === '+15km') return raw;
  return '15km';
}

export function parseMarcas(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
}

export function parsePreco(raw: string | null): number {
  const num = Number(raw);
  if (!raw || Number.isNaN(num) || num < 50 || num > 1500) return 1500;
  return num;
}

export function parsePage(raw: string | null): number {
  const num = Number(raw);
  if (!raw || Number.isNaN(num) || num < 1) return 1;
  return Math.floor(num);
}

export interface BuscaEndpointInput {
  termo: string;
  categoria: string;
  modeloMotoId?: number;
  anoFabricacao?: number;
  apenasPromocoes: boolean;
  userCoords: { lat: number; lng: number } | null;
  distanciaPill: DistanciaPill;
  selectedMarcas: string[];
  precoMaximo: number;
  ordenacao: string;
  page: number;
  pageSize: number;
}

export function buildBuscaApiPath(input: BuscaEndpointInput): string {
  const params = new URLSearchParams();
  if (input.termo.trim()) params.set('termo', input.termo.trim());
  if (input.categoria) params.set('categoria', input.categoria);
  if (input.modeloMotoId != null && input.anoFabricacao != null) {
    params.set('modeloMotoId', input.modeloMotoId.toString());
    params.set('anoFabricacao', input.anoFabricacao.toString());
  }
  if (input.apenasPromocoes) {
    params.set('apenasPromocoes', 'true');
  }
  if (input.userCoords) {
    params.set('userLatitude', input.userCoords.lat.toString());
    params.set('userLongitude', input.userCoords.lng.toString());
  }
  const raio = input.distanciaPill === '5km' ? '5' : input.distanciaPill === '15km' ? '15' : '50';
  params.set('raioKm', raio);
  if (input.selectedMarcas.length > 0) {
    params.set('marca', input.selectedMarcas.join(','));
  }
  if (input.precoMaximo < 1500) {
    params.set('precoMaximo', input.precoMaximo.toString());
  }
  params.set('ordenacao', input.ordenacao);
  params.set('page', String(input.page));
  params.set('pageSize', String(input.pageSize));
  return `/busca?${params.toString()}`;
}

let pendingWarmBusca: { endpoint: string; promise: Promise<BuscaResultado> } | null = null;
let pendingWarmLojas: { endpoint: string; promise: Promise<Loja[]> } | null = null;

export function warmInitialBusca(search: string): void {
  if (getToken()) return;

  const sp = new URLSearchParams(search);
  const urlPage = parsePage(sp.get('page'));
  const stored = getStoredUserCoords();
  const endpoint = buildBuscaApiPath({
    termo: sp.get('termo') || '',
    categoria: sp.get('categoria') || '',
    apenasPromocoes: sp.get('apenasPromocoes') === 'true',
    userCoords: stored ? { lat: stored.lat, lng: stored.lng } : null,
    distanciaPill: parseDistancia(sp.get('distancia')),
    selectedMarcas: parseMarcas(sp.get('marca')),
    precoMaximo: parsePreco(sp.get('precoMaximo')),
    ordenacao: sp.get('ordenacao') || 'menor_distancia',
    page: 1,
    pageSize: urlPage > 1 ? urlPage * BUSCA_PAGE_SIZE : BUSCA_PAGE_SIZE,
  });

  const promise = api<BuscaResultado>(endpoint);
  promise.catch(() => {
    if (pendingWarmBusca?.endpoint === endpoint) {
      pendingWarmBusca = null;
    }
  });
  pendingWarmBusca = { endpoint, promise };
}

export function consumeWarmBusca(endpoint: string): Promise<BuscaResultado> | null {
  if (!pendingWarmBusca || pendingWarmBusca.endpoint !== endpoint) return null;
  const match = pendingWarmBusca.promise;
  pendingWarmBusca = null;
  return match;
}

export function buildLojasApiPath(lat?: number, lon?: number): string {
  const query = new URLSearchParams();
  if (lat != null && lon != null) {
    query.set('userLat', lat.toString());
    query.set('userLon', lon.toString());
    query.set('raioKm', '15');
  }
  const suffix = query.toString();
  return `/lojas${suffix ? `?${suffix}` : ''}`;
}

export function warmInitialLojas(): void {
  const stored = getStoredUserCoords();
  const endpoint = stored ? buildLojasApiPath(stored.lat, stored.lng) : buildLojasApiPath();
  const promise = api<Loja[]>(endpoint);
  promise.catch(() => {
    if (pendingWarmLojas?.endpoint === endpoint) {
      pendingWarmLojas = null;
    }
  });
  pendingWarmLojas = { endpoint, promise };
}

export function consumeWarmLojas(endpoint: string): Promise<Loja[]> | null {
  if (!pendingWarmLojas || pendingWarmLojas.endpoint !== endpoint) return null;
  const match = pendingWarmLojas.promise;
  pendingWarmLojas = null;
  return match;
}
