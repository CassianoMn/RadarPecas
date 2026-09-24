import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { ArrowLeftIcon, RadarLogo, SearchIcon } from './ui';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [topSearch, setTopSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isHome = location.pathname === '/';
  const isLojistaPanel = location.pathname.startsWith('/lojista');
  const isFullWidth = isHome || isLojistaPanel;
  const isAuthPage = location.pathname === '/login' || location.pathname === '/cadastro';
  const isLojistaUser = user?.tipoUsuario === 'LOJISTA';

  function handleLogout() {
    logout();
    setShowUserDropdown(false);
    navigate('/login');
  }

  function handleTopSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (topSearch.trim()) {
      navigate(`/busca?termo=${encodeURIComponent(topSearch.trim())}`);
    }
  }

  function handleGoBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="shell">
      <header className="topbar">
        {/* Seta Voltar se não estiver na Home nem em Auth nem no Painel Lojista */}
        {!isHome && !isAuthPage && !isLojistaPanel && (
          <button
            type="button"
            className="topbar-back-btn"
            onClick={handleGoBack}
            aria-label="Voltar para a tela anterior"
            title="Voltar"
          >
            <ArrowLeftIcon size={18} />
          </button>
        )}

        {/* Marca & Logo Oficial */}
        <Link className="brand-wrapper" to={isLojistaUser ? '/lojista' : '/'}>
          <div className="brand-logo-icon">
            <RadarLogo size={32} />
          </div>
          <span className="brand-text">RadarPeças</span>
        </Link>

        {/* Navegação Principal */}
        {!isAuthPage && (
          <nav className="nav" aria-label="Navegação Principal">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Explorar
            </NavLink>
            <NavLink to="/lojas" className={({ isActive }) => (isActive ? 'active' : '')}>
              Lojas
            </NavLink>
            <NavLink
              to="/busca?apenasPromocoes=true"
              className={location.search.includes('apenasPromocoes=true') ? 'active' : ''}
            >
              Promoções
            </NavLink>
            {isLojistaUser && (
              <NavLink to="/lojista" className={({ isActive }) => (isActive ? 'active' : '')}>
                Dashboard
              </NavLink>
            )}
          </nav>
        )}

        {/* Barra de Busca rápida no centro/direita da topbar */}
        {!isHome && !isAuthPage && (
          <form onSubmit={handleTopSearchSubmit} className="topbar-search-form" role="search" style={{ marginLeft: 'auto', marginRight: 12 }}>
            <span className="topbar-search-icon" aria-hidden="true">
              <SearchIcon size={16} />
            </span>
            <input
              type="search"
              className="topbar-search-input"
              placeholder={isLojistaPanel ? 'Buscar no inventário...' : 'Buscar peças...'}
              value={topSearch}
              onChange={(e) => setTopSearch(e.target.value)}
              aria-label="Buscar peças rapidamente"
            />
          </form>
        )}

        {/* Ações do Usuário (Painel Lojista / Garagem + Perfil) */}
        <div className="userbox" style={{ marginLeft: isHome || isAuthPage ? 'auto' : 0 }}>
          {!isAuthPage && !isLojistaUser && (
            <Link className="btn-garage-top" to="/garagem">
              Garagem Virtual
            </Link>
          )}

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={isLojistaUser ? 'btn btn-ghost' : 'avatar-badge'}
                onClick={() => setShowUserDropdown((v) => !v)}
                title={user.nome}
                aria-label="Menu do Usuário"
                style={
                  isLojistaUser
                    ? {
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        borderRadius: 999,
                        border: '1px solid var(--border)',
                        background: '#ffffff',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        fontSize: '0.84rem',
                      }
                    : undefined
                }
              >
                {isLojistaUser ? (
                  <>
                    <UserCircle size={18} />
                    <span>{user.nome}</span>
                  </>
                ) : (
                  user.nome.slice(0, 2).toUpperCase()
                )}
              </button>

              {showUserDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: 190,
                    padding: '8px 0',
                    zIndex: 1100,
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
                    <strong style={{ display: 'block', fontSize: '0.88rem' }}>{user.nome}</strong>
                    <small style={{ color: 'var(--text-muted)' }}>{user.email}</small>
                  </div>
                  {isLojistaUser && (
                    <Link
                      to="/lojista"
                      style={{
                        display: 'block',
                        padding: '8px 16px',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                      }}
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Painel Lojista
                    </Link>
                  )}
                  <Link
                    to="/garagem"
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                    }}
                    onClick={() => setShowUserDropdown(false)}
                  >
                    Minha Garagem
                  </Link>
                  <Link
                    to="/perfil"
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                    }}
                    onClick={() => setShowUserDropdown(false)}
                  >
                    Gerenciar Conta
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      padding: '8px 16px',
                      color: 'var(--accent-red)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    Sair da Conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isAuthPage && (
              <Link className="btn btn-outline" to="/login" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
                Entrar
              </Link>
            )
          )}
        </div>
      </header>

      {/* Conteúdo da Página: full width se for a tela de Explorar ou Painel Lojista, ou content-wrap com margem nas outras telas */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isFullWidth ? <Outlet /> : <div className="content-wrap"><Outlet /></div>}
      </main>
    </div>
  );
}
