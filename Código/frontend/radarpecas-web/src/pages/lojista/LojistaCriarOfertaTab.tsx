import type { FormEvent } from 'react';
import { ArrowLeft, Calendar, CheckCircle2, Info, Search, Store } from 'lucide-react';
import { Button, Field, TextInput } from '../../components/ui';
import { formatMoneyBR } from '../../lib/formatters';
import type { Loja } from '../../types';
import {
  type EstoqueItemExtended,
  type LojistaTab,
  PRODUCT_BANNER_IMAGES,
  getCategoriaEstoque,
  renderCategoryIcon,
} from './lojistaTypes';

interface LojistaCriarOfertaTabProps {
  loja: Loja | null;
  estoque: EstoqueItemExtended[];
  itemSelecionadoOferta: EstoqueItemExtended | null;
  ofertaEstoqueId: string;
  setOfertaEstoqueId: (id: string) => void;
  ofertaBuscaProduto: string;
  setOfertaBuscaProduto: (v: string) => void;
  ofertaDescontoPct: string;
  onDescontoChange: (pct: string) => void;
  ofertaPrecoPromo: string;
  setOfertaPrecoPromo: (v: string) => void;
  onPrecoChange: (preco: string) => void;
  ofertaDataInicio: string;
  setOfertaDataInicio: (v: string) => void;
  ofertaDataFim: string;
  setOfertaDataFim: (v: string) => void;
  ofertaDestaqueMapa: boolean;
  setOfertaDestaqueMapa: (v: boolean) => void;
  ofertaSaving: boolean;
  onSubmit: (e: FormEvent) => Promise<void>;
  onChangeTab: (tab: LojistaTab) => void;
}

