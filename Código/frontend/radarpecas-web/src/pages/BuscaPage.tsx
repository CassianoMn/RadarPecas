import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useActiveMoto } from '../context/useActiveMoto';
import type { BuscaResultado, OfertaBuscaItem } from '../types';
import { Button, Card, Chip, EmptyState, ErrorState, Loading } from '../components/ui';

export function BuscaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeMoto, setActiveMoto } = useActiveMoto();

  // Filtros
  const [termo, setTermo] = useState(searchParams.get('termo') || '');
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '');
  const [apenasEstoque, setApenasEstoque] = useState(searchParams.get('apenasEmEstoque') !== 'false');
  const [apenasPromocoes, setApenasPromocoes] = useState(searchParams.get('apenasPromocoes') === 'true');
  const [ordenacao, setOrdenacao] = useState(searchParams.get('ordenacao') || 'recomendados');
  const [raioKm, setRaioKm] = useState<number | ''>(
    searchParams.get('raioKm') ? Number(searchParams.get('raioKm')) : ''
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Geolocalização do usuário
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string>('');

  // Opções de categorias
  const [categorias, setCategorias] = useState<string[]>([]);

  // Dados da busca
  const [resultado, setResultado] = useState<BuscaResultado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Usar moto ativa como filtro por padrão se presente, a menos que explicitado na URL
  const modeloIdFilter = searchParams.get('modeloMotoId')
    ? Number(searchParams.get('modeloMotoId'))
    : activeMoto?.modeloMotoId;

  const anoFilter = searchParams.get('anoFabricacao')
    ? Number(searchParams.get('anoFabricacao'))
    : activeMoto?.anoFabricacao;

  // Carregar lista de categorias
  useEffect(() => {
    api<string[]>('/pecas/categorias')
      .then((cats) => setCategorias(cats ?? []))
      .catch(() => {
        // Fallback caso backend não liste
        setCategorias(['Filtros', 'Pneus', 'Óleos', 'Freios', 'Relação', 'Motor', 'Elétrica']);
      });
  }, []);

  function obterLocalizacao() {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocalização não suportada no seu navegador.');
      return;
    }
    setGeoLoading(true);
    setGeoStatus('Obtendo localização...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setGeoLoading(false);
        setGeoStatus('✓ Localização obtida!');
      },
      (err) => {
        setGeoLoading(false);
        setGeoStatus('Não foi possível obter localização: ' + err.message);
      },
      { timeout: 10000 }
    );
  }

  const executarBusca = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (termo.trim()) params.set('termo', termo.trim());
    if (categoria) params.set('categoria', categoria);
    if (modeloIdFilter) params.set('modeloMotoId', modeloIdFilter.toString());
    if (anoFilter) params.set('anoFabricacao', anoFilter.toString());
    if (apenasEstoque) params.set('apenasEmEstoque', 'true');
    else params.set('apenasEmEstoque', 'false');
    if (apenasPromocoes) params.set('apenasPromocoes', 'true');
    if (ordenacao) params.set('ordenacao', ordenacao);
    if (raioKm) params.set('raioKm', raioKm.toString());
    if (userCoords) {
      params.set('userLatitude', userCoords.lat.toString());
      params.set('userLongitude', userCoords.lon.toString());
    }
    params.set('page', page.toString());
    params.set('pageSize', '12');

    // Atualiza a URL sem recarregar a página
    setSearchParams(params, { replace: true });

    try {
      const data = await api<BuscaResultado>(`/busca?${params.toString()}`);
      setResultado(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao buscar peças.');
    } finally {
      setLoading(false);
    }
  }, [
    termo,
    categoria,
    modeloIdFilter,
    anoFilter,
    apenasEstoque,
    apenasPromocoes,
    ordenacao,
    raioKm,
    userCoords,
    page,
    setSearchParams,
  ]);

  // Executar busca quando os filtros principais mudarem ou na carga inicial
  useEffect(() => {
    executarBusca();
  }, [executarBusca]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    executarBusca();
  }

  function handleClearMotoFilter() {
    const next = new URLSearchParams(searchParams);
    next.delete('modeloMotoId');
    next.delete('anoFabricacao');
    setSearchParams(next);
    setActiveMoto(null);
  }

  function formatMoney(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  return (
    <section>
      <h1>Buscar Peças & Ofertas</h1>

      {/* Banner de Contexto de Motocicleta Ativa */}
      {activeMoto ? (
        <div
          style={{
            background: 'var(--chip-bg)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            margin: '12px 0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
              🎯 Filtrando peças compatíveis com sua moto:{' '}
            </span>
            <span>
              {activeMoto.marca} {activeMoto.modelo} ({activeMoto.anoFabricacao})
              {activeMoto.apelido ? ` - "${activeMoto.apelido}"` : ''}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/garagem" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              Trocar na Garagem
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--danger)' }}
              onClick={handleClearMotoFilter}
            >
              Remover filtro de moto
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius)',
            padding: '10px 16px',
            margin: '12px 0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            💡 Dica: Cadastre ou selecione sua moto na Garagem para ver somente peças 100% compatíveis!
          </span>
          <Link to="/garagem" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            Ir para Garagem
          </Link>
        </div>
      )}

      {/* Barra de Busca de Texto */}
      <form onSubmit={handleSearchSubmit} className="searchbar">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Digite o nome da peça, código, especificação ou marca..."
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          aria-label="Buscar peças"
        />
        <Button type="submit" style={{ padding: '8px 16px' }}>
          Buscar
        </Button>
      </form>

      {/* Grade de Filtros */}
      <div
        className="card"
        style={{
          background: 'var(--surface)',
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            alignItems: 'flex-end',
          }}
        >
          {/* Filtro de Categoria */}
          <div>
            <label style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
              Categoria
            </label>
            <select
              className="input"
              style={{ padding: '8px 10px' }}
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas as categorias</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <label style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
              Ordenar por
            </label>
            <select
              className="input"
              style={{ padding: '8px 10px' }}
              value={ordenacao}
              onChange={(e) => {
                setOrdenacao(e.target.value);
                setPage(1);
              }}
            >
              <option value="recomendados">Melhores Recomendações</option>
              <option value="menor_preco">Menor Preço</option>
              <option value="maior_preco">Maior Preço</option>
              <option value="menor_distancia">Menor Distância</option>
              <option value="melhor_avaliacao">Melhor Avaliação da Loja</option>
            </select>
          </div>

          {/* Raio de Distância */}
          <div>
            <label style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
              Raio de distância
            </label>
            <select
              className="input"
              style={{ padding: '8px 10px' }}
              value={raioKm}
              onChange={(e) => {
                setRaioKm(e.target.value ? Number(e.target.value) : '');
                setPage(1);
              }}
            >
              <option value="">Sem limite de raio</option>
              <option value="5">Até 5 km</option>
              <option value="10">Até 10 km</option>
              <option value="25">Até 25 km</option>
              <option value="50">Até 50 km</option>
              <option value="100">Até 100 km</option>
            </select>
          </div>

          {/* Botão de Localização */}
          <div>
            <label style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
              Localização atual
            </label>
            <Button
              type="button"
              variant={userCoords ? 'outline' : 'ghost'}
              style={{ width: '100%', padding: '9px 12px', fontSize: '0.8rem' }}
              onClick={obterLocalizacao}
              disabled={geoLoading}
            >
              {geoLoading ? 'Localizando...' : userCoords ? '📍 Atualizar Local' : '📍 Usar Minha Posição'}
            </Button>
          </div>
        </div>

        {/* Checkboxes de Estoque e Promoções */}
        <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={apenasEstoque}
              onChange={(e) => {
                setApenasEstoque(e.target.checked);
                setPage(1);
              }}
            />
            Apenas itens com estoque disponível
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={apenasPromocoes}
              onChange={(e) => {
                setApenasPromocoes(e.target.checked);
                setPage(1);
              }}
            />
            🔥 Apenas ofertas em promoção
          </label>

          {geoStatus && (
            <span style={{ fontSize: '0.8rem', color: userCoords ? 'var(--primary)' : 'var(--muted)', marginLeft: 'auto' }}>
              {geoStatus}
            </span>
          )}
        </div>
      </div>

      {/* Feedback de Carregamento e Erros */}
      {loading && <Loading text="Buscando as melhores ofertas para você..." />}
      {error && <ErrorState text={error} onRetry={executarBusca} />}

      {/* Resultados da Busca */}
      {!loading && !error && resultado && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              {resultado.ofertas.totalCount}{' '}
              {resultado.ofertas.totalCount === 1 ? 'peça encontrada' : 'peças encontradas'}
            </span>
            {resultado.filtroCompatibilidadeAtivo && (
              <Chip>Filtro de compatibilidade ativo</Chip>
            )}
          </div>

          {resultado.ofertas.items.length === 0 ? (
            <EmptyState text="Nenhuma peça encontrada com os filtros selecionados. Tente ampliar o raio ou buscar por outros termos." />
          ) : (
            <div className="grid">
              {resultado.ofertas.items.map((item: OfertaBuscaItem) => (
                <Card
                  key={item.estoqueId}
                  title={item.nomePeca}
                  footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Link className="btn btn-outline" to={`/ofertas/${item.estoqueId}`}>
                        Ver Detalhes
                      </Link>
                      <Link
                        to={`/lojas/${item.lojaId}`}
                        style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}
                      >
                        Ver Loja →
                      </Link>
                    </div>
                  }
                >
                  <div style={{ display: 'flex', gap: 14 }}>
                    {item.fotoPecaUrl ? (
                      <img
                        src={item.fotoPecaUrl}
                        alt={item.nomePeca}
                        style={{
                          width: 84,
                          height: 84,
                          objectFit: 'cover',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 84,
                          height: 84,
                          borderRadius: 'var(--radius)',
                          background: 'var(--chip-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem',
                          flexShrink: 0,
                        }}
                      >
                        ⚙️
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <div className="chips-row" style={{ marginBottom: 6 }}>
                        <Chip variant="muted">{item.categoria}</Chip>
                        {item.compativel && <Chip>✓ Compatível</Chip>}
                        {item.promocaoAtiva && <Chip variant="promo">Promoção</Chip>}
                        {item.distanciaKm != null && (
                          <Chip variant="muted">{item.distanciaKm.toFixed(1)} km</Chip>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0' }}>
                        <span className="price">
                          {formatMoney(item.precoEfetivo)}
                        </span>
                        {item.promocaoAtiva && item.precoPromocional && (
                          <span style={{ textDecoration: 'line-through', color: 'var(--muted)', fontSize: '0.9rem' }}>
                            {formatMoney(item.precoVenda)}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.88rem', color: 'var(--text)' }}>
                        <strong>{item.nomeLoja}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        {item.enderecoCompleto}
                      </div>

                      <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: '0.8rem', alignItems: 'center' }}>
                        <span className="rating">
                          ★ {item.mediaAvaliacaoLoja.toFixed(1)}{' '}
                          <span style={{ color: 'var(--muted)' }}>({item.totalAvaliacoesLoja})</span>
                        </span>
                        <span style={{ color: item.quantidadeEstoque > 0 ? 'var(--primary)' : 'var(--danger)' }}>
                          {item.quantidadeEstoque > 0 ? `Estoque: ${item.quantidadeEstoque} un` : 'Sem estoque'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Controles de Paginação */}
          {resultado.ofertas.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                marginTop: 24,
              }}
            >
              <Button
                type="button"
                variant="outline"
                disabled={!resultado.ofertas.hasPreviousPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Anterior
              </Button>
              <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                Página {resultado.ofertas.page} de {resultado.ofertas.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!resultado.ofertas.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima →
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
