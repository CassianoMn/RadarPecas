import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useActiveMoto } from '../context/useActiveMoto';
import type { GaragemItem, ModeloMoto } from '../types';
import { Button, Card, EmptyState, ErrorState, Field, Loading, TextInput } from '../components/ui';

export function GaragemPage() {
  const navigate = useNavigate();
  const { activeMoto, setActiveMoto } = useActiveMoto();

  const [motos, setMotos] = useState<GaragemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para Adicionar Moto
  const [showAddForm, setShowAddForm] = useState(false);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [modelos, setModelos] = useState<ModeloMoto[]>([]);
  const [selectedModeloId, setSelectedModeloId] = useState<number | ''>('');
  const [anoFabricacao, setAnoFabricacao] = useState<number | ''>('');
  const [apelido, setApelido] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Estados para Edição
  const [editingMoto, setEditingMoto] = useState<GaragemItem | null>(null);
  const [editAno, setEditAno] = useState<number | ''>('');
  const [editApelido, setEditApelido] = useState('');
  const [editFotoUrl, setEditFotoUrl] = useState('');
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const carregarGaragem = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api<GaragemItem[]>('/garagem');
      setMotos(data ?? []);
      // Se não há moto ativa e tem motos na garagem, define a primeira como ativa por padrão
      if (!activeMoto && data && data.length > 0) {
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
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar garagem.');
    } finally {
      setLoading(false);
    }
  }, [activeMoto, setActiveMoto]);

  useEffect(() => {
    carregarGaragem();
  }, [carregarGaragem]);

  // Carregar marcas quando abrir o formulário
  useEffect(() => {
    if (showAddForm && marcas.length === 0) {
      api<string[]>('/modelos-moto/marcas')
        .then((res) => setMarcas(res ?? []))
        .catch(() => setFormError('Erro ao carregar marcas de motocicletas.'));
    }
  }, [showAddForm, marcas.length]);

  // Carregar modelos quando a marca mudar
  useEffect(() => {
    if (!selectedMarca) {
      setModelos([]);
      setSelectedModeloId('');
      return;
    }
    api<ModeloMoto[]>(`/modelos-moto?marca=${encodeURIComponent(selectedMarca)}`)
      .then((res) => {
        setModelos(res ?? []);
        setSelectedModeloId('');
      })
      .catch(() => setFormError('Erro ao carregar modelos da marca.'));
  }, [selectedMarca]);

  const selectedModeloObj = modelos.find((m) => m.id === selectedModeloId);

  async function handleAddMoto(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!selectedModeloId) {
      setFormError('Selecione o modelo da motocicleta.');
      return;
    }

    const ano = Number(anoFabricacao);
    if (!ano || isNaN(ano) || ano < 1950 || ano > new Date().getFullYear() + 1) {
      setFormError('Informe um ano de fabricação válido.');
      return;
    }

    if (selectedModeloObj) {
      if (selectedModeloObj.anoInicio && ano < selectedModeloObj.anoInicio) {
        setFormError(`O ano informado é menor que o ano de início do modelo (${selectedModeloObj.anoInicio}).`);
        return;
      }
      if (selectedModeloObj.anoFim && ano > selectedModeloObj.anoFim) {
        setFormError(`O ano informado é maior que o ano final do modelo (${selectedModeloObj.anoFim}).`);
        return;
      }
    }

    setSaving(true);
    try {
      const novaMoto = await api<GaragemItem>('/garagem', {
        method: 'POST',
        body: JSON.stringify({
          modeloMotoId: selectedModeloId,
          anoFabricacao: ano,
          apelido: apelido.trim() || null,
          fotoMotoUrl: fotoUrl.trim() || null,
        }),
      });

      // Define como moto ativa
      setActiveMoto({
        id: novaMoto.id,
        modeloMotoId: novaMoto.modeloMotoId,
        marca: novaMoto.marca,
        modelo: novaMoto.modelo,
        anoFabricacao: novaMoto.anoFabricacao,
        apelido: novaMoto.apelido,
        fotoMotoUrl: novaMoto.fotoMotoUrl,
      });

      // Reset form
      setShowAddForm(false);
      setSelectedMarca('');
      setSelectedModeloId('');
      setAnoFabricacao('');
      setApelido('');
      setFotoUrl('');

      await carregarGaragem();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Erro ao cadastrar moto.');
    } finally {
      setSaving(false);
    }
  }

  function startEditing(moto: GaragemItem) {
    setEditingMoto(moto);
    setEditAno(moto.anoFabricacao);
    setEditApelido(moto.apelido || '');
    setEditFotoUrl(moto.fotoMotoUrl || '');
    setEditError('');
  }

  async function handleUpdateMoto(e: FormEvent) {
    e.preventDefault();
    if (!editingMoto) return;
    setEditError('');

    const ano = Number(editAno);
    if (!ano || isNaN(ano) || ano < 1950 || ano > new Date().getFullYear() + 1) {
      setEditError('Informe um ano de fabricação válido.');
      return;
    }

    setSavingEdit(true);
    try {
      const atualizada = await api<GaragemItem>(`/garagem/${editingMoto.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          anoFabricacao: ano,
          apelido: editApelido.trim() || null,
          fotoMotoUrl: editFotoUrl.trim() || null,
        }),
      });

      if (activeMoto?.id === editingMoto.id) {
        setActiveMoto({
          id: atualizada.id,
          modeloMotoId: atualizada.modeloMotoId,
          marca: atualizada.marca,
          modelo: atualizada.modelo,
          anoFabricacao: atualizada.anoFabricacao,
          apelido: atualizada.apelido,
          fotoMotoUrl: atualizada.fotoMotoUrl,
        });
      }

      setEditingMoto(null);
      await carregarGaragem();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Erro ao atualizar moto.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteMoto(id: string) {
    if (!window.confirm('Tem certeza que deseja remover esta moto da sua garagem?')) {
      return;
    }

    try {
      await api(`/garagem/${id}`, { method: 'DELETE' });
      if (activeMoto?.id === id) {
        setActiveMoto(null);
      }
      await carregarGaragem();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao remover moto.');
    }
  }

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

  function handleBuscarPecas(moto: GaragemItem) {
    handleSelectActive(moto);
    navigate(`/busca?modeloMotoId=${moto.modeloMotoId}&anoFabricacao=${moto.anoFabricacao}`);
  }

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Minha Garagem Virtual</h1>
          <p>Cadastre suas motos para filtrar ofertas de peças compatíveis com 1 clique.</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setShowAddForm((v) => !v);
            setEditingMoto(null);
          }}
        >
          {showAddForm ? '✕ Fechar Formulário' : '+ Adicionar Moto'}
        </Button>
      </div>

      {/* Formulário de Adicionar Moto */}
      {showAddForm && (
        <div className="card" style={{ margin: '20px 0', border: '2px solid var(--primary)' }}>
          <h3>Cadastrar Nova Motocicleta</h3>
          <p>Selecione a marca e modelo para compatibilidade precisa com nosso catálogo.</p>

          <form onSubmit={handleAddMoto} className="form" style={{ marginTop: 12 }}>
            <div className="grid" style={{ marginTop: 0 }}>
              <Field label="Marca">
                <select
                  className="input"
                  value={selectedMarca}
                  onChange={(e) => setSelectedMarca(e.target.value)}
                  required
                >
                  <option value="">Selecione a Marca...</option>
                  {marcas.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Modelo">
                <select
                  className="input"
                  value={selectedModeloId}
                  onChange={(e) => setSelectedModeloId(e.target.value ? Number(e.target.value) : '')}
                  disabled={!selectedMarca || modelos.length === 0}
                  required
                >
                  <option value="">
                    {!selectedMarca ? 'Selecione uma marca antes' : 'Selecione o Modelo...'}
                  </option>
                  {modelos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nomeExibicao}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid" style={{ marginTop: 0 }}>
              <Field
                label={
                  selectedModeloObj && selectedModeloObj.anoInicio
                    ? `Ano Fabricação (${selectedModeloObj.anoInicio} - ${selectedModeloObj.anoFim ?? 'atual'})`
                    : 'Ano Fabricação'
                }
              >
                <TextInput
                  type="number"
                  placeholder="Ex: 2022"
                  value={anoFabricacao}
                  onChange={(e) => setAnoFabricacao(e.target.value ? Number(e.target.value) : '')}
                  min={selectedModeloObj?.anoInicio ?? 1950}
                  max={selectedModeloObj?.anoFim ?? new Date().getFullYear() + 1}
                  required
                />
              </Field>

              <Field label="Apelido da Moto (Opcional)">
                <TextInput
                  type="text"
                  placeholder="Ex: Minha Fazer, Foguete"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                />
              </Field>
            </div>

            <Field label="URL da Foto (Opcional)">
              <TextInput
                type="url"
                placeholder="https://exemplo.com/minha-moto.jpg"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
              />
            </Field>

            {formError ? <ErrorState text={formError} /> : null}

            <div className="actions">
              <Button type="submit" disabled={saving}>
                {saving ? 'Cadastrando...' : 'Salvar na Garagem'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Formulário Modal de Edição */}
      {editingMoto && (
        <div className="card" style={{ margin: '20px 0', border: '2px solid var(--star)' }}>
          <h3>
            Editar Motocicleta: {editingMoto.marca} {editingMoto.modelo}
          </h3>
          <form onSubmit={handleUpdateMoto} className="form" style={{ marginTop: 12 }}>
            <div className="grid" style={{ marginTop: 0 }}>
              <Field label="Ano de Fabricação">
                <TextInput
                  type="number"
                  value={editAno}
                  onChange={(e) => setEditAno(e.target.value ? Number(e.target.value) : '')}
                  required
                />
              </Field>
              <Field label="Apelido">
                <TextInput
                  type="text"
                  value={editApelido}
                  onChange={(e) => setEditApelido(e.target.value)}
                  placeholder="Ex: Minha Fazer"
                />
              </Field>
            </div>
            <Field label="URL da Foto">
              <TextInput
                type="url"
                value={editFotoUrl}
                onChange={(e) => setEditFotoUrl(e.target.value)}
                placeholder="https://..."
              />
            </Field>
            {editError ? <ErrorState text={editError} /> : null}
            <div className="actions">
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditingMoto(null)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading && <Loading text="Carregando suas motos..." />}
      {error && <ErrorState text={error} onRetry={carregarGaragem} />}

      {!loading && !error && motos.length === 0 && (
        <EmptyState text="Sua garagem está vazia! Cadastre sua moto acima para obter recomendações com 100% de compatibilidade." />
      )}

      {!loading && !error && motos.length > 0 && (
        <div className="grid" style={{ marginTop: 20 }}>
          {motos.map((moto) => {
            const isActive = activeMoto?.id === moto.id;
            return (
              <Card
                key={moto.id}
                title={moto.apelido ? `${moto.apelido} (${moto.modelo})` : `${moto.marca} ${moto.modelo}`}
                footer={
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%' }}>
                    <Button
                      type="button"
                      variant={isActive ? 'primary' : 'outline'}
                      onClick={() => handleSelectActive(moto)}
                    >
                      {isActive ? '✓ Moto Ativa' : 'Definir como Ativa'}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => handleBuscarPecas(moto)}
                    >
                      Buscar Peças
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => startEditing(moto)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      style={{ color: 'var(--danger)', marginLeft: 'auto' }}
                      onClick={() => handleDeleteMoto(moto.id)}
                    >
                      Remover
                    </Button>
                  </div>
                }
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {moto.fotoMotoUrl ? (
                    <img
                      src={moto.fotoMotoUrl}
                      alt={moto.modelo}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 'var(--radius)',
                        background: 'var(--chip-bg)',
                        color: 'var(--chip-text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                      }}
                    >
                      🏍️
                    </div>
                  )}

                  <div>
                    <div className="chips-row" style={{ marginBottom: 6 }}>
                      <span className="chip">{moto.marca}</span>
                      <span className="chip chip-muted">Ano {moto.anoFabricacao}</span>
                      {isActive && <span className="chip" style={{ background: 'var(--star)', color: '#fff' }}>Ativa</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      Modelo: <strong>{moto.modelo}</strong>
                    </p>
                    {moto.anoInicio && (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
                        Série: {moto.anoInicio} - {moto.anoFim ?? 'presente'}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
