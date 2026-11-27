import {
  AlertTriangle,
  ChevronRight,
  Clock,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import { Button, TextInput } from '../../components/ui';
import {
  type ItemMaisProcuradoRegiao,
  type LojistaTab,
  PRODUCT_BANNER_IMAGES,
} from './lojistaTypes';

export type FiltroProcuradosTab = 'tudo' | 'buscados' | 'tendencias' | 'sem-estoque';

interface ProcuradoNormalizado extends ItemMaisProcuradoRegiao {
  posicao: number;
  compatibilidade: string;
  buscasUltimos7Dias: number;
  quantidadeMeuEstoque: number;
}

interface LojistaMaisProcuradosTabProps {
  raioProcurados: string;
  setRaioProcurados: (v: string) => void;
  periodoProcurados: string;
  setPeriodoProcurados: (v: string) => void;
  totalBuscasRegiao: number;
  crescimentoMedioRegiao: number;
  motoMaisProcurada: { nome: string; percentual: number };
  horarioPicoCalculado: { faixa: string; dias: string };
  maisProcuradosNormalizados: ProcuradoNormalizado[];
  maisProcuradosFiltrados: ProcuradoNormalizado[];
  filtroProcuradosTab: FiltroProcuradosTab;
  setFiltroProcuradosTab: (tab: FiltroProcuradosTab) => void;
  buscaProcurados: string;
  setBuscaProcurados: (v: string) => void;
  onChangeTab: (tab: LojistaTab) => void;
  onPrefillNovoProduto: (nomePeca: string) => void;
}

export function LojistaMaisProcuradosTab({
  raioProcurados,
  setRaioProcurados,
  periodoProcurados,
  setPeriodoProcurados,
  totalBuscasRegiao,
  crescimentoMedioRegiao,
  motoMaisProcurada,
  horarioPicoCalculado,
  maisProcuradosNormalizados,
  maisProcuradosFiltrados,
  filtroProcuradosTab,
  setFiltroProcuradosTab,
  buscaProcurados,
  setBuscaProcurados,
  onChangeTab,
  onPrefillNovoProduto,
}: LojistaMaisProcuradosTabProps) {
  return (
    <div>
      <div className="lojista-page-header">
        <div>
          <h1 className="lojista-title">Mais Procurados na Região</h1>
          <p className="lojista-subtitle">
            Descubra o que os motociclistas estão buscando perto de você (Raio de {raioProcurados}km)
            nos últimos {periodoProcurados} dias.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginLeft: 'auto' }}>
          <select
            className="input"
            value={raioProcurados}
            onChange={(e) => setRaioProcurados(e.target.value)}
            style={{ width: 145, background: '#ffffff' }}
          >
            <option value="5">Raio: 5 km</option>
            <option value="15">Raio: 15 km</option>
            <option value="30">Raio: 30 km</option>
          </select>
          <select
            className="input"
            value={periodoProcurados}
            onChange={(e) => setPeriodoProcurados(e.target.value)}
            style={{ width: 155, background: '#ffffff' }}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="15">Últimos 15 dias</option>
            <option value="30">Últimos 30 dias</option>
          </select>
        </div>
      </div>

      {/* 4 KPI Cards de Inteligência Regional */}
      <div className="lojista-kpi-grid">
        <div className="card lojista-kpi-card">
          <div className="lojista-kpi-header">
            <span>Total de Buscas na Região</span>
            <Search size={15} color="#006375" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              {totalBuscasRegiao.toLocaleString('pt-BR')}
            </span>
            {crescimentoMedioRegiao > 0 && (
              <span className="lojista-pill-badge lojista-pill-badge--teal">
                +{crescimentoMedioRegiao}%
              </span>
            )}
          </div>
        </div>

        <div className="card lojista-kpi-card">
          <div className="lojista-kpi-header">
            <span>Motos Mais Buscadas</span>
            <TrendingUp size={15} color="#64748b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10, minWidth: 0 }}>
            <span
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#006375',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={motoMaisProcurada.nome}
            >
              {motoMaisProcurada.nome}
            </span>
            {motoMaisProcurada.percentual > 0 && (
              <span className="lojista-pill-badge lojista-mono" style={{ background: '#e2e8f0', color: '#475569', borderRadius: 6, flexShrink: 0 }}>
                {motoMaisProcurada.percentual}%
              </span>
            )}
          </div>
        </div>

        <div className="card lojista-kpi-card">
          <div className="lojista-kpi-header">
            <span>Horário de Pico</span>
            <Clock size={15} color="#64748b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              {horarioPicoCalculado.faixa}
            </span>
            <span className="lojista-pill-badge" style={{ background: '#e2e8f0', color: '#475569', borderRadius: 6, fontWeight: 600 }}>
              {horarioPicoCalculado.dias}
            </span>
          </div>
        </div>

        <div className="card lojista-kpi-card">
          <div className="lojista-kpi-header">
            <span>Oportunidades Perdidas</span>
            <AlertTriangle size={15} color="#dc2626" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#b91c1c' }}>
              {maisProcuradosNormalizados.filter((i) => i.quantidadeMeuEstoque === 0).length} Peças
            </span>
            <span className="lojista-pill-badge lojista-pill-badge--danger" style={{ borderRadius: 6 }}>
              Sem Estoque
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Mais Procurados */}
      <div className="card lojista-card lojista-ofertas-filterbar">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'tudo', label: 'Tudo' },
            { id: 'buscados', label: 'Mais Buscados' },
            { id: 'tendencias', label: 'Tendências' },
            { id: 'sem-estoque', label: 'Sem Estoque (Oportunidades)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroProcuradosTab(tab.id as FiltroProcuradosTab)}
              className={`lojista-seg-tab${filtroProcuradosTab === tab.id ? ' lojista-seg-tab--active' : ''}`}
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
              placeholder="Filtrar peça ou moto..."
              value={buscaProcurados}
              onChange={(e) => setBuscaProcurados(e.target.value)}
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

      {/* TOP 3 CARDS VISUAIS */}
      <div className="lojista-cards-grid-3">
        {maisProcuradosFiltrados.slice(0, 3).map((item, idx) => {
          const semEstoque = item.quantidadeMeuEstoque === 0;
          const baixoEstoque = item.quantidadeMeuEstoque > 0 && item.quantidadeMeuEstoque <= 3;
          const bannerImg = PRODUCT_BANNER_IMAGES[(idx + 1) % PRODUCT_BANNER_IMAGES.length];

          return (
            <div
              key={item.posicao}
              className="card lojista-card"
              style={{
                padding: 0,
                overflow: 'hidden',
                borderColor: semEstoque ? '#fca5a5' : '#e2e8f0',
                borderWidth: semEstoque ? '1.5px' : '1px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  height: 170,
                  position: 'relative',
                  backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.15), rgba(15,23,42,0.78)), url(${bannerImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <span
                  className="lojista-mono"
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: item.posicao === 1 ? '#006375' : '#f8fafc',
                    color: item.posicao === 1 ? '#ffffff' : '#0f172a',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                  }}
                >
                  {item.posicao}º
                </span>

                <div
                  className="lojista-mono"
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#a5f3fc',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  <TrendingUp size={14} />
                  <span>+{item.crescimentoPercentual}% em buscas</span>
                </div>
              </div>

              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    className="lojista-mono"
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {item.categoria}
                  </span>
                  <span
                    className="lojista-mono"
                    style={{
                      fontSize: '0.7rem',
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontWeight: 600,
                      maxWidth: 150,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.compatibilidade}
                  </span>
                </div>

                <strong
                  style={{
                    fontSize: '1.02rem',
                    color: '#0f172a',
                    lineHeight: 1.35,
                    marginBottom: 14,
                  }}
                >
                  {item.nomePeca}
                </strong>

                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 12,
                    }}
                  >
                    <span className="lojista-mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Volume de Buscas (7d)
                    </span>
                    <span
                      className="lojista-mono"
                      style={{ fontSize: '1.35rem', fontWeight: 800, color: '#006375' }}
                    >
                      {item.buscasUltimos7Dias}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: semEstoque || baixoEstoque ? '#fee2e2' : '#f1f5f9',
                      border:
                        semEstoque || baixoEstoque ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: semEstoque || baixoEstoque ? '#b91c1c' : '#006375',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: semEstoque || baixoEstoque ? '#dc2626' : '#006375',
                        }}
                      />
                      {semEstoque
                        ? 'Sem Estoque (0 un.)'
                        : baixoEstoque
                          ? `Baixo Estoque (${item.quantidadeMeuEstoque} un.)`
                          : `Em Estoque (${item.quantidadeMeuEstoque} un.)`}
                    </span>

                    {semEstoque ? (
                      <button
                        type="button"
                        onClick={() => onPrefillNovoProduto(item.nomePeca)}
                        style={{
                          background: '#006375',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '5px 10px',
                          fontSize: '0.73rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Cadastrar Peça
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onChangeTab(baixoEstoque ? 'estoque' : 'criar-oferta')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: baixoEstoque ? '#b91c1c' : '#006375',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <span>{baixoEstoque ? 'Repor' : 'Criar Oferta'}</span>
                        <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Demais Itens no Ranking da Região */}
      {maisProcuradosFiltrados.length > 3 && (
        <div className="card lojista-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <strong className="lojista-mono" style={{ fontSize: '0.88rem', color: '#334155' }}>
              DEMAIS ITENS NO RANKING REGIONAL
            </strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {maisProcuradosFiltrados.slice(3).map((item) => {
              const semEstoque = item.quantidadeMeuEstoque === 0;
              return (
                <div key={item.posicao} className="lojista-ranking-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 260px', minWidth: 0 }}>
                    <span
                      className="lojista-mono"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: '#e2e8f0',
                        color: '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        flexShrink: 0,
                      }}
                    >
                      {item.posicao}º
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong
                        style={{
                          display: 'block',
                          fontSize: '0.92rem',
                          color: '#0f172a',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.nomePeca}
                      </strong>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#64748b',
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={`${item.categoria} • Compatível: ${item.compatibilidade}`}
                      >
                        {item.categoria} • Compatível: {item.compatibilidade}
                      </div>
                    </div>
                  </div>

                  <div className="lojista-ranking-right">
                    <div style={{ textAlign: 'right' }}>
                      <strong className="lojista-mono" style={{ color: '#006375', fontSize: '0.95rem' }}>
                        {item.buscasUltimos7Dias} buscas
                      </strong>
                      <div
                        className="lojista-mono"
                        style={{ fontSize: '0.73rem', color: '#006375', fontWeight: 700 }}
                      >
                        +{item.crescimentoPercentual}% (7d)
                      </div>
                    </div>

                    <span
                      className={`lojista-pill-badge ${semEstoque ? 'lojista-pill-badge--danger' : 'lojista-pill-badge--teal'}`}
                    >
                      {semEstoque
                        ? 'Sem Estoque (0 un.)'
                        : `Em Estoque (${item.quantidadeMeuEstoque} un.)`}
                    </span>

                    {semEstoque ? (
                      <Button
                        type="button"
                        onClick={() => onPrefillNovoProduto(item.nomePeca)}
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        + Cadastrar Peça
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onChangeTab('criar-oferta')}
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        Criar Oferta
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
