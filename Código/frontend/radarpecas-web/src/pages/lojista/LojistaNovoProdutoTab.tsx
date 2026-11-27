import type { FormEvent } from 'react';
import { ArrowLeft, ImagePlus, Plus } from 'lucide-react';
import { Button, Field, TextInput } from '../../components/ui';
import type { ModeloMoto } from '../../types';
import type { LojistaTab } from './lojistaTypes';

export interface LojistaNovoProdutoFormProps {
  categoriasDisponiveis: string[];
  modelosMoto: ModeloMoto[];
  npNomePeca: string;
  setNpNomePeca: (v: string) => void;
  npCategoria: string;
  setNpCategoria: (v: string) => void;
  npNovaCategoria: string;
  setNpNovaCategoria: (v: string) => void;
  npMarca: string;
  setNpMarca: (v: string) => void;
  npCodigoSku: string;
  setNpCodigoSku: (v: string) => void;
  npDescricao: string;
  setNpDescricao: (v: string) => void;
  npModelosSelecionados: string[];
  setNpModelosSelecionados: React.Dispatch<React.SetStateAction<string[]>>;
  npTagMotoInput: string;
  setNpTagMotoInput: (v: string) => void;
  npQuantidade: string;
  setNpQuantidade: (v: string) => void;
  npAlertaMinimo: string;
  setNpAlertaMinimo: (v: string) => void;
  npPreco: string;
  setNpPreco: (v: string) => void;
  npEmPromocao: boolean;
  setNpEmPromocao: (v: boolean) => void;
  npPrecoPromo: string;
  setNpPrecoPromo: (v: string) => void;
  npSaving: boolean;
  onSubmit: (e: FormEvent) => Promise<void>;
  onChangeTab: (tab: LojistaTab) => void;
}

