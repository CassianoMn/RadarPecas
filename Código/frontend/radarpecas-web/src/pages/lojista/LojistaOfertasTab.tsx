import {
  AlertTriangle,
  Clock,
  Eye,
  MoreVertical,
  MousePointerClick,
  Pencil,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
} from 'lucide-react';
import { Button, TextInput } from '../../components/ui';
import { formatMoneyBR } from '../../lib/formatters';
import {
  type DashboardLojistaResponse,
  type EstoqueItemExtended,
  type LojistaTab,
  PRODUCT_BANNER_IMAGES,
  getCategoriaEstoque,
} from './lojistaTypes';

export type FiltroOfertasTab = 'todas' | 'populares' | 'finalizando';

interface LojistaOfertasTabProps {
  dashboard: DashboardLojistaResponse | null;
  ofertasAtivasList: EstoqueItemExtended[];
  ofertasExpirandoEmBreve: number;
  filtroOfertasTab: FiltroOfertasTab;
  setFiltroOfertasTab: (tab: FiltroOfertasTab) => void;
  buscaOfertas: string;
  setBuscaOfertas: (v: string) => void;
  onChangeTab: (tab: LojistaTab) => void;
  onEditOferta: (oferta: EstoqueItemExtended, precoPromo: number) => void;
  onEncerrarOferta: (oferta: EstoqueItemExtended) => Promise<void>;
}

