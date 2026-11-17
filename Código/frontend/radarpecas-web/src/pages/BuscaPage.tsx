import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { api } from '../lib/api';
import { useActiveMoto } from '../context/useActiveMoto';
import type { BuscaResultado, OfertaBuscaItem } from '../types';
import { CheckIcon, ErrorState } from '../components/ui';
import { FiltrosOfertas } from '../components/FiltrosOfertas';
import type { DistanciaPill } from '../components/FiltrosOfertas';
import { FilterSheet } from '../components/FilterSheet';
import { SmartImage } from '../components/SmartImage';
import { ProductCardSkeleton } from '../components/Skeleton';
import { getStoredUserCoords, setStoredUserCoords } from '../lib/location';
import {
  BUSCA_PAGE_SIZE,
  buildBuscaApiPath,
  consumeWarmBusca,
  parseDistancia,
  parseMarcas,
  parsePage,
  parsePreco,
} from '../lib/buscaWarmup';

const PAGE_SIZE = BUSCA_PAGE_SIZE;
const MARCAS_DISPONIVEIS = ['Vaz', 'Cobreq', 'Fram', 'Pirelli', 'Heliar', 'Mobil', 'Philips', 'DID', 'KMC'];
const CATEGORIAS_FALLBACK = ['Transmissão', 'Filtros', 'Pneus', 'Óleos', 'Freios', 'Motor', 'Elétrica'];

