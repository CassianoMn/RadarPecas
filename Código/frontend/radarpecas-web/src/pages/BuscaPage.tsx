import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useActiveMoto } from '../context/useActiveMoto';
import type { BuscaResultado } from '../types';
import { CheckIcon, ErrorState, Loading } from '../components/ui';
import { getStoredUserCoords, setStoredUserCoords } from '../lib/location';

export function BuscaPage() {
  const [searchParams] = useSearchParams();
  const { activeMoto } = useActiveMoto();

  // Filtros
  const termo = searchParams.get('termo') || '';
  const apenasPromocoesParam = searchParams.get('apenasPromocoes') === 'true';
  const [apenasPromocoes, setApenasPromocoes] = useState(apenasPromocoesParam);
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '');
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [precoMaximo, setPrecoMaximo] = useState<number>(1500);
  const [distanciaPill, setDistanciaPill] = useState<'5km' | '15km' | '+15km'>('15km');
  const [ordenacao, setOrdenacao] = useState(searchParams.get('ordenacao') || 'menor_distancia');
  const [page, setPage] = useState(1);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const stored = getStoredUserCoords();
    return stored ? { lat: stored.lat, lng: stored.lng } : null;
  });
  const [solicitandoLocalizacao, setSolicitandoLocalizacao] = useState(false);

  const [categorias, setCategorias] = useState<string[]>([]);
  const [resultado, setResultado] = useState<BuscaResultado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const marcasDisponiveis = ['Vaz', 'Cobreq', 'Fram', 'Pirelli', 'Heliar', 'Mobil', 'Philips', 'DID', 'KMC'];

  // Sincronizar apenasPromocoes quando mudar nos searchParams
  useEffect(() => {
    const isPromo = searchParams.get('apenasPromocoes') === 'true';
    setApenasPromocoes(isPromo);
  }, [searchParams]);

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

    if (apenasPromocoes) {
      params.set('apenasPromocoes', 'true');
    }

    // Coordenadas para cálculo de distância e raio
    if (userCoords) {
      params.set('userLatitude', userCoords.lat.toString());
      params.set('userLongitude', userCoords.lng.toString());
    }
    const raio = distanciaPill === '5km' ? '5' : distanciaPill === '15km' ? '15' : '50';
    params.set('raioKm', raio);

    // Filtros de marca e preço
    if (selectedMarcas.length > 0) {
      params.set('marca', selectedMarcas.join(','));
    }
    if (precoMaximo < 1500) {
      params.set('precoMaximo', precoMaximo.toString());
    }

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
  }, [termo, categoria, activeMoto, apenasPromocoes, distanciaPill, ordenacao, page, selectedMarcas, precoMaximo, userCoords]);

  useEffect(() => {
    executarBusca();
  }, [executarBusca]);

  function handleToggleMarca(marca: string) {
    setPage(1);
    if (selectedMarcas.includes(marca)) {
      setSelectedMarcas(selectedMarcas.filter((m) => m !== marca));
    } else {
      setSelectedMarcas([...selectedMarcas, marca]);
    }
  }

  function handleLimparFiltros() {
    setCategoria('');
    setSelectedMarcas([]);
    setPrecoMaximo(1500);
    setDistanciaPill('15km');
    setApenasPromocoes(false);
    setPage(1);
  }

  function formatMoney(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  return (
    <div className="search-layout">
      {/* BARRA LATERAL DE FILTROS */}
      <aside className="search-sidebar">
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Filtros</h2>

        {/* Promoções / Ofertas Especiais */}
        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <label className="field-label-mono" style={{ display: 'block', marginBottom: 6 }}>
            Ofertas Especiais
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontSize: '0.88rem',
              color: '#0f172a',
              fontWeight: 600,
            }}
          >
            <input
              type="checkbox"
              checked={apenasPromocoes}
              onChange={(e) => {
                setApenasPromocoes(e.target.checked);
                setPage(1);
              }}
              style={{ accentColor: '#006375', width: 16, height: 16 }}
            />
            🔥 Apenas Promoções
          </label>
        </div>

        {/* Categoria */}
        <div>
          <label className="field-label-mono" style={{ display: 'block', marginBottom: 6 }}>
            Categoria
          </label>
          <select
            className="input"
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              setPage(1);
            }}
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
            onChange={(e) => {
              setPrecoMaximo(Number(e.target.value));
              setPage(1);
            }}
            style={{ width: '100%', accentColor: '#006375' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <span>R$ 50</span>
            <span style={{ fontWeight: 700, color: '#006375' }}>Até {formatMoney(precoMaximo)}</span>
          </div>
        </div>

        {/* Distância em Pílulas */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="field-label-mono" style={{ margin: 0 }}>
              Distância
            </label>
            {userCoords ? (
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                📍 GPS Ativo
              </span>
            ) : (
              <button
                type="button"
                onClick={obterLocalizacaoNavegador}
                disabled={solicitandoLocalizacao}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#006375',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                {solicitandoLocalizacao ? 'Obtendo...' : '📍 Ativar GPS'}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['5km', '15km', '+15km'] as const).map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => {
                  setDistanciaPill(dist);
                  setPage(1);
                }}
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
          {!userCoords && (
            <p style={{ margin: '6px 0 0', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.3 }}>
              Ative a localização para filtrar com precisão pelo raio selecionado.
            </p>
          )}
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
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              {resultado
                ? userCoords
                  ? `${resultado.ofertas.totalCount} ${resultado.ofertas.totalCount === 1 ? 'peça encontrada' : 'peças encontradas'} num raio de ${distanciaPill}`
                  : `${resultado.ofertas.totalCount} ${resultado.ofertas.totalCount === 1 ? 'peça encontrada' : 'peças encontradas'} (localização não informada)`
                : 'Buscando peças...'}
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
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.5 }}>
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
                      onClick={() => {
                        setDistanciaPill('+15km');
                        setPage(1);
                      }}
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                    >
                      Ampliar raio para +15km (até 50km)
                    </button>
                  )}
                  {apenasPromocoes && (
                    <button
                      type="button"
                      onClick={() => {
                        setApenasPromocoes(false);
                        setPage(1);
                      }}
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
