import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useActiveMoto } from '../context/useActiveMoto';
import type { OfertaDetalhe } from '../types';
import { Button, Card, Chip, EmptyState, ErrorState, Loading } from '../components/ui';

export function OfertaDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const { activeMoto } = useActiveMoto();

  const [oferta, setOferta] = useState<OfertaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clickedContact, setClickedContact] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');

    // Tentar obter coordenadas do navegador se disponíveis para calcular distância precisa
    const query = new URLSearchParams();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          query.set('userLat', pos.coords.latitude.toString());
          query.set('userLon', pos.coords.longitude.toString());
          carregarOferta(query.toString());
        },
        () => carregarOferta(query.toString()),
        { timeout: 4000 }
      );
    } else {
      carregarOferta(query.toString());
    }

    async function carregarOferta(queryString: string) {
      try {
        const url = `/ofertas/${id}${queryString ? `?${queryString}` : ''}`;
        const data = await api<OfertaDetalhe>(url);
        setOferta(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Erro ao carregar detalhes da oferta.');
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  async function handleContactClick() {
    if (!id || !oferta) return;
    setClickedContact(true);

    // Registra clique no backend de estatísticas
    try {
      await api(`/ofertas/${id}/clique`, { method: 'POST' });
    } catch {
      // Ignora erro de telemetria
    }

    // Redireciona para contato (WhatsApp se disponível)
    if (oferta.loja.telefoneContato) {
      const cleanPhone = oferta.loja.telefoneContato.replace(/\D/g, '');
      const msg = encodeURIComponent(
        `Olá! Vi a oferta da peça "${oferta.peca.nome}" no RadarPeças e gostaria de mais informações.`
      );
      window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
    }
  }

  function formatMoney(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  // Verifica se a moto ativa é compatível
  const isMotoCompativel = activeMoto && oferta?.compatibilidades?.some(
    (c) =>
      c.id === activeMoto.modeloMotoId ||
      (c.marca.toLowerCase() === activeMoto.marca.toLowerCase() &&
        c.modelo.toLowerCase() === activeMoto.modelo.toLowerCase())
  );

  // Faz o parse do campo JSONB de especificações se existir
  let specsParsed: Record<string, string | number | boolean> | null = null;
  if (oferta?.peca.especificacoes) {
    try {
      specsParsed = JSON.parse(oferta.peca.especificacoes);
    } catch {
      // se for string comum
    }
  }

  if (loading) {
    return (
      <section>
        <Loading text="Carregando detalhes da oferta..." />
      </section>
    );
  }

  if (error || !oferta) {
    return (
      <section>
        <ErrorState text={error || 'Oferta não encontrada.'} />
        <Link to="/busca" className="btn btn-outline" style={{ marginTop: 16 }}>
          ← Voltar para a busca
        </Link>
      </section>
    );
  }

  return (
    <section>
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Navegação estrutural">
        <Link to="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          Explorar
        </Link>{' '}
        / <Link to="/busca" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Busca</Link>{' '}
        / <span style={{ color: 'var(--text)' }}>{oferta.peca.nome}</span>
      </nav>

      {/* Banner de Compatibilidade com a moto ativa */}
      {activeMoto && (
        <div
          style={{
            borderRadius: 'var(--radius)',
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: isMotoCompativel ? '#e6f7ed' : '#fff4e5',
            border: `1px solid ${isMotoCompativel ? '#34d399' : '#f59e0b'}`,
            color: isMotoCompativel ? '#065f46' : '#92400e',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{isMotoCompativel ? '✓' : '⚠️'}</span>
          <div>
            <strong>
              {isMotoCompativel
                ? `Compatível com sua moto cadastrada: ${activeMoto.marca} ${activeMoto.modelo} (${activeMoto.anoFabricacao})`
                : `Atenção: Não confirmamos compatibilidade direta com ${activeMoto.marca} ${activeMoto.modelo} (${activeMoto.anoFabricacao})`}
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'inherit', opacity: 0.9 }}>
              {isMotoCompativel
                ? 'Essa peça foi verificada para o modelo e ano da sua motocicleta.'
                : 'Verifique a lista de motos compatíveis abaixo ou tire dúvidas diretamente com o lojista.'}
            </p>
          </div>
        </div>
      )}

      {/* Topo do Produto: Foto + Informações e Preço */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          alignItems: 'start',
          marginBottom: 32,
        }}
      >
        {/* Foto do Produto */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 280,
          }}
        >
          {oferta.peca.fotoPecaUrl ? (
            <img
              src={oferta.peca.fotoPecaUrl}
              alt={oferta.peca.nome}
              style={{
                maxWidth: '100%',
                maxHeight: 320,
                objectFit: 'contain',
                borderRadius: 'var(--radius)',
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: 8 }}>⚙️</span>
              <span>Imagem não cadastrada pelo lojista</span>
            </div>
          )}
        </div>

        {/* Informações Principais & Compra/Contato */}
        <div className="card" style={{ padding: 24 }}>
          <div className="chips-row" style={{ marginBottom: 10 }}>
            <Chip>{oferta.peca.categoria}</Chip>
            {oferta.promocaoAtiva && <Chip variant="promo">🔥 Oferta em Promoção</Chip>}
            <Chip variant="muted">
              {oferta.quantidadeEstoque > 0
                ? `${oferta.quantidadeEstoque} em estoque`
                : 'Sob encomenda / Sem estoque'}
            </Chip>
          </div>

          <h1 style={{ fontSize: '1.6rem', marginBottom: 12 }}>{oferta.peca.nome}</h1>

          {/* Códigos */}
          <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16 }}>
            {oferta.peca.sku && <span>SKU: <strong>{oferta.peca.sku}</strong></span>}
            {oferta.peca.codigoEan && <span>EAN: <strong>{oferta.peca.codigoEan}</strong></span>}
          </div>

          {/* Preços */}
          <div style={{ margin: '16px 0', padding: '14px 16px', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatMoney(oferta.precoEfetivo)}
              </span>
              {oferta.promocaoAtiva && oferta.precoPromocional && (
                <span style={{ textDecoration: 'line-through', color: 'var(--muted)', fontSize: '1.1rem' }}>
                  {formatMoney(oferta.precoVenda)}
                </span>
              )}
            </div>
            {oferta.promocaoAtiva && oferta.dataFimPromocao && (
              <small style={{ color: 'var(--danger)', display: 'block', marginTop: 4 }}>
                Promoção válida até {new Date(oferta.dataFimPromocao).toLocaleDateString('pt-BR')}
              </small>
            )}
          </div>

          {/* Ações de Contato / Conversão */}
          <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
            <Button
              type="button"
              block
              onClick={handleContactClick}
              disabled={oferta.quantidadeEstoque <= 0}
            >
              💬 Falar com a Loja / Negociar Peça
            </Button>
            {clickedContact && (
              <p style={{ fontSize: '0.82rem', color: 'var(--primary)', textAlign: 'center', margin: 0 }}>
                ✓ Clique registrado! Abrindo contato com a loja...
              </p>
            )}
            <Link
              to={`/lojas/${oferta.loja.id}`}
              className="btn btn-outline"
              style={{ textAlign: 'center' }}
            >
              Ver perfil completo e outros itens da loja
            </Link>
          </div>
        </div>
      </div>

      {/* Seção de Abas/Grid de Detalhes: Descrição, Especificações, Compatibilidade e Loja */}
      <div className="grid" style={{ marginTop: 20 }}>
        {/* Card de Especificações e Descrição */}
        <Card title="Especificações Técnicas">
          {oferta.peca.descricao && (
            <p style={{ color: 'var(--text)', whiteSpace: 'pre-line', marginBottom: 16 }}>
              {oferta.peca.descricao}
            </p>
          )}

          {specsParsed && typeof specsParsed === 'object' ? (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem',
                marginTop: 8,
              }}
            >
              <tbody>
                {Object.entries(specsParsed).map(([chave, valor]) => (
                  <tr key={chave} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td
                      style={{
                        padding: '8px 4px',
                        fontFamily: 'var(--mono)',
                        fontSize: '0.8rem',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        width: '40%',
                      }}
                    >
                      {chave}
                    </td>
                    <td style={{ padding: '8px 4px', fontWeight: 600 }}>{String(valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : oferta.peca.especificacoes ? (
            <p style={{ color: 'var(--text)' }}>{oferta.peca.especificacoes}</p>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Nenhuma especificação técnica adicional cadastrada.
            </p>
          )}
        </Card>

        {/* Card de Compatibilidade de Motocicletas */}
        <Card title="Motos Compatíveis">
          <p style={{ fontSize: '0.85rem' }}>
            Esta peça é compatível com os seguintes modelos cadastrados no catálogo:
          </p>

          {oferta.compatibilidades.length === 0 ? (
            <EmptyState text="Compatibilidade universal ou ainda não mapeada para esta peça." />
          ) : (
            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              {oferta.compatibilidades.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.9rem',
                  }}
                >
                  <div>
                    <strong>{c.marca} {c.modelo}</strong>
                  </div>
                  <Chip variant="muted">
                    {c.anoInicio ? `${c.anoInicio} - ${c.anoFim ?? 'presente'}` : 'Todos os anos'}
                  </Chip>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Card da Loja Vendedora */}
      <div style={{ marginTop: 24 }}>
        <Card title="Sobre a Loja Vendedora">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>
                <Link
                  to={`/lojas/${oferta.loja.id}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {oferta.loja.nomeFantasia}
                </Link>
              </h2>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{oferta.loja.enderecoCompleto}</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
                <span className="rating">
                  ★ {oferta.loja.mediaAvaliacao.toFixed(1)} ({oferta.loja.totalAvaliacoes} avaliações)
                </span>
                {oferta.loja.telefoneContato && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    📞 {oferta.loja.telefoneContato}
                  </span>
                )}
                {oferta.distanciaKm != null && (
                  <Chip variant="muted">A {oferta.distanciaKm.toFixed(1)} km de você</Chip>
                )}
              </div>
            </div>

            <Link to={`/lojas/${oferta.loja.id}`} className="btn btn-outline">
              Acessar Perfil da Loja
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
