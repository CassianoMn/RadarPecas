import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useActiveMoto } from '../context/useActiveMoto';
import type { BuscaResultado } from '../types';
import { CheckIcon, EmptyState, ErrorState, Loading } from '../components/ui';

export function BuscaPage() {
  const [searchParams] = useSearchParams();
  const { activeMoto } = useActiveMoto();

  // Filtros
  const termo = searchParams.get('termo') || '';
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '');
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [precoMaximo, setPrecoMaximo] = useState<number>(1500);
  const [distanciaPill, setDistanciaPill] = useState<'5km' | '15km' | '+15km'>('15km');
  const [ordenacao, setOrdenacao] = useState(searchParams.get('ordenacao') || 'menor_distancia');
  const [page, setPage] = useState(1);

  const [categorias, setCategorias] = useState<string[]>([]);
  const [resultado, setResultado] = useState<BuscaResultado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const marcasDisponiveis = ['DID', 'KMC', 'Riffel', 'Vaz', 'Vaz / Scud', 'Coroa & Pinhão'];

  // Carregar categorias
  useEffect(() => {
    api<string[]>('/pecas/categorias')
      .then((cats) => {
        if (cats && cats.length > 0) setCategorias(cats);
        else setCategorias(['Transmissão', 'Filtros', 'Pneus', 'Óleos', 'Freios', 'Motor', 'Elétrica']);
      })
      .catch(() => {
        setCategorias(['Transmissão', 'Filtros', 'Pneus', 'Óleos', 'Freios', 'Motor', 'Elétrica']);
      });
  }, []);

  const executarBusca = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (termo.trim()) params.set('termo', termo.trim());
    if (categoria) params.set('categoria', categoria);
    if (activeMoto) {
      params.set('modeloMotoId', activeMoto.modeloMotoId.toString());
      params.set('anoFabricacao', activeMoto.anoFabricacao.toString());
    }
    const raio = distanciaPill === '5km' ? '5' : distanciaPill === '15km' ? '15' : '50';
    params.set('raioKm', raio);
    params.set('ordenacao', ordenacao);
    params.set('page', page.toString());
    params.set('pageSize', '12');

    try {
      const data = await api<BuscaResultado>(`/busca?${params.toString()}`);
      setResultado(data);
    } catch {
      setError('Erro ao carregar ofertas. Tente novamente.');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  }, [termo, categoria, activeMoto, distanciaPill, ordenacao, page]);

  useEffect(() => {
    executarBusca();
  }, [executarBusca]);

  function handleToggleMarca(marca: string) {
    if (selectedMarcas.includes(marca)) {
      setSelectedMarcas(selectedMarcas.filter((m) => m !== marca));
    } else {
      setSelectedMarcas([...selectedMarcas, marca]);
    }
  }

  function handleLimparFiltros() {
    setCategoria('');
    setSelectedMarcas([]);
    setPrecoMaximo(450);
    setDistanciaPill('15km');
  }

  function formatMoney(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  return (
    <div className="search-layout">
      {/* BARRA LATERAL DE FILTROS */}
      <aside className="search-sidebar">
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Filtros</h2>

        {/* Categoria */}
        <div>
          <label className="field-label-mono" style={{ display: 'block', marginBottom: 6 }}>
            Categoria
          </label>
          <select
            className="input"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Marcas com Checkbox */}
        <div>
          <label className="field-label-mono" style={{ display: 'block', marginBottom: 8 }}>
            Marca
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {marcasDisponiveis.map((marca) => {
              const checked = selectedMarcas.includes(marca);
              return (
                <label
                  key={marca}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#334155',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleMarca(marca)}
                    style={{ accentColor: '#006375', width: 16, height: 16 }}
                  />
                  {marca}
                </label>
              );
            })}
          </div>
        </div>

        {/* Preço Máximo com Slider */}
        <div>
          <label className="field-label-mono" style={{ display: 'block', marginBottom: 6 }}>
            Preço Máximo
          </label>
          <input
            type="range"
            min="50"
            max="1500"
            step="10"
            value={precoMaximo}
            onChange={(e) => setPrecoMaximo(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#006375' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <span>R$ 50</span>
            <span style={{ fontWeight: 700, color: '#006375' }}>Até {formatMoney(precoMaximo)}</span>
          </div>
        </div>

        {/* Distância em Pílulas */}
        <div>
          <label className="field-label-mono" style={{ display: 'block', marginBottom: 6 }}>
            Distância
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['5km', '15km', '+15km'] as const).map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => setDistanciaPill(dist)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-strong)',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: distanciaPill === dist ? '#006375' : '#ffffff',
                  color: distanciaPill === dist ? '#ffffff' : '#334155',
                  transition: 'all 0.15s ease',
                }}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        <button
          type="button"
          onClick={handleLimparFiltros}
          style={{
            background: '#ddf0f5',
            color: '#006375',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: '10px 16px',
            fontFamily: 'var(--mono)',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Limpar Filtros
        </button>

        {/* Box da Garagem Virtual Ativa no rodapé da sidebar */}
        <div
          style={{
            border: '1px solid var(--border)',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: 14,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '1.2rem' }}>🏍️</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#006375' }}>
              Garagem Virtual Ativa
            </span>
          </div>
          <p style={{ margin: '4px 0 10px', fontSize: '0.85rem', color: '#64748b' }}>
            Filtrando para:{' '}
            <strong style={{ color: '#0f172a' }}>
              {activeMoto ? `${activeMoto.marca} ${activeMoto.modelo} ${activeMoto.anoFabricacao}` : 'Nenhuma moto selecionada'}
            </strong>
          </p>
          <Link
            to="/garagem"
            className="btn btn-outline"
            style={{ width: '100%', padding: '6px 12px', fontSize: '0.78rem', textAlign: 'center' }}
          >
            Alterar Moto
          </Link>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL COM OS RESULTADOS */}
      <main>
        {/* Cabeçalho de Resultados */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: 2 }}>
              {termo ? `Resultados para "${termo}"` : 'Explorar Ofertas'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              {resultado ? `${resultado.ofertas.totalCount} peças encontradas num raio de ${distanciaPill}` : 'Buscando peças...'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: '#64748b' }}>Ordenar por:</span>
            <select
              className="input"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
            >
              <option value="menor_distancia">Mais Próximos</option>
              <option value="menor_preco">Menor Preço</option>
              <option value="maior_preco">Maior Preço</option>
              <option value="melhor_avaliacao">Melhor Avaliação</option>
            </select>
          </div>
        </div>

        {loading && <Loading text="Buscando ofertas para sua moto..." />}
        {error && <ErrorState text={error} onRetry={executarBusca} />}

        {/* Grade de Cards de Produtos (3 colunas) */}
        {!loading && !error && resultado && (
          <>
            {resultado.ofertas.items.length === 0 ? (
              <EmptyState text="Nenhuma peça encontrada com os filtros selecionados." />
            ) : (
              <div className="search-results-grid">
                {resultado.ofertas.items.map((item) => {
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

                        {item.fotoPecaUrl ? (
                          <img src={item.fotoPecaUrl} alt={item.nomePeca} />
                        ) : (
                          <div style={{ fontSize: '3rem' }}>⚙️</div>
                        )}
                      </div>

                      {/* Corpo do Card */}
                      <div className="product-card-body">
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
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

            {/* Botão Carregar Mais Resultados */}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                style={{
                  background: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '10px 24px',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Carregar mais resultados
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
