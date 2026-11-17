import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { formatHorariosFuncionamento } from '../lib/formatters';
import type { Loja } from '../types';
import { EmptyState, FilterIcon, MicIcon, SearchIcon, StarIcon } from '../components/ui';
import { Skeleton } from '../components/Skeleton';
import { getStoredUserCoords, setStoredUserCoords } from '../lib/location';

const MapaExplorar = lazy(() => import('../components/MapaExplorar'));

export function HomePage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [selectedLojaId, setSelectedLojaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [focusTarget, setFocusTarget] = useState<{ lat: number; lon: number; seq: number } | null>(null);

  const lojasAbortRef = useRef<AbortController | null>(null);

  const categories = ['Pneus', 'Óleos', 'Freios', 'Relação', 'Baterias', 'Filtros'];

  const carregarLojasPorCoordenadas = useCallback(async (lat?: number, lon?: number) => {
    lojasAbortRef.current?.abort();
    const controller = new AbortController();
    lojasAbortRef.current = controller;

    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (lat != null && lon != null) {
        query.set('userLat', lat.toString());
        query.set('userLon', lon.toString());
        query.set('raioKm', '15');
      }
      const queryString = query.toString();
      const lojasData = await api<Loja[]>(queryString ? `/lojas?${queryString}` : '/lojas', {
        signal: controller.signal,
      });
      setLojas(lojasData ?? []);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setLojas([]);
    } finally {
      if (lojasAbortRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const storedCoords = getStoredUserCoords();
    if (storedCoords) {
      void carregarLojasPorCoordenadas(storedCoords.lat, storedCoords.lng);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setStoredUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          void carregarLojasPorCoordenadas(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          if (!storedCoords) {
            void carregarLojasPorCoordenadas();
          }
        },
        { timeout: 5000 }
      );
    } else if (!storedCoords) {
      void carregarLojasPorCoordenadas();
    }

    return () => lojasAbortRef.current?.abort();
  }, [carregarLojasPorCoordenadas]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca?termo=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/busca');
    }
  }

  function handleCategoryClick(cat: string) {
    if (selectedCategory === cat) {
      setSelectedCategory(null);
      navigate('/busca');
    } else {
      setSelectedCategory(cat);
      navigate(`/busca?categoria=${encodeURIComponent(cat)}`);
    }
  }

  function handleCardClick(loja: Loja) {
    setSelectedLojaId(loja.id);
    if (loja.latitude != null && loja.longitude != null) {
      setFocusTarget((prev) => ({
        lat: loja.latitude,
        lon: loja.longitude,
        seq: (prev?.seq ?? 0) + 1,
      }));
    }
  }

  const handleMapLocationChange = useCallback(
    (lat: number, lon: number) => {
      void carregarLojasPorCoordenadas(lat, lon);
    },
    [carregarLojasPorCoordenadas]
  );

  return (
    <div className="explore-container">
      {/* PAINEL LATERAL ESQUERDO */}
      <aside className="explore-sidebar">
        {/* Barra de busca */}
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
            <SearchIcon size={18} />
          </span>
          <input
            type="search"
            aria-label="Buscar peças, marcas ou lojas"
            placeholder="Buscar peças, marcas ou lojas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 40px 11px 40px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-strong)',
              fontSize: '1rem',
              outline: 'none',
              background: '#ffffff',
            }}
          />
          <button
            type="button"
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Buscar por voz"
            aria-label="Buscar por voz"
          >
            <MicIcon size={18} />
          </button>
        </form>

        {/* Linha de Chips / Categorias */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          <button
            type="button"
            className="chip"
            style={{
              cursor: 'pointer',
              border: 'none',
              background: '#ddf0f5',
              color: '#006375',
              padding: '6px 12px',
              flexShrink: 0,
            }}
            onClick={() => navigate('/busca')}
          >
            <FilterIcon size={14} /> Filtros
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className="chip chip-muted"
              style={{
                cursor: 'pointer',
                border: '1px solid var(--border)',
                background: selectedCategory === cat ? '#006375' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#334155',
                padding: '6px 12px',
                flexShrink: 0,
              }}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Título de Seção */}
        <div>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748b',
            }}
          >
            LOJAS PRÓXIMAS EM DESTAQUE
          </span>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 14,
                }}
              >
                <Skeleton width="65%" height={18} style={{ marginBottom: 8 }} />
                <Skeleton width="90%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="55%" height={12} />
              </div>
            ))}
          </div>
        )}

        {!loading && lojas.length === 0 && (
          <EmptyState text="Nenhuma loja parceira cadastrada na região no momento." />
        )}

        {/* Lista de Cards de Lojas Reais */}
        {!loading && lojas.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {lojas.slice(0, 8).map((loja) => {
              const isSelected = selectedLojaId === loja.id;

              return (
                <div
                  key={loja.id}
                  onClick={() => handleCardClick(loja)}
                  style={{
                    background: '#ffffff',
                    border: isSelected ? '2px solid #006375' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 14,
                    boxShadow: isSelected ? 'var(--shadow)' : 'var(--shadow-sm)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        background: '#f8fafc',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      <StarIcon size={13} />
                      <span>{loja.mediaAvaliacao.toFixed(1)}</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1rem', margin: '0 0 4px', paddingRight: 60 }}>{loja.nomeFantasia}</h3>

                  <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {loja.distanciaKm != null
                      ? `📍 ${loja.distanciaKm.toFixed(1)} km • ${loja.enderecoCompleto}`
                      : `📍 ${loja.enderecoCompleto}`}
                  </p>

                  {loja.horariosFuncionamento && (
                    <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                      🕒 {formatHorariosFuncionamento(loja.horariosFuncionamento)}
                    </small>
                  )}
                </div>
              );
            })}

            {lojas.length > 8 && (
              <button
                type="button"
                onClick={() => navigate('/lojas')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #006375',
                  color: '#006375',
                  borderRadius: 'var(--radius-lg)',
                  padding: '10px 14px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Ver todas as lojas ({lojas.length})
              </button>
            )}
          </div>
        )}
      </aside>

      {/* PAINEL DIREITO: MAPA INTERATIVO CARREGADO SOB DEMANDA */}
      <div className="explore-map-wrapper">
        <Suspense fallback={<div className="explore-map-skeleton" aria-label="Carregando mapa interativo..." />}>
          <MapaExplorar
            lojas={lojas}
            selectedLojaId={selectedLojaId}
            onSelectLoja={setSelectedLojaId}
            onLocationChange={handleMapLocationChange}
            focusTarget={focusTarget}
          />
        </Suspense>
      </div>
    </div>
  );
}