export function LojistaCriarOfertaTab({
  loja,
  estoque,
  itemSelecionadoOferta,
  ofertaEstoqueId,
  setOfertaEstoqueId,
  ofertaBuscaProduto,
  setOfertaBuscaProduto,
  ofertaDescontoPct,
  onDescontoChange,
  ofertaPrecoPromo,
  setOfertaPrecoPromo,
  onPrecoChange,
  ofertaDataInicio,
  setOfertaDataInicio,
  ofertaDataFim,
  setOfertaDataFim,
  ofertaDestaqueMapa,
  setOfertaDestaqueMapa,
  ofertaSaving,
  onSubmit,
  onChangeTab,
}: LojistaCriarOfertaTabProps) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button type="button" onClick={() => onChangeTab('ofertas')} className="lojista-back-btn">
          <ArrowLeft size={15} />
          <span>Voltar para Ofertas Ativas</span>
        </button>
        <h1 className="lojista-title">Criar Nova Oferta</h1>
        <p className="lojista-subtitle">
          Selecione um produto do seu inventário e defina condições especiais para destacar no
          Radar.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="lojista-split-grid">
          {/* Passos 1, 2 e 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
            <div className="card lojista-card" style={{ padding: 24 }}>
              <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: '1.05rem', color: '#0f172a' }}>
                1. Selecionar Produto do Estoque
              </h3>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <Search
                  size={16}
                  color="#64748b"
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
                <TextInput
                  placeholder="Buscar peça no seu inventário por nome ou SKU..."
                  value={ofertaBuscaProduto}
                  onChange={(e) => setOfertaBuscaProduto(e.target.value)}
                  style={{ paddingLeft: 38 }}
                />
              </div>
              <select
                className="input"
                value={ofertaEstoqueId}
                onChange={(e) => {
                  const id = e.target.value;
                  setOfertaEstoqueId(id);
                  const found = estoque.find((i) => i.id === id);
                  if (found) {
                    const pct = Number(ofertaDescontoPct) || 20;
                    setOfertaPrecoPromo(String(Number((found.precoVenda * (1 - pct / 100)).toFixed(2))));
                  }
                }}
              >
                {estoque
                  .filter(
                    (i) =>
                      !ofertaBuscaProduto.trim() ||
                      i.nomePeca.toLowerCase().includes(ofertaBuscaProduto.toLowerCase()) ||
                      (i.sku || '').toLowerCase().includes(ofertaBuscaProduto.toLowerCase()),
                  )
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nomePeca} — Estoque: {i.quantidadeEstoque} un. — {formatMoneyBR(i.precoVenda)}
                    </option>
                  ))}
              </select>

              {itemSelecionadoOferta && (
                <div className="lojista-selected-item-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div className="lojista-icon-box" style={{ width: 44, height: 44, color: '#006375' }}>
                      {renderCategoryIcon(getCategoriaEstoque(itemSelecionadoOferta), 20)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong
                        style={{
                          color: '#0f172a',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {itemSelecionadoOferta.nomePeca}
                      </strong>
                      <div
                        className="lojista-mono"
                        style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}
                      >
                        SKU: {itemSelecionadoOferta.sku || `SKU-${itemSelecionadoOferta.pecaId}`} •
                        Estoque: {itemSelecionadoOferta.quantidadeEstoque} un. • Preço Atual:{' '}
                        {formatMoneyBR(itemSelecionadoOferta.precoVenda)}
                      </div>
                    </div>
                  </div>
                  <span style={{ color: '#006375', fontWeight: 700, fontSize: '0.82rem' }}>
                    Selecionado
                  </span>
                </div>
              )}
            </div>

            {/* Passo 2 */}
            <div className="card lojista-card" style={{ padding: 24 }}>
              <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: '1.05rem', color: '#0f172a' }}>
                2. Configurar Desconto e Preço
              </h3>
              <div className="lojista-form-grid-3">
                <Field label="Preço Original">
                  <TextInput
                    disabled
                    value={
                      itemSelecionadoOferta
                        ? formatMoneyBR(itemSelecionadoOferta.precoVenda)
                        : 'R$ 0,00'
                    }
                  />
                </Field>
                <Field label="Desconto (%)">
                  <TextInput
                    type="number"
                    min={1}
                    max={90}
                    value={ofertaDescontoPct}
                    onChange={(e) => onDescontoChange(e.target.value)}
                  />
                </Field>
                <Field label="Preço Promocional *">
                  <TextInput
                    type="number"
                    step="0.01"
                    required
                    value={ofertaPrecoPromo}
                    onChange={(e) => onPrecoChange(e.target.value)}
                    style={{ borderColor: '#006375', fontWeight: 800, color: '#006375' }}
                  />
                </Field>
              </div>

              {itemSelecionadoOferta && Number(ofertaPrecoPromo) > 0 && (
                <div
                  style={{
                    marginTop: 14,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#f1f5f9',
                    color: '#006375',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={16} color="#006375" />
                  <span>
                    O cliente economizará{' '}
                    <strong>
                      {formatMoneyBR(
                        Math.max(0, itemSelecionadoOferta.precoVenda - Number(ofertaPrecoPromo)),
                      )}
                    </strong>{' '}
                    nesta oferta.
                  </span>
                </div>
              )}
            </div>

            {/* Passo 3 */}
            <div className="card lojista-card" style={{ padding: 24 }}>
              <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: '1.05rem', color: '#0f172a' }}>
                3. Duração e Visibilidade
              </h3>
              <div className="lojista-form-grid-2" style={{ marginBottom: 16 }}>
                <Field label="Data de Início">
                  <div style={{ position: 'relative' }}>
                    <Calendar
                      size={15}
                      color="#64748b"
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <TextInput
                      type="date"
                      value={ofertaDataInicio}
                      onChange={(e) => setOfertaDataInicio(e.target.value)}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </Field>
                <Field label="Data de Término">
                  <div style={{ position: 'relative' }}>
                    <Calendar
                      size={15}
                      color="#64748b"
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <TextInput
                      type="date"
                      value={ofertaDataFim}
                      onChange={(e) => setOfertaDataFim(e.target.value)}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </Field>
              </div>

              <label className="lojista-toggle-row">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0f172a' }}>
                    Destaque Especial no Mapa
                  </strong>
                  <small style={{ color: '#64748b' }}>
                    Exibir pino promocional da loja para buscas compatíveis num raio de 15km
                  </small>
                </div>
                <input
                  type="checkbox"
                  checked={ofertaDestaqueMapa}
                  onChange={(e) => setOfertaDestaqueMapa(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#006375' }}
                />
              </label>
            </div>
          </div>

          {/* Coluna Direita: Pré-Visualização no Radar */}
          <div className="card lojista-card" style={{ padding: 22, position: 'sticky', top: 24 }}>
            <div
              className="lojista-mono"
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              PRÉ-VISUALIZAÇÃO NO RADAR
            </div>

            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  height: 135,
                  backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.2), rgba(15,23,42,0.75)), url(${PRODUCT_BANNER_IMAGES[0]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  padding: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <span className="lojista-pill-badge lojista-pill-badge--teal lojista-mono">
                  OFERTA EM DESTAQUE
                </span>
                <span
                  className="lojista-mono"
                  style={{
                    background: '#b91c1c',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 6,
                  }}
                >
                  -{ofertaDescontoPct || 20}%
                </span>
              </div>

              <div style={{ padding: 16 }}>
                <div
                  className="lojista-mono"
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Store size={13} color="#006375" />
                  <span>{loja?.nomeFantasia || 'Sua Loja'} • a 2.4 km</span>
                </div>
                <strong
                  style={{ display: 'block', marginTop: 6, fontSize: '0.96rem', color: '#0f172a' }}
                >
                  {itemSelecionadoOferta?.nomePeca || 'Produto Selecionado'}
                </strong>
                <div style={{ marginTop: 10 }}>
                  <div
                    className="lojista-mono"
                    style={{
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      textDecoration: 'line-through',
                    }}
                  >
                    {formatMoneyBR(itemSelecionadoOferta?.precoVenda ?? 150)}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 2,
                    }}
                  >
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#006375' }}>
                      {formatMoneyBR(Number(ofertaPrecoPromo || 119.9))}
                    </span>
                    <span
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        background: '#c8e6f0',
                        color: '#006375',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                      }}
                    >
                      Ver no Mapa
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 8,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.78rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <Info size={16} color="#006375" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                Produtos com descontos a partir de <strong>15%</strong> recebem até{' '}
                <strong>3x mais cliques</strong> na busca regional.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              <Button type="submit" block disabled={ofertaSaving}>
                {ofertaSaving ? 'Publicando...' : 'Publicar Oferta'}
              </Button>
              <Button type="button" variant="ghost" block onClick={() => onChangeTab('ofertas')}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
