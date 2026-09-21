import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useActiveMoto } from '../context/useActiveMoto';
import type { GaragemItem, OfertaBuscaItem } from '../types';
import { Button, EmptyState, ErrorState, Loading, TrashIcon, EditIcon } from '../components/ui';

export function GaragemPage() {
  const { activeMoto, setActiveMoto } = useActiveMoto();
  const activeMotoRef = useRef(activeMoto);
  useEffect(() => {
    activeMotoRef.current = activeMoto;
  }, [activeMoto]);

  const [motos, setMotos] = useState<GaragemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Peças recomendadas
  const [recommendedCategory, setRecommendedCategory] = useState('Todas');
  const [recommendedParts, setRecommendedParts] = useState<OfertaBuscaItem[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [totalCountParts, setTotalCountParts] = useState(0);

  // Estados para edição rápida (modal / inline)
  const [editingMoto, setEditingMoto] = useState<GaragemItem | null>(null);
  const [editAno, setEditAno] = useState<number | ''>('');
  const [editApelido, setEditApelido] = useState('');
  const [editFotoUrl, setEditFotoUrl] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const categories = ['Todas', 'Filtros', 'Pastilhas de Freio', 'Óleo', 'Relação'];

  const carregarGaragem = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api<GaragemItem[]>('/garagem');
      setMotos(data ?? []);
      const currentActive = activeMotoRef.current;
      if (data && data.length > 0) {
        const belongsToUser = currentActive?.id && data.some((m) => m.id === currentActive.id);
        if (!currentActive || !belongsToUser) {
          const first = data[0];
          setActiveMoto({
            id: first.id,
            modeloMotoId: first.modeloMotoId,
            marca: first.marca,
            modelo: first.modelo,
            anoFabricacao: first.anoFabricacao,
            apelido: first.apelido,
            fotoMotoUrl: first.fotoMotoUrl,
          });
        }
      } else {
        if (currentActive) {
          setActiveMoto(null);
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar motos da garagem.');
    } finally {
      setLoading(false);
    }
  }, [setActiveMoto]);

  useEffect(() => {
    carregarGaragem();
  }, [carregarGaragem]);

  // Carregar peças recomendadas para a moto ativa
  useEffect(() => {
    if (!activeMoto) {
      setRecommendedParts([]);
      return;
    }

    const currentMoto = activeMoto;

    async function carregarRecomendadas() {
      setLoadingParts(true);
      try {
        const catQuery = recommendedCategory !== 'Todas' ? `&categoria=${encodeURIComponent(recommendedCategory)}` : '';
        const res = await api<{ ofertas: { items: OfertaBuscaItem[]; totalCount: number } }>(
          `/busca?modeloMotoId=${currentMoto.modeloMotoId}&anoFabricacao=${currentMoto.anoFabricacao}${catQuery}&pageSize=4`
        );
        if (res && res.ofertas) {
          setRecommendedParts(res.ofertas.items);
          setTotalCountParts(res.ofertas.totalCount);
        }
      } catch {
        setRecommendedParts([]);
        setTotalCountParts(0);
      } finally {
        setLoadingParts(false);
      }
    }

    carregarRecomendadas();
  }, [activeMoto, recommendedCategory]);

  function handleSelectActive(moto: GaragemItem) {
    setActiveMoto({
      id: moto.id,
      modeloMotoId: moto.modeloMotoId,
      marca: moto.marca,
      modelo: moto.modelo,
      anoFabricacao: moto.anoFabricacao,
      apelido: moto.apelido,
      fotoMotoUrl: moto.fotoMotoUrl,
    });
  }

  async function handleDeleteMoto(id: string) {
    if (!window.confirm('Tem certeza que deseja remover esta moto da sua garagem?')) return;
    try {
      await api(`/garagem/${id}`, { method: 'DELETE' });
      if (activeMotoRef.current?.id === id) {
        activeMotoRef.current = null;
        setActiveMoto(null);
      }
      await carregarGaragem();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao remover moto.');
    }
  }

  function startEditing(moto: GaragemItem) {
    setEditingMoto(moto);
    setEditAno(moto.anoFabricacao);
    setEditApelido(moto.apelido || '');
    setEditFotoUrl(moto.fotoMotoUrl || '');
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMoto) return;
    setSavingEdit(true);
    try {
      await api(`/garagem/${editingMoto.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          anoFabricacao: Number(editAno),
          apelido: editApelido.trim() || null,
          fotoMotoUrl: editFotoUrl.trim() || null,
        }),
      });
      setEditingMoto(null);
      await carregarGaragem();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao atualizar moto.');
    } finally {
      setSavingEdit(false);
    }
  }

  function formatMoney(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  return (
    <section>
      {/* Topo da página */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', marginBottom: 4 }}>Minha Garagem Virtual</h1>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Gerencie suas motocicletas para encontrar peças compatíveis mais rápido.
          </p>
        </div>
        <Link to="/garagem/adicionar" className="btn btn-garage-top" style={{ textTransform: 'none', fontSize: '0.9rem', padding: '10px 20px' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>+</span> Adicionar Nova Moto
        </Link>
      </div>

      {loading && <Loading text="Carregando sua garagem..." />}
      {error && <ErrorState text={error} onRetry={carregarGaragem} />}

      {!loading && !error && motos.length === 0 && (
        <EmptyState text="Sua garagem está vazia! Cadastre sua primeira moto clicando no botão acima para desbloquear compatibilidade instantânea." />
      )}

      {/* Grid Master-Detail 2 Colunas */}
      {!loading && !error && motos.length > 0 && (
        <div className="garage-grid">
          {/* COLUNA ESQUERDA: LISTA "MINHAS MOTOS" */}
          <div>
            <div style={{ borderBottom: '2px solid var(--border)', paddingBottom: 6, marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Minhas Motos</h2>
            </div>

            {motos.map((moto) => {
              const isActive = activeMoto?.id === moto.id;

              return (
                <div
                  key={moto.id}
                  className={`moto-card-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectActive(moto)}
                >
                  {/* Foto da Moto */}
                  <div className="moto-card-img-wrap">
                    {moto.fotoMotoUrl ? (
                      <img src={moto.fotoMotoUrl} alt={moto.modelo} />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                          background: '#f1f5f9',
                        }}
                      >
                        🏍️
                      </div>
                    )}

                    {/* Badge "Ativa" no topo direito */}
                    {isActive && (
                      <div className="badge-photo-topright">
                        <span className="badge-active-moto">Ativa</span>
                      </div>
                    )}
                  </div>

                  {/* Informações da moto */}
                  <div className="moto-card-content">
                    <h3 style={{ fontSize: '1.05rem', margin: '0 0 4px' }}>
                      {moto.marca} {moto.modelo}
                    </h3>
                    <p style={{ margin: '0 0 2px', fontSize: '0.85rem', color: '#475569' }}>
                      Ano: {moto.anoFabricacao}
                    </p>
                    {moto.apelido && (
                      <p style={{ margin: '0 0 10px', fontSize: '0.85rem', fontStyle: 'italic', color: '#64748b' }}>
                        Apelido: "{moto.apelido}"
                      </p>
                    )}

                    {/* Divisor e Ações Editar / Excluir */}
                    <div
                      style={{
                        borderTop: '1px solid var(--border)',
                        paddingTop: 10,
                        marginTop: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(moto);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#006375',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <EditIcon size={14} /> Editar
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMoto(moto.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                        title="Remover motocicleta"
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* COLUNA DIREITA: PEÇAS RECOMENDADAS */}
          <div className="recommended-parts-panel">
            {activeMoto ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.2rem' }}>🔧</span>
                    <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                      Peças Recomendadas para {activeMoto.marca} {activeMoto.modelo}
                    </h2>
                  </div>
                  <span
                    style={{
                      background: '#ddf0f5',
                      color: '#006375',
                      fontFamily: 'var(--mono)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                    }}
                  >
                    Compatibilidade Verificada
                  </span>
                </div>

                {/* Filtros em Pílulas */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20 }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setRecommendedCategory(cat)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        fontFamily: 'var(--mono)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: recommendedCategory === cat ? '#006375' : '#f1f5f9',
                        color: recommendedCategory === cat ? '#ffffff' : '#475569',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {loadingParts && <Loading text="Buscando recomendações para sua moto..." />}

                {/* Grade 2x2 de Peças */}
                {!loadingParts && (
                  <div className="recommended-grid">
                    {recommendedParts.map((item) => (
                      <Link
                        key={item.estoqueId}
                        to={`/ofertas/${item.estoqueId}`}
                        className="recommended-card"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {item.fotoPecaUrl ? (
                          <img src={item.fotoPecaUrl} alt={item.nomePeca} />
                        ) : (
                          <div
                            style={{
                              width: 80,
                              height: 80,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#f1f5f9',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '1.8rem',
                            }}
                          >
                            📦
                          </div>
                        )}

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ fontSize: '0.92rem', margin: '0 0 2px', lineHeight: 1.3 }}>
                              {item.nomePeca}
                            </h4>
                            <small style={{ color: '#64748b' }}>{item.categoria}</small>
                          </div>

                          <div style={{ marginTop: 8 }}>
                            {item.precoPromocional && (
                              <div style={{ fontSize: '0.78rem', textDecoration: 'line-through', color: '#94a3b8' }}>
                                {formatMoney(item.precoVenda)}
                              </div>
                            )}
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#006375' }}>
                              {formatMoney(item.precoEfetivo)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Link final para ver todas */}
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <Link
                    to={`/busca?modeloMotoId=${activeMoto.modeloMotoId}&anoFabricacao=${activeMoto.anoFabricacao}`}
                    style={{
                      color: '#006375',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      textDecoration: 'none',
                    }}
                  >
                    Ver todas as peças compatíveis ({totalCountParts})
                  </Link>
                </div>
              </>
            ) : (
              <EmptyState text="Selecione ou adicione uma moto na coluna ao lado para visualizar peças compatíveis." />
            )}
          </div>
        </div>
      )}

      {/* Modal de Edição Rápida */}
      {editingMoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: 16,
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 440 }}>
            <h3>Editar Moto: {editingMoto.marca} {editingMoto.modelo}</h3>
            <form onSubmit={handleSaveEdit} className="form" style={{ marginTop: 14 }}>
              <div>
                <label className="field-label-mono">Ano de Fabricação</label>
                <input
                  type="number"
                  className="input"
                  value={editAno}
                  onChange={(e) => setEditAno(e.target.value ? Number(e.target.value) : '')}
                  required
                />
              </div>
              <div>
                <label className="field-label-mono">Apelido (Opcional)</label>
                <input
                  type="text"
                  className="input"
                  value={editApelido}
                  onChange={(e) => setEditApelido(e.target.value)}
                  placeholder="Ex: Azulona"
                />
              </div>
              <div>
                <label className="field-label-mono">URL da Foto (Opcional)</label>
                <input
                  type="url"
                  className="input"
                  value={editFotoUrl}
                  onChange={(e) => setEditFotoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <Button type="button" variant="ghost" onClick={() => setEditingMoto(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingEdit}>
                  {savingEdit ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
