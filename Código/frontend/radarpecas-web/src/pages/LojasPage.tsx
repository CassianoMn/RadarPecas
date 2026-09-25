import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Loja } from '../types';
import { EmptyState, FilterIcon, Loading, StarIcon } from '../components/ui';
import { getStoredUserCoords, setStoredUserCoords } from '../lib/location';

export function LojasPage() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<'proximas' | 'avaliacao'>('proximas');

  const carregarLojas = useCallback(async () => {
    setLoading(true);
    const stored = getStoredUserCoords();
    const fetchWithCoords = async (lat?: number, lon?: number) => {
      const query = new URLSearchParams();
      if (lat != null && lon != null) {
        query.set('userLat', lat.toString());
        query.set('userLon', lon.toString());
      }
      try {
        const data = await api<Loja[]>(query.toString() ? `/lojas?${query.toString()}` : '/lojas');
        setLojas(data ?? []);
      } catch {
        setLojas([]);
      } finally {
        setLoading(false);
      }
    };

    if (stored) {
      await fetchWithCoords(stored.lat, stored.lng);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setStoredUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          await fetchWithCoords(pos.coords.latitude, pos.coords.longitude);
        },
        async () => {
          if (!stored) {
            await fetchWithCoords();
          }
        },
        { timeout: 5000 }
      );
    } else if (!stored) {
      await fetchWithCoords();
    }
  }, []);

  useEffect(() => {
    carregarLojas();
  }, [carregarLojas]);

  // Ordenação de acordo com o filtro ativo
  const lojasOrdenadas = [...lojas].sort((a, b) => {
    if (filtroAtivo === 'avaliacao') {
      return b.mediaAvaliacao - a.mediaAvaliacao;
    }
    return (a.distanciaKm ?? 99) - (b.distanciaKm ?? 99);
  });

  return (
    <section>
      {/* Título & Subtítulo */}
      <h1 style={{ fontSize: '1.9rem', marginBottom: 4 }}>Catálogo de Lojas</h1>
      <p style={{ fontSize: '0.95rem', margin: '0 0 18px', color: '#64748b' }}>
        Encontre as melhores oficinas e revendas perto de você.
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

      {/* Grid de 4 Colunas com os Cards de Lojas */}
      {!loading && (
        <div className="stores-catalog-grid">
          {lojasOrdenadas.map((loja) => {
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
                        color: '#94a3b8',
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
                  <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
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

      {!loading && lojasOrdenadas.length === 0 && (
        <EmptyState text="Nenhuma loja parceira cadastrada na região no momento." />
      )}

      {/* Botão Carregar Mais Lojas */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button
          type="button"
          onClick={carregarLojas}
          style={{
            background: '#ffffff',
            color: '#006375',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-pill)',
            padding: '10px 24px',
            fontFamily: 'var(--mono)',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Carregar mais lojas
        </button>
      </div>
    </section>
  );
}