function formatMoney(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function BuscaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeMoto } = useActiveMoto();

  // Estado derivado da URL (fonte única de verdade para deep-link e botão voltar)
  const termo = searchParams.get('termo') || '';
  const apenasPromocoes = searchParams.get('apenasPromocoes') === 'true';
  const categoria = searchParams.get('categoria') || '';
  const selectedMarcas = useMemo(() => parseMarcas(searchParams.get('marca')), [searchParams]);
  const precoMaximo = parsePreco(searchParams.get('precoMaximo'));
  const distanciaPill = parseDistancia(searchParams.get('distancia'));
  const ordenacao = searchParams.get('ordenacao') || 'menor_distancia';
  const urlPage = parsePage(searchParams.get('page'));

  // Slider de preço com estado local imediato + debounce de 250ms para URL/API
  const [precoSlider, setPrecoSlider] = useState<number>(precoMaximo);
  useEffect(() => {
    setPrecoSlider(precoMaximo);
  }, [precoMaximo]);

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const stored = getStoredUserCoords();
    return stored ? { lat: stored.lat, lng: stored.lng } : null;
  });
  const [solicitandoLocalizacao, setSolicitandoLocalizacao] = useState(false);

  const [categorias, setCategorias] = useState<string[]>([]);
  const [items, setItems] = useState<OfertaBuscaItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const lastFetchedFilterKeyRef = useRef<string>('');
  const loadedPagesRef = useRef<number>(0);

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        termo,
        apenasPromocoes,
        categoria,
        marca: selectedMarcas.join(','),
        precoMaximo,
        distanciaPill,
        ordenacao,
        motoId: activeMoto?.modeloMotoId ?? null,
        motoAno: activeMoto?.anoFabricacao ?? null,
        lat: userCoords?.lat ?? null,
        lng: userCoords?.lng ?? null,
      }),
    [termo, apenasPromocoes, categoria, selectedMarcas, precoMaximo, distanciaPill, ordenacao, activeMoto, userCoords]
  );

  // Atualiza URL sem poluir o histórico do navegador
  const updateUrlParams = useCallback(
    (mutator: (next: URLSearchParams) => void, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutator(next);
          if (resetPage) {
            next.delete('page');
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Debounce de 250ms ao arrastar o slider de preço
  useEffect(() => {
    if (precoSlider === precoMaximo) return undefined;
    const timer = window.setTimeout(() => {
      updateUrlParams((next) => {
        if (precoSlider >= 1500) next.delete('precoMaximo');
        else next.set('precoMaximo', String(precoSlider));
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [precoSlider, precoMaximo, updateUrlParams]);

  // Obter localização do usuário para cálculo de distância
  const obterLocalizacaoNavegador = useCallback(() => {
    if (!navigator.geolocation) return;
    setSolicitandoLocalizacao(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setStoredUserCoords(coords);
        setSolicitandoLocalizacao(false);
      },
      () => {
        setSolicitandoLocalizacao(false);
      },
      { timeout: 7000 }
    );
  }, []);

  useEffect(() => {
    obterLocalizacaoNavegador();
  }, [obterLocalizacaoNavegador]);

  // Carregar categorias
  useEffect(() => {
    const controller = new AbortController();
    api<string[]>('/pecas/categorias', { signal: controller.signal })
      .then((cats) => {
        if (cats && cats.length > 0) setCategorias(cats);
        else setCategorias(CATEGORIAS_FALLBACK);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCategorias(CATEGORIAS_FALLBACK);
        }
      });
    return () => controller.abort();
  }, []);

  // Executa busca (primeira carga, mudança de filtro ou paginação incremental)
  const executarBusca = useCallback(
    async (targetPage: number, append: boolean, overridePageSize?: number) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');

      const endpoint = buildBuscaApiPath({
        termo,
        categoria,
        modeloMotoId: activeMoto?.modeloMotoId,
        anoFabricacao: activeMoto?.anoFabricacao,
        apenasPromocoes,
        userCoords,
        distanciaPill,
        selectedMarcas,
        precoMaximo,
        ordenacao,
        page: targetPage,
        pageSize: overridePageSize ?? PAGE_SIZE,
      });

      try {
        const warm = !append ? consumeWarmBusca(endpoint) : null;
        const data = warm
          ? await warm
          : await api<BuscaResultado>(endpoint, {
              signal: controller.signal,
            });
        if (controller.signal.aborted) return;
        const novos = data?.ofertas?.items ?? [];
        const total = data?.ofertas?.totalCount ?? 0;

        setTotalCount(total);
        setItems((prev) => {
          if (!append) return novos;
          const seen = new Set(prev.map((p) => p.estoqueId));
          return [...prev, ...novos.filter((p) => !seen.has(p.estoqueId))];
        });
        loadedPagesRef.current = overridePageSize ? Math.ceil(overridePageSize / PAGE_SIZE) : targetPage;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setError('Erro ao carregar ofertas. Tente novamente.');
        if (!append) {
          setItems([]);
          setTotalCount(0);
        }
      } finally {
        if (abortRef.current === controller) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [termo, categoria, activeMoto, apenasPromocoes, userCoords, distanciaPill, selectedMarcas, precoMaximo, ordenacao]
  );

  // Dispara busca ao mudar filtros ou avançar página
  useEffect(() => {
    const filtersChanged = lastFetchedFilterKeyRef.current !== filterKey;
    if (filtersChanged) {
      lastFetchedFilterKeyRef.current = filterKey;
      // Ao restaurar de URL com ?page=N, busca de uma vez até N*PAGE_SIZE para preservar a lista
      if (urlPage > 1) {
        const restoreSize = Math.min(100, urlPage * PAGE_SIZE);
        void executarBusca(1, false, restoreSize);
      } else {
        void executarBusca(1, false);
      }
    } else if (urlPage > loadedPagesRef.current) {
      void executarBusca(urlPage, true);
    }

    return () => abortRef.current?.abort();
  }, [filterKey, urlPage, executarBusca]);

  // Restaura posição do scroll ao retornar para a mesma busca
  useEffect(() => {
    const storageKey = `radarpecas:scroll:${window.location.search}`;
    const saved = sessionStorage.getItem(storageKey);
    if (!loading && saved && items.length > 0) {
      const y = Number(saved);
      if (!Number.isNaN(y) && y > 0) {
        window.requestAnimationFrame(() => window.scrollTo({ top: y }));
      }
      sessionStorage.removeItem(storageKey);
    }
  }, [loading, items.length]);

  const salvarPosicaoScroll = () => {
    try {
      sessionStorage.setItem(`radarpecas:scroll:${window.location.search}`, String(window.scrollY));
    } catch {
      // ignora erro de storage
    }
  };

  const hasMore = items.length < totalCount;

  const carregarProximaPagina = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = Math.max(loadedPagesRef.current, urlPage) + 1;
    updateUrlParams((next) => {
      next.set('page', String(nextPage));
    }, false);
  }, [loading, loadingMore, hasMore, urlPage, updateUrlParams]);

  // Sentinel de rolagem infinita com botão fallback
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading || loadingMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          carregarProximaPagina();
        }
      },
      { rootMargin: '220px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, carregarProximaPagina]);

  function handleToggleMarca(marca: string) {
    const nextMarcas = selectedMarcas.includes(marca)
      ? selectedMarcas.filter((m) => m !== marca)
      : [...selectedMarcas, marca];

    updateUrlParams((next) => {
      if (nextMarcas.length > 0) next.set('marca', nextMarcas.join(','));
      else next.delete('marca');
    });
  }

  function handleLimparFiltros() {
    setPrecoSlider(1500);
    updateUrlParams((next) => {
      next.delete('categoria');
      next.delete('marca');
      next.delete('precoMaximo');
      next.delete('distancia');
      next.delete('apenasPromocoes');
    });
  }

  // Contagem de filtros ativos para o badge do botão mobile
  const activeFilterCount =
    (apenasPromocoes ? 1 : 0) +
    (categoria ? 1 : 0) +
    selectedMarcas.length +
    (precoMaximo < 1500 ? 1 : 0) +
    (distanciaPill !== '15km' ? 1 : 0);

  const filtrosProps = {
    apenasPromocoes,
    onChangePromocoes: (val: boolean) =>
      updateUrlParams((next) => {
        if (val) next.set('apenasPromocoes', 'true');
        else next.delete('apenasPromocoes');
      }),
    categoria,
    categorias,
    onChangeCategoria: (val: string) =>
      updateUrlParams((next) => {
        if (val) next.set('categoria', val);
        else next.delete('categoria');
      }),
    marcasDisponiveis: MARCAS_DISPONIVEIS,
    selectedMarcas,
    onToggleMarca: handleToggleMarca,
    precoMaximo: precoSlider,
    onChangePrecoMaximo: (val: number) => setPrecoSlider(val),
    distanciaPill,
    onChangeDistancia: (dist: DistanciaPill) =>
      updateUrlParams((next) => {
        if (dist === '15km') next.delete('distancia');
        else next.set('distancia', dist);
      }),
    userCoords,
    solicitandoLocalizacao,
    onSolicitarLocalizacao: obterLocalizacaoNavegador,
    onLimparFiltros: handleLimparFiltros,
    activeMoto,
  };

  return (
    <div className="search-layout">
      {/* BARRA LATERAL DE FILTROS (Desktop) */}
      <aside className="search-sidebar">
        <FiltrosOfertas variant="sidebar" {...filtrosProps} />
      </aside>

      {/* ÁREA PRINCIPAL COM OS RESULTADOS */}
      <div className="search-results-col">
        {/* Barra sticky mobile: Filtros + Ordenação + Contagem */}
        <div className="mobile-search-sticky">
          <div className="mobile-search-controls-row">
            <button
              type="button"
              className="mobile-filter-trigger"
              onClick={() => setSheetOpen(true)}
              aria-expanded={sheetOpen}
              aria-controls="mobile-filter-sheet"
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="mobile-filter-badge">{activeFilterCount}</span>
              )}
            </button>

            <select
              className="input mobile-sort-select"
              aria-label="Ordenar resultados"
              value={ordenacao}
              onChange={(e) =>
                updateUrlParams((next) => {
                  next.set('ordenacao', e.target.value);
                })
              }
            >
              <option value="menor_distancia">Mais Próximos</option>
              <option value="menor_preco">Menor Preço</option>
              <option value="maior_preco">Maior Preço</option>
              <option value="melhor_avaliacao">Melhor Avaliação</option>
            </select>

            <span className="mobile-results-count" aria-live="polite">
              {loading ? '...' : `${totalCount} ${totalCount === 1 ? 'peça' : 'peças'}`}
            </span>
          </div>

          {/* Chips removíveis dos filtros ativos */}
          {activeFilterCount > 0 && (
            <div className="mobile-active-chips-row">
              {apenasPromocoes && (
                <button
                  type="button"
                  className="active-filter-chip"
                  onClick={() => filtrosProps.onChangePromocoes(false)}
                >
                  Promoções <X size={13} aria-hidden="true" />
                </button>
              )}
              {categoria && (
                <button
                  type="button"
                  className="active-filter-chip"
                  onClick={() => filtrosProps.onChangeCategoria('')}
                >
                  {categoria} <X size={13} aria-hidden="true" />
                </button>
              )}
              {selectedMarcas.map((m) => (
                <button
                  key={m}
                  type="button"
                  className="active-filter-chip"
                  onClick={() => handleToggleMarca(m)}
                >
                  {m} <X size={13} aria-hidden="true" />
                </button>
              ))}
              {precoMaximo < 1500 && (
                <button
                  type="button"
                  className="active-filter-chip"
                  onClick={() => {
                    setPrecoSlider(1500);
                    updateUrlParams((next) => next.delete('precoMaximo'));
                  }}
                >
                  Até {formatMoney(precoMaximo)} <X size={13} aria-hidden="true" />
                </button>
              )}
              {distanciaPill !== '15km' && (
                <button
                  type="button"
                  className="active-filter-chip"
                  onClick={() => filtrosProps.onChangeDistancia('15km')}
                >
                  Raio {distanciaPill} <X size={13} aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className="active-filter-clear"
                onClick={handleLimparFiltros}
              >
                Limpar tudo
              </button>
            </div>
          )}
        </div>

        {/* Cabeçalho de Resultados (Desktop / Título) */}
        <div className="search-desktop-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <h1 style={{ fontSize: '1.6rem', margin: 0 }}>
                {apenasPromocoes
                  ? termo
                    ? `Promoções para "${termo}"`
                    : 'Ofertas & Peças em Promoção'
                  : termo
                    ? `Resultados para "${termo}"`
                    : 'Explorar Ofertas'}
              </h1>
              {apenasPromocoes && (
                <span
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    fontFamily: 'var(--mono)',
                  }}
                >
                  🔥 Promoções
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }} aria-live="polite">
              {!loading
                ? userCoords
                  ? `${totalCount} ${totalCount === 1 ? 'peça encontrada' : 'peças encontradas'} num raio de ${distanciaPill}`
                  : `${totalCount} ${totalCount === 1 ? 'peça encontrada' : 'peças encontradas'} (localização não informada)`
                : 'Buscando peças...'}
            </p>
          </div>

          <div className="search-desktop-sort">
            <label
              htmlFor="desktop-sort-select"
              style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}
            >
              Ordenar por:
            </label>
            <select
              id="desktop-sort-select"
              className="input"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              value={ordenacao}
              onChange={(e) =>
                updateUrlParams((next) => {
                  next.set('ordenacao', e.target.value);
                })
              }
            >
              <option value="menor_distancia">Mais Próximos</option>
              <option value="menor_preco">Menor Preço</option>
              <option value="maior_preco">Maior Preço</option>
              <option value="melhor_avaliacao">Melhor Avaliação</option>
            </select>
          </div>
        </div>

        <div aria-busy={loading || loadingMore}>
          {loading && (
            <div className="search-results-grid" aria-label="Carregando ofertas...">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <ProductCardSkeleton key={n} />
              ))}
            </div>
          )}
          {error && !loading && (
            <ErrorState text={error} onRetry={() => void executarBusca(1, false)} />
          )}

          {!loading && !error && (
            <>
              {items.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: 8 }}>
                    Nenhuma peça encontrada com os filtros selecionados
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.5 }}>
                    {distanciaPill !== '+15km' && userCoords ? (
                      <>
                        Não encontramos peças no raio de <strong>{distanciaPill}</strong> da sua localização. As lojas credenciadas podem estar além dessa distância.
                      </>
                    ) : apenasPromocoes ? (
                      'Não há produtos em promoção com os critérios atuais. Tente desmarcar o filtro de promoções ou alterar as marcas.'
                    ) : (
                      'Tente relaxar os filtros de marca, preço ou categoria para encontrar mais opções.'
                    )}
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {distanciaPill !== '+15km' && (
                      <button
                        type="button"
                        onClick={() => filtrosProps.onChangeDistancia('+15km')}
                        className="btn btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                      >
                        Ampliar raio para +15km (até 50km)
                      </button>
                    )}
                    {apenasPromocoes && (
                      <button
                        type="button"
                        onClick={() => filtrosProps.onChangePromocoes(false)}
                        className="btn btn-outline"
                        style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                      >
                        Ver todas as peças (sem filtro de promoção)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleLimparFiltros}
                      className="btn btn-outline"
                      style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                    >
                      Limpar todos os filtros
                    </button>
                  </div>
                </div>
              ) : (
                <div className="search-results-grid" style={{ opacity: loadingMore ? 0.85 : 1 }}>
                  {items.map((item, index) => {
                    const showCompativel = Boolean(activeMoto && item.compativel);

                    return (
                      <article key={item.estoqueId} className="product-card">
                        {/* Foto do Produto com Badges sobrepostos */}
                        <div className="product-card-img-wrap">
                          {showCompativel && (
                            <div className="badge-photo-topright">
                              <span className="badge-compativel">
                                <CheckIcon size={12} /> Compatível
                              </span>
                            </div>
                          )}

                          <SmartImage
                            src={item.fotoPecaUrl}
                            alt={item.nomePeca}
                            width={300}
                            height={200}
                            priority={index < 2}
                          />
                        </div>

                        {/* Corpo do Card */}
                        <div className="product-card-body">
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {item.categoria}
                          </span>

                          <h3 style={{ fontSize: '0.98rem', margin: '4px 0 6px', lineHeight: 1.3 }}>
                            {item.nomePeca}
                          </h3>

                          {/* Preço */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '8px 0' }}>
                            <span className="price">{formatMoney(item.precoEfetivo)}</span>
                            {item.precoPromocional && (
                              <span className="price-strikethrough">{formatMoney(item.precoVenda)}</span>
                            )}
                          </div>

                          {/* Loja & Distância calculada real */}
                          <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 14px' }}>
                            📍 {item.nomeLoja}
                            {item.distanciaKm != null ? ` (${item.distanciaKm.toFixed(1)} km)` : ''}
                          </p>

                          {/* Ação */}
                          <div style={{ marginTop: 'auto' }}>
                            <Link
                              to={`/ofertas/${item.estoqueId}`}
                              onClick={salvarPosicaoScroll}
                              className="btn btn-block"
                              style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                            >
                              Ver Detalhes
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {loadingMore && (
                <div className="search-results-grid" style={{ marginTop: 16 }}>
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                </div>
              )}

              {/* Paginação incremental real + sentinel */}
              {hasMore && (
                <div ref={sentinelRef} style={{ textAlign: 'center', marginTop: 32 }}>
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={carregarProximaPagina}
                    style={{
                      background: '#e2e8f0',
                      color: '#334155',
                      border: 'none',
                      borderRadius: 'var(--radius-pill)',
                      padding: '10px 24px',
                      fontFamily: 'var(--mono)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: loadingMore ? 'wait' : 'pointer',
                    }}
                  >
                    {loadingMore ? 'Carregando mais…' : 'Carregar mais resultados'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Sheet Mobile de Filtros */}
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        totalCount={totalCount}
        loading={loading}
      >
        <FiltrosOfertas variant="sheet" {...filtrosProps} />
      </FilterSheet>
    </div>
  );
}
