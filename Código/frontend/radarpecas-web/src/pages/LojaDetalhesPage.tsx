import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import type { AvaliacoesResumo, EstoqueItem, Loja, PagedResult } from '../types';
import { Button, Card, Chip, EmptyState, ErrorState, Field, Loading } from '../components/ui';

export function LojaDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [loja, setLoja] = useState<Loja | null>(null);
  const [loadingLoja, setLoadingLoja] = useState(true);
  const [errorLoja, setErrorLoja] = useState('');

  // Aba ativa: 'estoque' ou 'avaliacoes'
  const [tab, setTab] = useState<'estoque' | 'avaliacoes'>('estoque');

  // Estados do Estoque
  const [estoque, setEstoque] = useState<PagedResult<EstoqueItem> | null>(null);
  const [loadingEstoque, setLoadingEstoque] = useState(false);
  const [buscaEstoque, setBuscaEstoque] = useState('');
  const [apenasPromocao, setApenasPromocao] = useState(false);
  const [pageEstoque, setPageEstoque] = useState(1);

  // Estados de Avaliações
  const [avaliacoesResumo, setAvaliacoesResumo] = useState<AvaliacoesResumo | null>(null);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);

  // Formulário de Nova Avaliação
  const [showAvaliarForm, setShowAvaliarForm] = useState(false);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [recomenda, setRecomenda] = useState(true);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [erroAvaliacao, setErroAvaliacao] = useState('');
  const [sucessoAvaliacao, setSucessoAvaliacao] = useState(false);

  // Carregar dados da loja
  useEffect(() => {
    if (!id) return;
    setLoadingLoja(true);
    setErrorLoja('');

    api<Loja>(`/lojas/${id}`)
      .then((data) => setLoja(data))
      .catch((err) => setErrorLoja(err instanceof ApiError ? err.message : 'Erro ao carregar loja.'))
      .finally(() => setLoadingLoja(false));
  }, [id]);

  // Carregar estoque quando a aba 'estoque' estiver ativa ou filtros mudarem
  useEffect(() => {
    if (!id || tab !== 'estoque') return;
    setLoadingEstoque(true);

    const params = new URLSearchParams();
    if (buscaEstoque.trim()) params.set('busca', buscaEstoque.trim());
    if (apenasPromocao) params.set('apenasPromocao', 'true');
    params.set('page', pageEstoque.toString());
    params.set('pageSize', '10');

    api<PagedResult<EstoqueItem>>(`/lojas/${id}/estoque?${params.toString()}`)
      .then((data) => setEstoque(data))
      .catch(() => {})
      .finally(() => setLoadingEstoque(false));
  }, [id, tab, buscaEstoque, apenasPromocao, pageEstoque]);

  // Carregar avaliações quando a aba 'avaliacoes' estiver ativa
  const carregarAvaliacoes = useCallback(async () => {
    if (!id) return;
    setLoadingAvaliacoes(true);
    try {
      const data = await api<AvaliacoesResumo>(`/lojas/${id}/avaliacoes`);
      setAvaliacoesResumo(data);
    } catch {
      // Ignora erro
    } finally {
      setLoadingAvaliacoes(false);
    }
  }, [id]);

  useEffect(() => {
    if (tab === 'avaliacoes') {
      carregarAvaliacoes();
    }
  }, [tab, carregarAvaliacoes]);

  async function handleEnviarAvaliacao(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setErroAvaliacao('');
    setEnviandoAvaliacao(true);
    try {
      await api(`/lojas/${id}/avaliacoes`, {
        method: 'POST',
        body: JSON.stringify({
          nota,
          comentario: comentario.trim() || null,
          recomenda,
        }),
      });
      setSucessoAvaliacao(true);
      setShowAvaliarForm(false);
      setComentario('');
      await carregarAvaliacoes();
    } catch (err) {
      setErroAvaliacao(err instanceof ApiError ? err.message : 'Erro ao enviar avaliação.');
    } finally {
      setEnviandoAvaliacao(false);
    }
  }

  function formatMoney(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  if (loadingLoja) {
    return (
      <section>
        <Loading text="Carregando perfil da loja..." />
      </section>
    );
  }

  if (errorLoja || !loja) {
    return (
      <section>
        <ErrorState text={errorLoja || 'Loja não encontrada.'} />
        <Link to="/lojas" className="btn btn-outline" style={{ marginTop: 16 }}>
          ← Voltar para lojas
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
        / <Link to="/lojas" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Lojas</Link>{' '}
        / <span style={{ color: 'var(--text)' }}>{loja.nomeFantasia}</span>
      </nav>

      {/* Cabeçalho do Perfil da Loja */}
      <div
        className="card"
        style={{
          padding: 24,
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {loja.fotoPerfilUrl ? (
            <img
              src={loja.fotoPerfilUrl}
              alt={loja.nomeFantasia}
              style={{
                width: 90,
                height: 90,
                borderRadius: 'var(--radius)',
                objectFit: 'cover',
                border: '1px solid var(--border)',
              }}
            />
          ) : (
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 'var(--radius)',
                background: 'var(--chip-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
              }}
            >
              🏪
            </div>
          )}

          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: 4 }}>{loja.nomeFantasia}</h1>
            <p style={{ margin: '0 0 8px', fontSize: '0.95rem' }}>📍 {loja.enderecoCompleto}</p>

            <div className="chips-row" style={{ alignItems: 'center' }}>
              <span className="rating" style={{ fontSize: '1.05rem' }}>
                ★ {loja.mediaAvaliacao.toFixed(1)}{' '}
                <span className="store-line">({loja.totalAvaliacoes} avaliações)</span>
              </span>
              {loja.distanciaKm != null && (
                <Chip variant="muted">{loja.distanciaKm.toFixed(1)} km de distância</Chip>
              )}
              {loja.cnpj && <Chip variant="muted">CNPJ: {loja.cnpj}</Chip>}
            </div>
          </div>
        </div>

        {/* Informações de contato e horários */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            background: 'var(--bg)',
            padding: 14,
            borderRadius: 'var(--radius)',
            fontSize: '0.88rem',
          }}
        >
          {loja.telefoneContato && (
            <div>
              <span style={{ color: 'var(--muted)', display: 'block' }}>Telefone / WhatsApp</span>
              <strong>{loja.telefoneContato}</strong>
            </div>
          )}
          {loja.emailContato && (
            <div>
              <span style={{ color: 'var(--muted)', display: 'block' }}>E-mail</span>
              <strong>{loja.emailContato}</strong>
            </div>
          )}
          {loja.horariosFuncionamento && (
            <div>
              <span style={{ color: 'var(--muted)', display: 'block' }}>Horário de Funcionamento</span>
              <strong>{loja.horariosFuncionamento}</strong>
            </div>
          )}
        </div>

        {/* Galeria de Fotos */}
        {loja.galeriaFotosUrls && loja.galeriaFotosUrls.length > 0 && (
          <div>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Galeria da Loja
            </span>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginTop: 8, paddingBottom: 6 }}>
              {loja.galeriaFotosUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Loja foto ${idx + 1}`}
                  style={{
                    height: 90,
                    width: 140,
                    objectFit: 'cover',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Abas: Estoque da Loja & Avaliações */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid var(--border)', marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setTab('estoque')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: tab === 'estoque' ? '3px solid var(--primary)' : '3px solid transparent',
            padding: '10px 18px',
            fontFamily: 'var(--mono)',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: tab === 'estoque' ? 'var(--primary)' : 'var(--muted)',
            cursor: 'pointer',
          }}
        >
          Estoque da Loja {estoque ? `(${estoque.totalCount})` : ''}
        </button>

        <button
          type="button"
          onClick={() => setTab('avaliacoes')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: tab === 'avaliacoes' ? '3px solid var(--primary)' : '3px solid transparent',
            padding: '10px 18px',
            fontFamily: 'var(--mono)',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: tab === 'avaliacoes' ? 'var(--primary)' : 'var(--muted)',
            cursor: 'pointer',
          }}
        >
          Avaliações ({loja.totalAvaliacoes})
        </button>
      </div>

      {/* Conteúdo da Aba de Estoque */}
      {tab === 'estoque' && (
        <div>
          {/* Filtros dentro do estoque */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <input
              type="search"
              className="input"
              style={{ maxWidth: 360 }}
              placeholder="Buscar no estoque desta loja..."
              value={buscaEstoque}
              onChange={(e) => {
                setBuscaEstoque(e.target.value);
                setPageEstoque(1);
              }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={apenasPromocao}
                onChange={(e) => {
                  setApenasPromocao(e.target.checked);
                  setPageEstoque(1);
                }}
              />
              🔥 Apenas promoções
            </label>
          </div>

          {loadingEstoque && <Loading text="Carregando estoque..." />}

          {!loadingEstoque && estoque && estoque.items.length === 0 && (
            <EmptyState text="Nenhum item encontrado no estoque desta loja." />
          )}

          {!loadingEstoque && estoque && estoque.items.length > 0 && (
            <div className="grid">
              {estoque.items.map((item) => (
                <Card
                  key={item.id}
                  title={item.nomePeca}
                  footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Link className="btn btn-outline" to={`/ofertas/${item.id}`}>
                        Ver Oferta
                      </Link>
                      <span style={{ fontSize: '0.85rem', color: item.quantidadeEstoque > 0 ? 'var(--primary)' : 'var(--danger)' }}>
                        {item.quantidadeEstoque > 0 ? `${item.quantidadeEstoque} un em estoque` : 'Sem estoque'}
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
                          width: 70,
                          height: 70,
                          objectFit: 'cover',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: 'var(--radius)',
                          background: 'var(--chip-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          flexShrink: 0,
                        }}
                      >
                        ⚙️
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <div className="chips-row" style={{ marginBottom: 4 }}>
                        <Chip variant="muted">{item.categoria}</Chip>
                        {item.promocaoAtiva && <Chip variant="promo">Promoção</Chip>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '4px 0' }}>
                        <span className="price">{formatMoney(item.precoEfetivo)}</span>
                        {item.promocaoAtiva && item.precoPromocional && (
                          <span style={{ textDecoration: 'line-through', color: 'var(--muted)', fontSize: '0.85rem' }}>
                            {formatMoney(item.precoVenda)}
                          </span>
                        )}
                      </div>

                      {item.sku && (
                        <small style={{ color: 'var(--muted)' }}>SKU: {item.sku}</small>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Paginação do Estoque */}
          {!loadingEstoque && estoque && estoque.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <Button
                type="button"
                variant="outline"
                disabled={!estoque.hasPreviousPage}
                onClick={() => setPageEstoque((p) => Math.max(1, p - 1))}
              >
                ← Anterior
              </Button>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                Página {estoque.page} de {estoque.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!estoque.hasNextPage}
                onClick={() => setPageEstoque((p) => p + 1)}
              >
                Próxima →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo da Aba de Avaliações */}
      {tab === 'avaliacoes' && (
        <div>
          {loadingAvaliacoes && <Loading text="Carregando avaliações da loja..." />}

          {!loadingAvaliacoes && (
            <>
              {/* Resumo Estatístico das Avaliações */}
              <div
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  textAlign: 'center',
                  padding: 20,
                  marginBottom: 20,
                }}
              >
                <div>
                  <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--star)', display: 'block' }}>
                    ★ {avaliacoesResumo ? avaliacoesResumo.mediaNotas.toFixed(1) : loja.mediaAvaliacao.toFixed(1)}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Média Geral ({avaliacoesResumo?.totalAvaliacoes ?? loja.totalAvaliacoes} avaliações)
                  </span>
                </div>

                <div style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', padding: '0 24px' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', display: 'block' }}>
                    {avaliacoesResumo ? `${Math.round(avaliacoesResumo.percentualRecomendacao)}%` : '100%'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Recomendam esta loja
                  </span>
                </div>

                <div>
                  {user ? (
                    <Button
                      type="button"
                      onClick={() => setShowAvaliarForm((v) => !v)}
                    >
                      {showAvaliarForm ? 'Cancelar' : '✍️ Avaliar esta Loja'}
                    </Button>
                  ) : (
                    <Link to="/login" className="btn btn-outline">
                      Entre para Avaliar
                    </Link>
                  )}
                </div>
              </div>

              {/* Mensagem de sucesso de avaliação */}
              {sucessoAvaliacao && (
                <div style={{ padding: '12px 16px', background: '#e6f7ed', border: '1px solid #34d399', borderRadius: 'var(--radius)', color: '#065f46', marginBottom: 16 }}>
                  ✓ Sua avaliação foi registrada com sucesso! Obrigado por colaborar com a comunidade.
                </div>
              )}

              {/* Formulário de Avaliação */}
              {showAvaliarForm && (
                <div className="card" style={{ marginBottom: 20, border: '2px solid var(--primary)' }}>
                  <h3>Avaliar {loja.nomeFantasia}</h3>
                  <p>Conte sua experiência com o atendimento, agilidade e peças desta loja.</p>

                  <form onSubmit={handleEnviarAvaliacao} className="form" style={{ marginTop: 12 }}>
                    <Field label="Nota (de 1 a 5 estrelas)">
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setNota(starVal)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '2rem',
                              color: starVal <= nota ? 'var(--star)' : '#cbd5e1',
                              cursor: 'pointer',
                              padding: '2px 6px',
                            }}
                            title={`${starVal} estrelas`}
                          >
                            ★
                          </button>
                        ))}
                        <span style={{ fontWeight: 700, marginLeft: 8 }}>
                          {nota} de 5 estrelas
                        </span>
                      </div>
                    </Field>

                    <Field label="Seu comentário (opcional)">
                      <textarea
                        className="input"
                        rows={3}
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Descreva o atendimento, qualidade da peça, pontualidade..."
                      />
                    </Field>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={recomenda}
                        onChange={(e) => setRecomenda(e.target.checked)}
                      />
                      Eu recomendo esta loja para outros motociclistas
                    </label>

                    {erroAvaliacao && <ErrorState text={erroAvaliacao} />}

                    <div className="actions">
                      <Button type="submit" disabled={enviandoAvaliacao}>
                        {enviandoAvaliacao ? 'Enviando...' : 'Publicar Avaliação'}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setShowAvaliarForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Lista de Avaliações */}
              {avaliacoesResumo && avaliacoesResumo.avaliacoes.length === 0 ? (
                <EmptyState text="Nenhuma avaliação para esta loja ainda. Seja o primeiro a avaliar!" />
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {avaliacoesResumo?.avaliacoes.map((av) => (
                    <div
                      key={av.id}
                      className="card"
                      style={{ padding: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div>
                          <strong>{av.nomeUsuario}</strong>
                          <span style={{ marginLeft: 10, color: 'var(--star)', fontWeight: 700 }}>
                            {'★'.repeat(av.nota)}{'☆'.repeat(5 - av.nota)}
                          </span>
                        </div>
                        <small style={{ color: 'var(--muted)' }}>
                          {new Date(av.dataAvaliacao).toLocaleDateString('pt-BR')}
                        </small>
                      </div>

                      {av.comentario && (
                        <p style={{ margin: '6px 0', color: 'var(--text)', fontSize: '0.92rem' }}>
                          "{av.comentario}"
                        </p>
                      )}

                      <div style={{ marginTop: 6, fontSize: '0.8rem', color: av.recomenda ? 'var(--primary)' : 'var(--muted)' }}>
                        {av.recomenda ? '✓ Recomenda esta loja' : '✕ Não recomenda esta loja'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
