import { AlertTriangle, ChevronRight, PackageCheck, Plus, Radar, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui';
import {
  type DashboardLojistaResponse,
  type EstoqueItemExtended,
  type ItemMaisProcuradoRegiao,
  type LojistaTab,
  getCategoriaEstoque,
  renderCategoryIcon,
} from './lojistaTypes';

interface LojistaResumoTabProps {
  dashboard: DashboardLojistaResponse | null;
  estoque: EstoqueItemExtended[];
  ofertasAtivasCount: number;
  maisProcuradosNormalizados: (ItemMaisProcuradoRegiao & {
    posicao: number;
    compatibilidade: string;
    buscasUltimos7Dias: number;
    quantidadeMeuEstoque: number;
  })[];
  onChangeTab: (tab: LojistaTab) => void;
  onExportCsv: () => void;
  onQuickUpdateItem: (
    item: EstoqueItemExtended,
    novaQuantidade: number,
    novoPreco: number,
    emPromocao: boolean,
    precoPromocional: number | null,
  ) => Promise<void>;
}

export function LojistaResumoTab({
  dashboard,
  estoque,
  ofertasAtivasCount,
  maisProcuradosNormalizados,
  onChangeTab,
  onExportCsv,
  onQuickUpdateItem,
}: LojistaResumoTabProps) {
  return (
    <div>
      <div className="lojista-page-header">
        <div>
          <h1 className="lojista-title">Dashboard da Loja</h1>
          <p className="lojista-subtitle">
            Gerencie seu inventário e acompanhe tendências da região.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => onChangeTab('novo-produto')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            marginLeft: 'auto',
          }}
        >
          <Plus size={16} />
          Novo Produto
        </Button>
      </div>

      {/* 4 KPI Cards */}
      <div className="lojista-kpi-grid">
        <div className="card lojista-kpi-card">
          <div className="lojista-kpi-header">
            <span>Total Produtos</span>
            <PackageCheck size={16} color="#94a3b8" />
          </div>
          <div className="lojista-kpi-value">
            {dashboard?.totalProdutosCadastrados ?? dashboard?.totalPecasDistintas ?? estoque.length}
          </div>
        </div>

        <div className="card lojista-kpi-card">
          <div className="lojista-kpi-header">
            <span>Itens Baixo Estoque</span>
            <AlertTriangle size={16} color="#dc2626" />
          </div>
          <div className="lojista-kpi-value" style={{ color: '#b91c1c' }}>
            {dashboard?.totalItensEstoqueBaixo ??
              dashboard?.itensEstoqueBaixo ??
              estoque.filter((i) => i.quantidadeEstoque <= 3).length}
          </div>
        </div>

        <div className="card lojista-kpi-card">
          <div className="lojista-kpi-header">
            <span>Buscas no Radar (24h)</span>
            <Radar size={16} color="#006375" />
          </div>
          <div className="lojista-kpi-value" style={{ color: '#006375' }}>
            {dashboard?.buscasRadar24h ??
              (dashboard?.totalVisualizacoesOfertas ?? 0) + (dashboard?.totalCliquesOfertas ?? 0)}
          </div>
        </div>

        <div className="card lojista-kpi-card">
          <div className="lojista-kpi-header">
            <span>Ofertas Ativas</span>
            <button
              type="button"
              onClick={() => onChangeTab('ofertas')}
              className="lojista-link-btn"
            >
              Gerenciar
            </button>
          </div>
          <div className="lojista-kpi-value">
            {dashboard?.totalOfertasAtivas ?? ofertasAtivasCount}
          </div>
        </div>
      </div>

      {/* Grid Gestão Rápida + Em Alta no Radar */}
      <div className="lojista-split-grid">
        <div className="card lojista-card" style={{ padding: 0, overflow: 'hidden', minWidth: 0 }}>
          <div className="lojista-card-head">
            <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>Gestão Rápida</strong>
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                type="button"
                onClick={() => onChangeTab('estoque')}
                className="lojista-muted-mono-btn"
              >
                Filtrar
              </button>
              <button type="button" onClick={onExportCsv} className="lojista-muted-mono-btn">
                Exportar
              </button>
            </div>
          </div>

          {estoque.length === 0 ? (
            <div style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
              Nenhum produto cadastrado ainda. Clique em <strong>+ Novo Produto</strong> para
              começar!
            </div>
          ) : (
            <div className="lojista-table-scroll">
              <table className="lojista-table">
                <thead>
                  <tr className="lojista-table-head">
                    <th style={{ padding: '12px 22px' }}>Produto</th>
                    <th style={{ padding: '12px' }}>Estoque</th>
                    <th style={{ padding: '12px' }}>Preço (R$)</th>
                    <th style={{ padding: '12px 22px', textAlign: 'center' }}>Promo</th>
                  </tr>
                </thead>
                <tbody>
                  {estoque.slice(0, 5).map((item) => {
                    const isLowStock = item.quantidadeEstoque <= 3;
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 22px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="lojista-icon-box">
                              {renderCategoryIcon(getCategoriaEstoque(item), 18)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                {item.nomePeca}
                              </div>
                              <div
                                className="lojista-mono"
                                style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}
                              >
                                SKU: {item.sku || `SKU-${item.pecaId}`} •{' '}
                                {item.descricaoCompatibilidade || 'Universal'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <input
                            type="number"
                            min={0}
                            defaultValue={item.quantidadeEstoque}
                            onBlur={(e) => {
                              const val = Number(e.target.value);
                              if (val !== item.quantidadeEstoque) {
                                void onQuickUpdateItem(
                                  item,
                                  val,
                                  item.precoVenda,
                                  item.emPromocao,
                                  item.precoPromocional ?? null,
                                );
                              }
                            }}
                            className={`lojista-qty-input${isLowStock ? ' lojista-qty-input--low' : ''}`}
                          />
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <input
                            type="number"
                            step="0.01"
                            min={0.01}
                            defaultValue={item.precoVenda}
                            onBlur={(e) => {
                              const val = Number(e.target.value);
                              if (val > 0 && val !== item.precoVenda) {
                                void onQuickUpdateItem(
                                  item,
                                  item.quantidadeEstoque,
                                  val,
                                  item.emPromocao,
                                  item.precoPromocional ?? null,
                                );
                              }
                            }}
                            className="lojista-price-input"
                          />
                        </td>
                        <td style={{ padding: '14px 22px', textAlign: 'center' }}>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.emPromocao}
                            onClick={() =>
                              void onQuickUpdateItem(
                                item,
                                item.quantidadeEstoque,
                                item.precoVenda,
                                !item.emPromocao,
                                item.precoPromocional ?? Number((item.precoVenda * 0.85).toFixed(2)),
                              )
                            }
                            style={{
                              width: 42,
                              height: 22,
                              borderRadius: 999,
                              border: 'none',
                              background: item.emPromocao ? '#006375' : '#cbd5e1',
                              position: 'relative',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                top: 3,
                                left: item.emPromocao ? 23 : 3,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                background: '#ffffff',
                                transition: 'left 0.2s',
                              }}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div
            style={{
              padding: '14px 22px',
              textAlign: 'center',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
            }}
          >
            <button
              type="button"
              onClick={() => onChangeTab('estoque')}
              className="lojista-link-btn"
              style={{ fontSize: '0.82rem' }}
            >
              Ver todo o inventário
            </button>
          </div>
        </div>

        {/* Card Em Alta no Radar (Sua Região) */}
        <div className="card lojista-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="#006375" />
            <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>
              Em Alta no Radar (Sua Região)
            </strong>
          </div>
          <p
            className="lojista-mono"
            style={{ fontSize: '0.78rem', color: '#64748b', margin: '6px 0 16px' }}
          >
            Itens mais buscados num raio de 15km
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {maisProcuradosNormalizados.slice(0, 4).map((rank) => (
              <div key={rank.posicao} className="lojista-mini-rank-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span
                    className="lojista-mono"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: rank.posicao === 1 ? '#006375' : '#e2e8f0',
                      color: rank.posicao === 1 ? '#ffffff' : '#475569',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {rank.posicao}
                  </span>
                  <span
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {rank.nomePeca}
                  </span>
                </div>
                <span
                  className="lojista-mono"
                  style={{ fontSize: '0.75rem', fontWeight: 700, color: '#006375', flexShrink: 0 }}
                >
                  {rank.buscasUltimos7Dias} buscas
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onChangeTab('mais-procurados')}
            className="lojista-link-btn"
            style={{
              marginTop: 18,
              width: '100%',
              padding: 8,
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <span>Ver Relatório Completo</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
