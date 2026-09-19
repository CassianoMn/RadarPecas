import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ArrowLeftIcon, RadarLogo, SearchIcon } from './ui';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [topSearch, setTopSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isHome = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/cadastro';

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
        {/* Seta Voltar se não estiver na Home nem em Auth */}
        {!isHome && !isAuthPage && (
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
        <Link className="brand-wrapper" to="/">
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
          </nav>
        )}

        {/* Barra de Busca rápida no centro da topbar para telas internas */}
        {!isHome && !isAuthPage && (
          <form onSubmit={handleTopSearchSubmit} className="topbar-search-form" role="search">
            <span className="topbar-search-icon" aria-hidden="true">
              <SearchIcon size={16} />
            </span>
            <input
              type="search"
              className="topbar-search-input"
              placeholder="Buscar peças..."
              value={topSearch}
              onChange={(e) => setTopSearch(e.target.value)}
              aria-label="Buscar peças rapidamente"
            />
          </form>
        )}

        {/* Ações do Usuário (Garagem + Perfil) */}
        <div className="userbox">
          {!isAuthPage && (
            <Link className="btn-garage-top" to="/garagem">
              Garagem Virtual
            </Link>
          )}

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="avatar-badge"
                onClick={() => setShowUserDropdown((v) => !v)}
                title={user.nome}
                aria-label="Menu do Usuário"
              >
                {user.nome.slice(0, 2).toUpperCase()}
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

      {/* Conteúdo da Página: full width se for a tela de Explorar (mapa split-screen), ou content-wrap com margem nas outras telas */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isHome ? <Outlet /> : <div className="content-wrap"><Outlet /></div>}
      </main>
    </div>
  );
}