export function LojistaNovoProdutoTab({
  categoriasDisponiveis,
  modelosMoto,
  npNomePeca,
  setNpNomePeca,
  npCategoria,
  setNpCategoria,
  npNovaCategoria,
  setNpNovaCategoria,
  npMarca,
  setNpMarca,
  npCodigoSku,
  setNpCodigoSku,
  npDescricao,
  setNpDescricao,
  npModelosSelecionados,
  setNpModelosSelecionados,
  npTagMotoInput,
  setNpTagMotoInput,
  npQuantidade,
  setNpQuantidade,
  npAlertaMinimo,
  setNpAlertaMinimo,
  npPreco,
  setNpPreco,
  npEmPromocao,
  setNpEmPromocao,
  npPrecoPromo,
  setNpPrecoPromo,
  npSaving,
  onSubmit,
  onChangeTab,
}: LojistaNovoProdutoFormProps) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button type="button" onClick={() => onChangeTab('resumo')} className="lojista-back-btn">
          <ArrowLeft size={15} />
          <span>Voltar para o Dashboard</span>
        </button>
        <h1 className="lojista-title" style={{ fontSize: '1.8rem' }}>
          Adicionar Novo Produto
        </h1>
        <p className="lojista-subtitle">
          Cadastre uma nova peça no seu inventário e disponibilize no Radar.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="lojista-split-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
            <div className="card lojista-card" style={{ padding: 24 }}>
              <h3 style={{ marginTop: 0, marginBottom: 18, fontSize: '1.05rem', color: '#0f172a' }}>
                Informações Básicas
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Nome da Peça *">
                  <TextInput
                    required
                    placeholder="Ex: Pastilha de Freio Dianteira Cobreq"
                    value={npNomePeca}
                    onChange={(e) => setNpNomePeca(e.target.value)}
                  />
                </Field>

                <div className="lojista-form-grid-2">
                  <Field label="Categoria *">
                    <select
                      className="input"
                      value={npCategoria}
                      onChange={(e) => setNpCategoria(e.target.value)}
                    >
                      {categoriasDisponiveis.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Ou Nova Categoria">
                    <TextInput
                      placeholder="Ex: Freios / Transmissão"
                      value={npNovaCategoria}
                      onChange={(e) => setNpNovaCategoria(e.target.value)}
                    />
                  </Field>
                </div>

                <div className="lojista-form-grid-2">
                  <Field label="Marca / Fabricante">
                    <TextInput
                      placeholder="Ex: Cobreq, DID, Motul"
                      value={npMarca}
                      onChange={(e) => setNpMarca(e.target.value)}
                    />
                  </Field>

                  <Field label="Código SKU (Interno)">
                    <TextInput
                      placeholder="Ex: BRK-CB500-01"
                      value={npCodigoSku}
                      onChange={(e) => setNpCodigoSku(e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Descrição Técnica">
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Especificações, materiais, detalhes de aplicação ou observações da peça..."
                    value={npDescricao}
                    onChange={(e) => setNpDescricao(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </Field>
              </div>
            </div>

            {/* Compatibilidade de Motos */}
            <div className="card lojista-card" style={{ padding: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                  Compatibilidade de Motos
                </h3>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: '#006375',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Plus size={14} /> Adicionar Modelo
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <TextInput
                  placeholder="Ex: Honda CG 160 Titan (2018-2024)"
                  value={npTagMotoInput}
                  onChange={(e) => setNpTagMotoInput(e.target.value)}
                  list="modelos-moto-datalist"
                />
                <datalist id="modelos-moto-datalist">
                  {modelosMoto.map((m) => (
                    <option key={m.id} value={m.nomeExibicao} />
                  ))}
                </datalist>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (npTagMotoInput.trim()) {
                      setNpModelosSelecionados((prev) => [...prev, npTagMotoInput.trim()]);
                      setNpTagMotoInput('');
                    }
                  }}
                >
                  Incluir
                </Button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {npModelosSelecionados.map((tag, idx) => (
                  <span key={idx} className="lojista-compat-tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setNpModelosSelecionados((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="lojista-compat-tag-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Direita: Imagem + Estoque e Preço */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card lojista-card" style={{ padding: 22 }}>
              <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: '1rem', color: '#0f172a' }}>
                Imagem do Produto
              </h3>
              <div className="lojista-upload-box">
                <ImagePlus size={30} color="#64748b" />
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>
                  Clique para fazer upload ou arraste a imagem
                </div>
                <small className="lojista-mono" style={{ fontSize: '0.75rem' }}>
                  PNG, JPG até 5MB
                </small>
              </div>
            </div>

            <div className="card lojista-card" style={{ padding: 22 }}>
              <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: '1rem', color: '#0f172a' }}>
                Estoque e Preço
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="resp-grid-2">
                  <Field label="Quantidade em Estoque *">
                    <TextInput
                      type="number"
                      min={0}
                      required
                      value={npQuantidade}
                      onChange={(e) => setNpQuantidade(e.target.value)}
                    />
                  </Field>
                  <Field label="Alerta Estoque Baixo">
                    <TextInput
                      type="number"
                      min={1}
                      value={npAlertaMinimo}
                      onChange={(e) => setNpAlertaMinimo(e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Preço de Venda (R$) *">
                  <TextInput
                    type="number"
                    step="0.01"
                    min={0.01}
                    required
                    value={npPreco}
                    onChange={(e) => setNpPreco(e.target.value)}
                  />
                </Field>

                <div
                  style={{
                    paddingTop: 12,
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0f172a' }}>
                      Em Promoção
                    </strong>
                    <small style={{ color: '#64748b' }}>Destacar oferta no Radar</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={npEmPromocao}
                    onChange={(e) => setNpEmPromocao(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#006375' }}
                  />
                </div>

                {npEmPromocao && (
                  <Field label="Preço Promocional (R$)">
                    <TextInput
                      type="number"
                      step="0.01"
                      placeholder="Ex: 119.90"
                      value={npPrecoPromo}
                      onChange={(e) => setNpPrecoPromo(e.target.value)}
                    />
                  </Field>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lojista-form-footer">
          <Button type="button" variant="ghost" onClick={() => onChangeTab('resumo')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={npSaving}>
            {npSaving ? 'Publicando...' : 'Salvar e Publicar no Radar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
