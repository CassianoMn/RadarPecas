import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  Tag,
} from 'lucide-react';
import { Button, TextInput } from '../../components/ui';
import {
  type EstoqueItemExtended,
  type LojistaTab,
  getCategoriaEstoque,
  renderCategoryIcon,
} from './lojistaTypes';

export type FiltroStatusEstoque = 'todos' | 'alto' | 'baixo' | 'zerado' | 'promo';

interface LojistaEstoqueTabProps {
  buscaEstoque: string;
  setBuscaEstoque: (v: string) => void;
  filtroCategoriaEstoque: string;
  setFiltroCategoriaEstoque: (v: string) => void;
  filtroStatusEstoque: FiltroStatusEstoque;
  setFiltroStatusEstoque: (v: FiltroStatusEstoque) => void;
  categoriasDisponiveis: string[];
  estoqueFiltrado: EstoqueItemExtended[];
  estoquePaginado: EstoqueItemExtended[];
  paginaEstoqueSegura: number;
  totalPaginasEstoque: number;
  pageSize: number;
  setPaginaEstoque: React.Dispatch<React.SetStateAction<number>>;
  onExportCsv: () => void;
  onChangeTab: (tab: LojistaTab) => void;
  onQuickUpdateItem: (
    item: EstoqueItemExtended,
    novaQuantidade: number,
    novoPreco: number,
    emPromocao: boolean,
    precoPromocional: number | null,
  ) => Promise<void>;
  onConfigurarOferta: (item: EstoqueItemExtended) => void;
}

export function LojistaEstoqueTab({
  buscaEstoque,
  setBuscaEstoque,
  filtroCategoriaEstoque,
  setFiltroCategoriaEstoque,
  filtroStatusEstoque,
  setFiltroStatusEstoque,
  categoriasDisponiveis,
  estoqueFiltrado,
  estoquePaginado,
  paginaEstoqueSegura,
  totalPaginasEstoque,
  pageSize,
  setPaginaEstoque,
  onExportCsv,
  onChangeTab,
  onQuickUpdateItem,
  onConfigurarOferta,
}: LojistaEstoqueTabProps) {
  return (
    <div>
      <div className="lojista-page-header">
        <div>
          <h1 className="lojista-title">Gestão de Estoque</h1>
          <p className="lojista-subtitle">
            Controle completo do seu inventário, preços e disponibilidade.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginLeft: 'auto' }}>
          <Button
            type="button"
            variant="ghost"
            onClick={onExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
            }}
          >
            <Download size={15} />
            Exportar CSV
          </Button>
          <Button
            type="button"
            onClick={() => onChangeTab('novo-produto')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="card lojista-card lojista-filter-bar lojista-filter-surface">
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
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
            placeholder="Buscar por nome, código SKU ou moto compatível..."
            value={buscaEstoque}
            onChange={(e) => setBuscaEstoque(e.target.value)}
            style={{ paddingLeft: 38, background: '#ffffff' }}
          />
        </div>
        <select
          className="input"
          value={filtroCategoriaEstoque}
          onChange={(e) => setFiltroCategoriaEstoque(e.target.value)}
          style={{ background: '#ffffff', flex: '0 1 210px', minWidth: 160 }}
        >
          <option value="">Todas Categorias</option>
          {categoriasDisponiveis.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={filtroStatusEstoque}
          onChange={(e) => setFiltroStatusEstoque(e.target.value as FiltroStatusEstoque)}
          style={{ background: '#ffffff', flex: '0 1 190px', minWidth: 150 }}
        >
          <option value="todos">Status: Todos</option>
          <option value="alto">Estoque Alto (&gt;10)</option>
          <option value="baixo">Estoque Baixo (1-3)</option>
          <option value="zerado">Zerado (0)</option>
          <option value="promo">Em Promoção</option>
        </select>
        <button type="button" title="Filtros Avançados" className="lojista-square-icon-btn">
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Tabela Completa de Estoque */}
      <div className="card lojista-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="lojista-table-scroll">
          <table className="lojista-table">
            <thead>
              <tr className="lojista-table-head">
                <th style={{ padding: '14px 22px' }}>PRODUTO</th>
                <th style={{ padding: '14px 12px' }}>SKU</th>
                <th style={{ padding: '14px 12px' }}>ESTOQUE</th>
                <th style={{ padding: '14px 12px' }}>PREÇO (R$)</th>
                <th style={{ padding: '14px 22px', textAlign: 'right' }}>PROMO (R$)</th>
              </tr>
            </thead>
            <tbody>
              {estoquePaginado.map((item) => {
                const statusBadge =
                  item.quantidadeEstoque === 0
                    ? { text: 'Zerado', bg: '#e2e8f0', color: '#475569' }
                    : item.quantidadeEstoque <= 3
                      ? { text: 'Baixo', bg: '#fee2e2', color: '#b91c1c' }
                      : item.quantidadeEstoque > 10
                        ? { text: 'Alto', bg: '#c8e6f0', color: '#006375' }
                        : { text: 'Ok', bg: '#c8e6f0', color: '#006375' };

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div className="lojista-icon-box">
                          {renderCategoryIcon(getCategoriaEstoque(item), 18)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.nomePeca}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>
                            {item.descricaoCompatibilidade || 'Universal'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="lojista-mono"
                      style={{ padding: '16px 12px', color: '#475569', fontSize: '0.82rem' }}
                    >
                      {item.sku || `SKU-${item.pecaId}`}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                          className={`lojista-qty-input${item.quantidadeEstoque <= 3 ? ' lojista-qty-input--low' : ''}`}
                        />
                        <span
                          className="lojista-pill-badge"
                          style={{ background: statusBadge.bg, color: statusBadge.color }}
                        >
                          {statusBadge.text}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <input
                        type="number"
                        step="0.01"
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
                    <td style={{ padding: '16px 22px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                        {item.emPromocao && item.precoPromocional ? (
                          <span
                            className="lojista-mono"
                            style={{ fontWeight: 800, color: '#006375' }}
                          >
                            {item.precoPromocional.toFixed(2).replace('.', ',')}
                          </span>
                        ) : (
                          <span className="lojista-mono" style={{ color: '#94a3b8' }}>
                            --
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onConfigurarOferta(item)}
                          title="Configurar oferta"
                          className="lojista-promo-cfg-btn"
                        >
                          <Tag size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="lojista-pagination-bar lojista-mono">
          <span>
            {estoqueFiltrado.length === 0
              ? 'Nenhum produto encontrado'
              : `Mostrando ${(paginaEstoqueSegura - 1) * pageSize + 1}-${Math.min(
                  paginaEstoqueSegura * pageSize,
                  estoqueFiltrado.length,
                )} de ${estoqueFiltrado.length} produtos`}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              aria-label="Página anterior"
              disabled={paginaEstoqueSegura <= 1}
              onClick={() => setPaginaEstoque((p) => Math.max(1, p - 1))}
              className="lojista-page-btn"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPaginasEstoque }, (_, idx) => idx + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPaginaEstoque(p)}
                className={`lojista-page-btn${paginaEstoqueSegura === p ? ' lojista-page-btn--active' : ''}`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              aria-label="Próxima página"
              disabled={paginaEstoqueSegura >= totalPaginasEstoque}
              onClick={() => setPaginaEstoque((p) => Math.min(totalPaginasEstoque, p + 1))}
              className="lojista-page-btn"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
