import { useId } from 'react';
import { Link } from 'react-router-dom';
import type { ActiveMoto } from '../context/active-moto-context';

export type DistanciaPill = '5km' | '15km' | '+15km';

interface FiltrosOfertasProps {
  variant: 'sidebar' | 'sheet';
  apenasPromocoes: boolean;
  onChangePromocoes: (value: boolean) => void;
  categoria: string;
  categorias: string[];
  onChangeCategoria: (value: string) => void;
  marcasDisponiveis: string[];
  selectedMarcas: string[];
  onToggleMarca: (marca: string) => void;
  precoMaximo: number;
  onChangePrecoMaximo: (value: number) => void;
  distanciaPill: DistanciaPill;
  onChangeDistancia: (dist: DistanciaPill) => void;
  userCoords: { lat: number; lng: number } | null;
  solicitandoLocalizacao: boolean;
  onSolicitarLocalizacao: () => void;
  onLimparFiltros: () => void;
  activeMoto: ActiveMoto | null;
}

function formatMoney(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function FiltrosOfertas({
  variant,
  apenasPromocoes,
  onChangePromocoes,
  categoria,
  categorias,
  onChangeCategoria,
  marcasDisponiveis,
  selectedMarcas,
  onToggleMarca,
  precoMaximo,
  onChangePrecoMaximo,
  distanciaPill,
  onChangeDistancia,
  userCoords,
  solicitandoLocalizacao,
  onSolicitarLocalizacao,
  onLimparFiltros,
  activeMoto,
}: FiltrosOfertasProps) {
  const baseId = useId();
  const catSelectId = `${baseId}-categoria`;
  const precoRangeId = `${baseId}-preco`;

  return (
    <div className={`filtros-ofertas-body filtros-ofertas-${variant}`}>
      {variant === 'sidebar' && <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Filtros</h2>}

      {/* Promoções / Ofertas Especiais */}
      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <span className="field-label-mono" style={{ display: 'block', marginBottom: 6 }}>
          Ofertas Especiais
        </span>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            fontSize: '0.88rem',
            color: '#0f172a',
            fontWeight: 600,
            minHeight: 32,
          }}
        >
          <input
            type="checkbox"
            checked={apenasPromocoes}
            onChange={(e) => onChangePromocoes(e.target.checked)}
            style={{ accentColor: '#006375', width: 18, height: 18 }}
          />
          🔥 Apenas Promoções
        </label>
      </div>

      {/* Categoria */}
      <div>
        <label htmlFor={catSelectId} className="field-label-mono" style={{ display: 'block', marginBottom: 6 }}>
          Categoria
        </label>
        <select
          id={catSelectId}
          className="input"
          value={categoria}
          onChange={(e) => onChangeCategoria(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Marcas com Checkbox */}
      <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
        <legend className="field-label-mono" style={{ display: 'block', marginBottom: 8, padding: 0 }}>
          Marca
        </legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {marcasDisponiveis.map((marca) => {
            const checked = selectedMarcas.includes(marca);
            return (
              <label
                key={marca}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 30,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleMarca(marca)}
                  style={{ accentColor: '#006375', width: 18, height: 18 }}
                />
                {marca}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Preço Máximo com Slider */}
      <div>
        <label htmlFor={precoRangeId} className="field-label-mono" style={{ display: 'block', marginBottom: 6 }}>
          Preço Máximo
        </label>
        <input
          id={precoRangeId}
          type="range"
          min="50"
          max="1500"
          step="10"
          value={precoMaximo}
          onChange={(e) => onChangePrecoMaximo(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#006375' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>R$ 50</span>
          <span style={{ fontWeight: 700, color: '#006375' }}>Até {formatMoney(precoMaximo)}</span>
        </div>
      </div>

      {/* Distância em Pílulas */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="field-label-mono" style={{ margin: 0 }}>
            Distância
          </span>
          {userCoords ? (
            <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
              📍 GPS Ativo
            </span>
          ) : (
            <button
              type="button"
              onClick={onSolicitarLocalizacao}
              disabled={solicitandoLocalizacao}
              style={{
                background: 'none',
                border: 'none',
                color: '#006375',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              {solicitandoLocalizacao ? 'Obtendo...' : '📍 Ativar GPS'}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }} role="group" aria-label="Raio de distância">
          {(['5km', '15km', '+15km'] as const).map((dist) => (
            <button
              key={dist}
              type="button"
              aria-pressed={distanciaPill === dist}
              onClick={() => onChangeDistancia(dist)}
              style={{
                flex: 1,
                minHeight: 40,
                padding: '7px 0',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-strong)',
                fontFamily: 'var(--mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: distanciaPill === dist ? '#006375' : '#ffffff',
                color: distanciaPill === dist ? '#ffffff' : '#334155',
                transition: 'all 0.15s ease',
              }}
            >
              {dist}
            </button>
          ))}
        </div>
        {!userCoords && (
          <p style={{ margin: '6px 0 0', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
            Ative a localização para filtrar com precisão pelo raio selecionado.
          </p>
        )}
      </div>

      {/* Botão Limpar Filtros */}
      <button
        type="button"
        onClick={onLimparFiltros}
        className="btn"
        style={{
          background: '#ddf0f5',
          color: '#006375',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          padding: '10px 16px',
          fontFamily: 'var(--mono)',
          fontSize: '0.82rem',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Limpar Filtros
      </button>

      {/* Box da Garagem Virtual Ativa */}
      <div
        style={{
          border: '1px solid var(--border)',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: 14,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: '1.2rem' }} aria-hidden="true">🏍️</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#006375' }}>
            Garagem Virtual Ativa
          </span>
        </div>
        <p style={{ margin: '4px 0 10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Filtrando para:{' '}
          <strong style={{ color: '#0f172a' }}>
            {activeMoto ? `${activeMoto.marca} ${activeMoto.modelo} ${activeMoto.anoFabricacao}` : 'Nenhuma moto selecionada'}
          </strong>
        </p>
        <Link
          to="/garagem"
          className="btn btn-outline"
          style={{ width: '100%', padding: '6px 12px', fontSize: '0.78rem', textAlign: 'center' }}
        >
          Alterar Moto
        </Link>
      </div>
    </div>
  );
}
