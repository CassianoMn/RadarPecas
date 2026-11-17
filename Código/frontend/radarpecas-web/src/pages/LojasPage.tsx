import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import type { Loja, PagedResult } from '../types';
import { EmptyState, ErrorState, Loading, StarIcon } from '../components/ui';
import { getStoredUserCoords, setStoredUserCoords } from '../lib/location';

const PAGE_SIZE = 12;

export function LojasPage() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'proximas' | 'avaliacao'>('proximas');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const stored = getStoredUserCoords();
    return stored ? { lat: stored.lat, lng: stored.lng } : null;
  });

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setStoredUserCoords(coords);
        setUserCoords(coords);
      },
      () => {
        // segue sem coordenadas ou com as salvas
      },
      { timeout: 5000 }
    );
  }, []);

  const carregarPagina = useCallback(
    async (targetPage: number, append: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');

      const query = new URLSearchParams();
      if (userCoords) {
        query.set('userLat', userCoords.lat.toString());
        query.set('userLon', userCoords.lng.toString());
      }
      query.set('ordenacao', filtroAtivo === 'avaliacao' ? 'melhor_avaliacao' : 'proximas');
      query.set('page', targetPage.toString());
      query.set('pageSize', PAGE_SIZE.toString());

      try {
        const data = await api<PagedResult<Loja>>(`/lojas/paginadas?${query.toString()}`, {
          signal: controller.signal,
        });
        const items = data?.items ?? [];
        setLojas((prev) => {
          if (!append) return items;
          const seen = new Set(prev.map((l) => l.id));
          return [...prev, ...items.filter((l) => !seen.has(l.id))];
        });
        setPage(data?.page ?? targetPage);
        setTotalCount(data?.totalCount ?? items.length);
        setHasNextPage(Boolean(data?.hasNextPage));
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setError(err instanceof ApiError ? err.message : 'Erro ao carregar lojas credenciadas.');
        if (!append) {
          setLojas([]);
          setHasNextPage(false);
        }
      } finally {
        if (abortRef.current === controller) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [userCoords, filtroAtivo]
  );

  useEffect(() => {
    void carregarPagina(1, false);
    return () => abortRef.current?.abort();
  }, [carregarPagina]);

  return (
    <section>
      {/* Título & Subtítulo */}
      <h1 style={{ fontSize: '1.9rem', marginBottom: 4 }}>Catálogo de Lojas</h1>
      <p style={{ fontSize: '0.95rem', margin: '0 0 18px', color: 'var(--text-muted)' }}>
        Encontre as melhores oficinas e revendas perto de você
        {totalCount > 0 ? ` (${totalCount} parceiras)` : ''}.
      </p>

      {/* Linha de Filtros em Pílulas */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setFiltroAtivo('proximas')}
          style={{
            background: filtroAtivo === 'proximas' ? '#006375' : '#ffffff',
            color: filtroAtivo === 'proximas' ? '#ffffff' : '#334155',
            border: '1px solid ' + (filtroAtivo === 'proximas' ? '#006375' : 'var(--border-strong)'),
            borderRadius: 'var(--radius-pill)',
            padding: '7px 16px',
            fontFamily: 'var(--mono)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          <span>⌖</span> Mais Próximas
        </button>

        <button
          type="button"
          onClick={() => setFiltroAtivo('avaliacao')}
          style={{
            background: filtroAtivo === 'avaliacao' ? '#006375' : '#ffffff',
            color: filtroAtivo === 'avaliacao' ? '#ffffff' : '#334155',
            border: '1px solid ' + (filtroAtivo === 'avaliacao' ? '#006375' : 'var(--border-strong)'),
            borderRadius: 'var(--radius-pill)',
            padding: '7px 16px',
            fontFamily: 'var(--mono)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          <span>☆</span> Melhor Avaliação
        </button>
      </div>

      {loading && <Loading text="Carregando lojas credenciadas..." />}

      {error && !loading && (
        <ErrorState text={error} onRetry={() => void carregarPagina(1, false)} />
      )}

      {/* Grid de 4 Colunas com os Cards de Lojas */}
      {!loading && !error && lojas.length > 0 && (
        <div className="stores-catalog-grid">
          {lojas.map((loja) => {
            const isNew = loja.totalAvaliacoes === 0;

            return (
              <article key={loja.id} className="store-catalog-card">
                {/* Foto / Imagem da Loja com Badge de Avaliação */}
                <div className="store-catalog-img-wrap">
                  {loja.fotoPerfilUrl ? (
                    <img src={loja.fotoPerfilUrl} alt={loja.nomeFantasia} />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      🏪
                    </div>
                  )}

                  {/* Badge de Avaliação ou 'Novo' no canto superior direito */}
                  <div className="badge-photo-topright">
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(4px)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--mono)',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: isNew ? '#006375' : '#0f172a',
                      }}
                    >
                      {isNew ? (
                        <>☆ Novo</>
                      ) : (
                        <>
                          <StarIcon size={12} /> {loja.mediaAvaliacao.toFixed(1)} ({loja.totalAvaliacoes})
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Corpo do Card */}
                <div className="store-catalog-body">
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px' }}>{loja.nomeFantasia}</h3>

                  {/* Chip de Distância real se calculada */}
                  {loja.distanciaKm != null && (
                    <div style={{ marginBottom: 10 }}>
                      <span
                        style={{
                          background: '#ddf0f5',
                          color: '#006375',
                          fontFamily: 'var(--mono)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        📍 {loja.distanciaKm.toFixed(1)} km
                      </span>
                    </div>
                  )}

                  {/* Endereço real da loja */}
                  <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    📍 {loja.enderecoCompleto}
                  </p>

                  {/* Botão Ver Estoque */}
                  <div style={{ marginTop: 'auto' }}>
                    <Link
                      to={`/lojas/${loja.id}`}
                      className="btn btn-outline btn-block"
                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    >
                      Ver Estoque
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && !error && lojas.length === 0 && (
        <EmptyState text="Nenhuma loja parceira cadastrada na região no momento." />
      )}

      {/* Botão Carregar Mais Lojas (paginação real) */}
      {!loading && hasNextPage && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void carregarPagina(page + 1, true)}
            style={{
              background: '#ffffff',
              color: '#006375',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-pill)',
              padding: '10px 24px',
              fontFamily: 'var(--mono)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: loadingMore ? 'wait' : 'pointer',
              opacity: loadingMore ? 0.7 : 1,
            }}
          >
            {loadingMore ? 'Carregando mais lojas...' : 'Carregar mais lojas'}
          </button>
        </div>
      )}
    </section>
  );
}
