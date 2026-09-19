import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useActiveMoto } from '../context/useActiveMoto';
import type { GaragemItem, ModeloMoto } from '../types';
import { Button, CameraPlusIcon, ErrorState } from '../components/ui';

export function AdicionarMotoPage() {
  const navigate = useNavigate();
  const { setActiveMoto } = useActiveMoto();

  const [marcas, setMarcas] = useState<string[]>([]);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [modelos, setModelos] = useState<ModeloMoto[]>([]);
  const [selectedModeloId, setSelectedModeloId] = useState<number | ''>('');
  const [anoFabricacao, setAnoFabricacao] = useState<number | ''>('');
  const [apelido, setApelido] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Carregar marcas ao montar
  useEffect(() => {
    api<string[]>('/modelos-moto/marcas')
      .then((res) => {
        if (res && res.length > 0) setMarcas(res);
        else setMarcas(['Honda', 'Yamaha', 'Kawasaki', 'BMW', 'Suzuki', 'Triumph', 'Ducati']);
      })
      .catch(() => {
        setMarcas(['Honda', 'Yamaha', 'Kawasaki', 'BMW', 'Suzuki', 'Triumph', 'Ducati']);
      });
  }, []);

  // Carregar modelos ao selecionar a marca
  useEffect(() => {
    if (!selectedMarca) {
      setModelos([]);
      setSelectedModeloId('');
      return;
    }
    api<ModeloMoto[]>(`/modelos-moto?marca=${encodeURIComponent(selectedMarca)}`)
      .then((res) => {
        if (res && res.length > 0) {
          setModelos(res);
        } else {
          // Modelos padrão populares para caso a base esteja inicializando
          if (selectedMarca === 'Honda') {
            setModelos([
              { id: 101, marca: 'Honda', modelo: 'CB 500F', anoInicio: 2014, anoFim: 2024, nomeExibicao: 'CB 500F' },
              { id: 102, marca: 'Honda', modelo: 'CG 160 Titan', anoInicio: 2016, anoFim: 2024, nomeExibicao: 'CG 160 Titan' },
              { id: 103, marca: 'Honda', modelo: 'XRE 300', anoInicio: 2010, anoFim: 2023, nomeExibicao: 'XRE 300' },
            ]);
          } else if (selectedMarca === 'Yamaha') {
            setModelos([
              { id: 201, marca: 'Yamaha', modelo: 'Tenere 250', anoInicio: 2011, anoFim: 2019, nomeExibicao: 'Tenere 250' },
              { id: 202, marca: 'Yamaha', modelo: 'Fazer FZ25', anoInicio: 2018, anoFim: 2024, nomeExibicao: 'Fazer FZ25' },
              { id: 203, marca: 'Yamaha', modelo: 'MT-07', anoInicio: 2015, anoFim: 2024, nomeExibicao: 'MT-07' },
            ]);
          } else {
            setModelos([]);
          }
        }
        setSelectedModeloId('');
      })
      .catch(() => {
        setModelos([]);
      });
  }, [selectedMarca]);

  const selectedModeloObj = modelos.find((m) => m.id === selectedModeloId);

  // Lista de anos calculada com base no modelo selecionado ou últimos 30 anos
  const currentYear = new Date().getFullYear();
  const minYear = selectedModeloObj?.anoInicio ?? 1995;
  const maxYear = selectedModeloObj?.anoFim ?? currentYear + 1;
  const anosDisponiveis = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFotoUrl(objectUrl);
    }
  }

  async function handleAddMoto(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!selectedModeloId) {
      setFormError('Selecione o modelo da motocicleta.');
      return;
    }

    const ano = Number(anoFabricacao);
    if (!ano || isNaN(ano)) {
      setFormError('Selecione o ano de fabricação.');
      return;
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

      // Ativa a nova moto na garagem
      setActiveMoto({
        id: novaMoto.id,
        modeloMotoId: novaMoto.modeloMotoId,
        marca: novaMoto.marca,
        modelo: novaMoto.modelo,
        anoFabricacao: novaMoto.anoFabricacao,
        apelido: novaMoto.apelido,
        fotoMotoUrl: novaMoto.fotoMotoUrl,
      });

      navigate('/garagem');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Erro ao cadastrar moto na garagem.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      {/* Breadcrumb */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: '#64748b', marginBottom: 12 }}>
        <Link to="/garagem" style={{ color: '#64748b', textDecoration: 'none' }}>
          Minha Garagem Virtual
        </Link>{' '}
        / <span style={{ color: '#0f172a', fontWeight: 700 }}>Adicionar Nova Moto</span>
      </div>

      {/* Título & Subtítulo */}
      <h1 style={{ fontSize: '1.9rem', marginBottom: 4 }}>Adicionar Nova Moto</h1>
      <p style={{ fontSize: '0.95rem', marginBottom: 24 }}>
        Preencha os dados para cadastrar seu veículo e encontrar peças compatíveis mais rápido.
      </p>

      {/* Card do Formulário em Duas Colunas */}
      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={handleAddMoto}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(240px, 320px) 1fr',
              gap: 28,
              alignItems: 'start',
            }}
          >
            {/* Coluna Esquerda: Foto da Moto Dropzone */}
            <div>
              <label className="field-label-mono" style={{ display: 'block', marginBottom: 8 }}>
                Foto da Moto
              </label>

              {previewUrl ? (
                <div className="photo-preview-box">
                  <img src={previewUrl} alt="Preview da moto" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl('');
                      setFotoUrl('');
                    }}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.6)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      cursor: 'pointer',
                    }}
                    title="Remover foto"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="photo-dropzone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div className="photo-dropzone-icon">
                    <CameraPlusIcon size={44} />
                  </div>
                  <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
                    Clique para fazer upload
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
                    ou arraste a imagem
                  </span>
                </label>
              )}

              {/* Opção alternativa de colar URL */}
              <div style={{ marginTop: 12 }}>
                <input
                  type="url"
                  className="input"
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  placeholder="Ou cole o link de uma foto online..."
                  value={fotoUrl}
                  onChange={(e) => {
                    setFotoUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Coluna Direita: Dados do Veículo */}
            <div className="form">
              {/* Linha 1: Marca e Modelo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="field-label-mono" style={{ display: 'block', marginBottom: 6 }}>
                    Marca *
                  </label>
                  <select
                    className="input"
                    value={selectedMarca}
                    onChange={(e) => setSelectedMarca(e.target.value)}
                    required
                  >
                    <option value="">Selecione a marca</option>
                    {marcas.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label-mono" style={{ display: 'block', marginBottom: 6 }}>
                    Modelo *
                  </label>
                  <select
                    className="input"
                    value={selectedModeloId}
                    onChange={(e) => setSelectedModeloId(e.target.value ? Number(e.target.value) : '')}
                    disabled={!selectedMarca}
                    required
                  >
                    <option value="">Selecione o modelo</option>
                    {modelos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nomeExibicao}
                      </option>
                    ))}
                  </select>
                  {!selectedMarca && (
                    <small className="helper-text" style={{ display: 'block', marginTop: 4 }}>
                      Selecione uma marca primeiro.
                    </small>
                  )}
                </div>
              </div>

              {/* Linha 2: Ano */}
              <div>
                <label className="field-label-mono" style={{ display: 'block', marginBottom: 6 }}>
                  Ano *
                </label>
                <select
                  className="input"
                  value={anoFabricacao}
                  onChange={(e) => setAnoFabricacao(e.target.value ? Number(e.target.value) : '')}
                  required
                >
                  <option value="">Selecione o ano</option>
                  {anosDisponiveis.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linha 3: Apelido da Moto */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <label className="field-label-mono">Apelido da Moto</label>
                  <span className="chip chip-muted" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                    Opcional
                  </span>
                </div>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Branquela, Foguete, XJ6 do Grau..."
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                />
                <small className="helper-text" style={{ display: 'block', marginTop: 4 }}>
                  Um nome amigável para identificar facilmente na sua garagem.
                </small>
              </div>

              {formError ? <ErrorState text={formError} /> : null}
            </div>
          </div>

          {/* Rodapé com Ações alinhadas à direita */}
          <div
            style={{
              borderTop: '1px solid var(--border)',
              marginTop: 24,
              paddingTop: 18,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/garagem')}
              style={{ padding: '10px 24px' }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} style={{ padding: '10px 24px' }}>
              {saving ? 'Salvando...' : '💾 Salvar Moto'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
