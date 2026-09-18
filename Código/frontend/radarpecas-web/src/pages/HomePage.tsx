import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useActiveMoto } from '../context/useActiveMoto';
import type { BuscaResultado, Loja, OfertaBuscaItem } from '../types';
import { Button, Card, Chip, EmptyState, Loading } from '../components/ui';

export function HomePage() {
  const navigate = useNavigate();
  const { activeMoto } = useActiveMoto();

  const [searchTerm, setSearchTerm] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [destaqueLojas, setDestaqueLojas] = useState<Loja[]>([]);
  const [promocoes, setPromocoes] = useState<OfertaBuscaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarHome() {
      setLoading(true);
      try {
        // Carregar categorias, lojas e ofertas em promoção em paralelo
        const [catsRes, lojasRes, promocoesRes] = await Promise.allSettled([
          api<string[]>('/pecas/categorias'),
          api<Loja[]>('/lojas'),
          api<BuscaResultado>('/busca?apenasPromocoes=true&pageSize=4'),
        ]);

        if (catsRes.status === 'fulfilled' && catsRes.value) {
          setCategorias(catsRes.value);
        } else {
          setCategorias(['Filtros', 'Pneus', 'Óleos', 'Freios', 'Relação', 'Motor', 'Elétrica']);
        }

        if (lojasRes.status === 'fulfilled' && lojasRes.value) {
          setDestaqueLojas(lojasRes.value.slice(0, 4));
        }

        if (promocoesRes.status === 'fulfilled' && promocoesRes.value) {
          setPromocoes(promocoesRes.value.ofertas.items);
        }
      } finally {
        setLoading(false);
      }
    }

    carregarHome();
  }, []);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca?termo=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/busca');
    }
  }

  function handleCategoryClick(cat: string) {
    navigate(`/busca?categoria=${encodeURIComponent(cat)}`);
  }

  function formatMoney(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  return (
    <section>
      {/* Busca Principal */}
      <form onSubmit={handleSearchSubmit} className="searchbar">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Buscar peças, marcas, modelos ou lojas..."
          aria-label="Buscar peças, marcas ou lojas"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit" style={{ padding: '8px 16px' }}>
          Buscar
        </Button>
      </form>

      {/* Categorias Rápidas */}
      <div className="chips-row" style={{ marginBottom: 20 }}>
        {categorias.map((cat) => (
          <button
            key={cat}
            type="button"
            className="chip"
            onClick={() => handleCategoryClick(cat)}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Banner da Moto Ativa na Home */}
      {activeMoto ? (
        <div
          style={{
            background: 'var(--chip-bg)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700 }}>
              Sua Moto Ativa
            </span>
            <h3 style={{ margin: '4px 0 0' }}>
              🏍️ {activeMoto.marca} {activeMoto.modelo} ({activeMoto.anoFabricacao})
              {activeMoto.apelido ? ` - "${activeMoto.apelido}"` : ''}
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              Veja somente ofertas compatíveis com sua motocicleta.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              to={`/busca?modeloMotoId=${activeMoto.modeloMotoId}&anoFabricacao=${activeMoto.anoFabricacao}`}
              className="btn"
            >
              Ver Peças Compatíveis
            </Link>
            <Link to="/garagem" className="btn btn-ghost">
              Garagem
            </Link>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>Cadastre sua moto na Garagem Virtual</h3>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              Elimine o risco de comprar peças erradas com nosso filtro de compatibilidade inteligente.
            </p>
          </div>
          <Link to="/garagem" className="btn btn-outline">
            Ir para a Garagem
          </Link>
        </div>
      )}

      {/* Ofertas em Promoção */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-label">🔥 Ofertas e Promoções Imperdíveis</h2>
        <Link to="/busca?apenasPromocoes=true" style={{ fontSize: '0.82rem', color: 'var(--primary)', textDecoration: 'none' }}>
          Ver todas as promoções →
        </Link>
      </div>

      {loading && <Loading text="Carregando ofertas..." />}

      {!loading && promocoes.length === 0 && (
        <EmptyState text="Nenhuma oferta em promoção cadastrada no momento." />
      )}

      {!loading && promocoes.length > 0 && (
        <div className="grid">
          {promocoes.map((item) => (
            <Card
              key={item.estoqueId}
              title={item.nomePeca}
              footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Link className="btn btn-outline" to={`/ofertas/${item.estoqueId}`}>
                    Ver Detalhes
                  </Link>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {item.nomeLoja}
                  </span>
                </div>
              }
            >
              <div style={{ display: 'flex', gap: 12 }}>
                {item.fotoPecaUrl ? (
                  <img
                    src={item.fotoPecaUrl}
                    alt={item.nomePeca}
                    style={{
                      width: 72,
                      height: 72,
                      objectFit: 'cover',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 'var(--radius)',
                      background: 'var(--chip-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                      flexShrink: 0,
                    }}
                  >
                    ⚙️
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div className="chips-row" style={{ marginBottom: 4 }}>
                    <Chip variant="promo">Promoção</Chip>
                    <Chip variant="muted">{item.categoria}</Chip>
                    {item.compativel && <Chip>Compatível</Chip>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '4px 0' }}>
                    <span className="price">{formatMoney(item.precoEfetivo)}</span>
                    {item.precoPromocional && (
                      <span style={{ textDecoration: 'line-through', color: 'var(--muted)', fontSize: '0.85rem' }}>
                        {formatMoney(item.precoVenda)}
                      </span>
                    )}
                  </div>
                  <small style={{ color: 'var(--muted)' }}>📍 {item.enderecoCompleto}</small>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Lojas em Destaque */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        <h2 className="section-label">🏪 Lojas Parceiras</h2>
        <Link to="/lojas" style={{ fontSize: '0.82rem', color: 'var(--primary)', textDecoration: 'none' }}>
          Ver todas as lojas →
        </Link>
      </div>

      {!loading && destaqueLojas.length === 0 && (
        <EmptyState text="Nenhuma loja parceira cadastrada ainda." />
      )}

      {!loading && destaqueLojas.length > 0 && (
        <div className="grid">
          {destaqueLojas.map((loja) => (
            <Card
              key={loja.id}
              title={loja.nomeFantasia}
              footer={
                <Link className="btn btn-outline" to={`/lojas/${loja.id}`}>
                  Ver Estoque e Detalhes
                </Link>
              }
            >
              <div style={{ display: 'flex', gap: 12 }}>
                {loja.fotoPerfilUrl ? (
                  <img
                    src={loja.fotoPerfilUrl}
                    alt={loja.nomeFantasia}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 'var(--radius)',
                      objectFit: 'cover',
                      border: '1px solid var(--border)',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 'var(--radius)',
                      background: 'var(--chip-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0,
                    }}
                  >
                    🏪
                  </div>
                )}
                <div>
                  <div className="chips-row" style={{ marginBottom: 4 }}>
                    <span className="rating">★ {loja.mediaAvaliacao.toFixed(1)}</span>
                    <span className="store-line">({loja.totalAvaliacoes} avaliações)</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>{loja.enderecoCompleto}</p>
                  {loja.telefoneContato && (
                    <small style={{ color: 'var(--muted)' }}>Tel: {loja.telefoneContato}</small>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Ações de Rodapé */}
      <div className="actions" style={{ marginTop: 32 }}>
        <Link className="btn" to="/busca">
          Buscar Todas as Peças
        </Link>
        <Link className="btn btn-ghost" to="/garagem">
          Acessar Minha Garagem
        </Link>
      </div>
    </section>
  );
}