export function LojistaOfertasTab({
  dashboard,
  ofertasAtivasList,
  ofertasExpirandoEmBreve,
  filtroOfertasTab,
  setFiltroOfertasTab,
  buscaOfertas,
  setBuscaOfertas,
  onChangeTab,
  onEditOferta,
  onEncerrarOferta,
}: LojistaOfertasTabProps) {
  return (
    <div>
      <div className="lojista-page-header">
        <div>
          <h1 className="lojista-title">Ofertas Ativas</h1>
          <p className="lojista-subtitle">
            Promova peças do seu estoque e atraia mais motociclistas pelo Radar.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => onChangeTab('criar-oferta')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            marginLeft: 'auto',
          }}
        >
          <Tag size={16} />
          + Criar Nova Oferta
        </Button>
      </div>

      {/* 4 KPI Cards de Ofertas */}
      <div className="lojista-kpi-grid">
        <div className="card lojista-kpi-card">
          <div className="lojista-kpi-header">
            <span>Total em Oferta</span>
            <Tag size={15} color="#006375" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
              {ofertasAtivasList.length}
            </span>
            <span className="lojista-pill-badge lojista-pill-badge--teal">+3 essa semana</span>
          </div>
        </div>

        <div className="card lojista-kpi-card">
          <div className="lojista-kpi-header">
            <span>Visualizações (Ofertas)</span>
            <Eye size={15} color="#64748b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#006375' }}>
              {dashboard?.totalVisualizacoesOfertas ??
                ofertasAtivasList.reduce((acc, i) => acc + (i.visualizacoes || 0), 0)}
            </span>
            <span className="lojista-pill-badge lojista-pill-badge--teal">Total Real</span>
          </div>
        </div>

        <div className="card lojista-kpi-card">
          <div className="lojista-kpi-header">
            <span>Cliques no WhatsApp/Rota</span>
            <MousePointerClick size={15} color="#64748b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
              {dashboard?.totalCliquesOfertas ??
                ofertasAtivasList.reduce((acc, i) => acc + (i.cliques || 0), 0)}
            </span>
            <span className="lojista-pill-badge lojista-pill-badge--teal">Conversões</span>
          </div>
        </div>

        <div className="card lojista-kpi-card">
          <div className="lojista-kpi-header">
            <span>Expirando em Breve</span>
            <AlertTriangle size={15} color="#dc2626" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#b91c1c' }}>
              {ofertasExpirandoEmBreve}
            </span>
            <span className="lojista-pill-badge lojista-pill-badge--danger">&lt; 48h</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros de Ofertas */}
      <div className="card lojista-card lojista-ofertas-filterbar">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'todas', label: `Todas (${ofertasAtivasList.length})` },
            { id: 'populares', label: 'Mais Populares' },
            { id: 'finalizando', label: 'Finalizando' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroOfertasTab(tab.id as FiltroOfertasTab)}
              className={`lojista-seg-tab${filtroOfertasTab === tab.id ? ' lojista-seg-tab--active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flex: '0 1 320px',
            marginLeft: 'auto',
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <Search
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
              placeholder="Buscar oferta ativa..."
              value={buscaOfertas}
              onChange={(e) => setBuscaOfertas(e.target.value)}
              style={{ paddingLeft: 36, background: '#ffffff', height: 36 }}
            />
          </div>
          <button
            type="button"
            className="lojista-square-icon-btn"
            style={{ width: 36, height: 36, borderRadius: 6 }}
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Grid de 3 Colunas com Cards Visuais */}
      {ofertasAtivasList.length === 0 ? (
        <div className="card lojista-card" style={{ padding: 48, textAlign: 'center' }}>
          <Tag size={32} color="#94a3b8" style={{ marginBottom: 10 }} />
          <h3 style={{ marginTop: 0 }}>Nenhuma oferta ativa no momento</h3>
          <p style={{ color: '#64748b', marginBottom: 18 }}>
            Destaque peças do seu estoque para aparecer na aba Promoções dos motociclistas da sua
            região.
          </p>
          <Button type="button" onClick={() => onChangeTab('criar-oferta')}>
            Criar Primeira Oferta
          </Button>
        </div>
      ) : (
        <div className="lojista-cards-grid-3">
          {ofertasAtivasList.map((oferta, index) => {
            const precoPromo =
              oferta.precoPromocional ?? Number((oferta.precoVenda * 0.8).toFixed(2));
            const pctDesconto = Math.max(5, Math.round((1 - precoPromo / oferta.precoVenda) * 100));
            const views = oferta.visualizacoes || 142;
            const clicks = oferta.cliques || 38;
            const convPct = Math.round((clicks / Math.max(1, views)) * 100);
            const isExpiringSoon = index === 1;
            const bannerImg = PRODUCT_BANNER_IMAGES[index % PRODUCT_BANNER_IMAGES.length];

            return (
              <div
                key={oferta.id}
                className="card lojista-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  borderColor: isExpiringSoon ? '#fca5a5' : '#e2e8f0',
                  borderWidth: isExpiringSoon ? '1.5px' : '1px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    height: 170,
                    position: 'relative',
                    backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.15), rgba(15,23,42,0.75)), url(${bannerImg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <span className="lojista-discount-flag lojista-mono">-{pctDesconto}%</span>

                  <div
                    className="lojista-mono"
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      color: isExpiringSoon ? '#fecaca' : '#f8fafc',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {isExpiringSoon ? (
                      <AlertTriangle size={14} color="#f87171" />
                    ) : (
                      <Clock size={14} />
                    )}
                    <span>{isExpiringSoon ? 'Expira em 18 horas' : 'Expira em 3 dias'}</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <span
                      className="lojista-mono"
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {getCategoriaEstoque(oferta) || 'PEÇAS'}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        title="Editar oferta"
                        onClick={() => onEditOferta(oferta, precoPromo)}
                        className="lojista-icon-ghost-btn"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        title="Encerrar oferta"
                        onClick={() => void onEncerrarOferta(oferta)}
                        className="lojista-icon-ghost-btn"
                        style={{ color: '#b91c1c' }}
                      >
                        <Trash2 size={14} />
                      </button>
                      <MoreVertical size={14} color="#94a3b8" />
                    </div>
                  </div>

                  <strong
                    style={{
                      fontSize: '1.02rem',
                      color: '#0f172a',
                      lineHeight: 1.35,
                      marginBottom: 14,
                    }}
                  >
                    {oferta.nomePeca}
                  </strong>

                  <div style={{ marginTop: 'auto' }}>
                    <div
                      className="lojista-mono"
                      style={{
                        fontSize: '0.78rem',
                        color: '#94a3b8',
                        textDecoration: 'line-through',
                      }}
                    >
                      De {formatMoneyBR(oferta.precoVenda)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#006375' }}>
                        {formatMoneyBR(precoPromo)}
                      </span>
                      <span
                        className="lojista-mono"
                        style={{ fontSize: '0.75rem', color: '#64748b' }}
                      >
                        à vista
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 14,
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 18 }}>
                      <div>
                        <span
                          className="lojista-mono"
                          style={{ display: 'block', fontSize: '0.68rem', color: '#64748b' }}
                        >
                          Visualizações
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            color: '#0f172a',
                            marginTop: 2,
                          }}
                        >
                          <Eye size={13} color="#64748b" /> {views}
                        </span>
                      </div>
                      <div>
                        <span
                          className="lojista-mono"
                          style={{ display: 'block', fontSize: '0.68rem', color: '#64748b' }}
                        >
                          Cliques
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            color: '#0f172a',
                            marginTop: 2,
                          }}
                        >
                          <MousePointerClick size={13} color="#64748b" /> {clicks}
                        </span>
                      </div>
                    </div>

                    <span
                      className="lojista-mono"
                      style={{
                        padding: '4px 9px',
                        borderRadius: 6,
                        background: '#c8e6f0',
                        color: '#006375',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                      }}
                    >
                      {convPct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
