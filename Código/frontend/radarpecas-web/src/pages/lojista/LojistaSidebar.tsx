import { Archive, BarChart2, LayoutGrid, Store, Tag } from 'lucide-react';
import { SmartImage } from '../../components/SmartImage';
import type { Loja } from '../../types';
import type { LojistaTab } from './lojistaTypes';

interface LojistaSidebarProps {
  activeTab: LojistaTab;
  onSelectTab: (tab: LojistaTab) => void;
  loja: Loja | null;
  fotoPerfilUrl?: string;
}

const NAV_ITEMS = [
  { id: 'resumo', label: 'Resumo', icon: LayoutGrid },
  { id: 'estoque', label: 'Estoque e Preços', icon: Archive },
  { id: 'ofertas', label: 'Ofertas Ativas', icon: Tag },
  { id: 'mais-procurados', label: 'Mais Procurados', icon: BarChart2 },
  { id: 'perfil', label: 'Perfil da Loja', icon: Store },
] as const;

export function LojistaSidebar({
  activeTab,
  onSelectTab,
  loja,
  fotoPerfilUrl,
}: LojistaSidebarProps) {
  const logoSrc = fotoPerfilUrl || loja?.fotoPerfilUrl || '';

  return (
    <aside className="lojista-sidebar">
      <div className="lojista-sidebar-kicker">GESTÃO LOJISTA</div>

      <div className="lojista-sidebar-brand">
        <div className="lojista-sidebar-logo">
          {logoSrc ? (
            <SmartImage
              src={logoSrc}
              alt={loja?.nomeFantasia || 'Loja'}
              width={38}
              height={38}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Store size={18} color="#006375" />
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="lojista-sidebar-name" title={loja?.nomeFantasia || 'Minha Loja'}>
            {loja?.nomeFantasia || 'Minha Loja'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Loja Oficial</div>
        </div>
      </div>

      <div className="lojista-sidebar-nav-list">
        {NAV_ITEMS.map((nav) => {
          const IconComponent = nav.icon;
          const isSelected =
            activeTab === nav.id ||
            (nav.id === 'estoque' && activeTab === 'novo-produto') ||
            (nav.id === 'ofertas' && activeTab === 'criar-oferta');

          return (
            <button
              key={nav.id}
              type="button"
              onClick={() => onSelectTab(nav.id as LojistaTab)}
              className={`lojista-nav-btn${isSelected ? ' lojista-nav-btn--active' : ''}`}
            >
              <IconComponent size={18} strokeWidth={isSelected ? 2.3 : 1.9} />
              <span>{nav.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
