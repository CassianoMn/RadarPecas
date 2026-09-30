import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { ArrowLeftIcon, RadarLogo, SearchIcon } from './ui';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [topSearch, setTopSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const isHome = location.pathname === '/';
  const isLojistaPanel =
    location.pathname === '/lojista' || location.pathname.startsWith('/lojista/');
  const isFullWidth = isHome || isLojistaPanel;
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/cadastro';
  const isLojistaUser = user?.tipoUsuario === 'LOJISTA';

  // Fechar dropdown ao navegar para outra rota
  useEffect(() => {
    setShowUserDropdown(false);
  }, [location.pathname]);

  // Fechar dropdown ao clicar fora ou pressionar Escape (mouse e touch)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowUserDropdown(false);
        triggerButtonRef.current?.focus();
      }
    }

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserDropdown]);

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
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Explorar
            </NavLink>
            <NavLink
              to="/lojas"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Lojas
            </NavLink>
            <NavLink
              to="/busca?apenasPromocoes=true"
              className={
                location.search.includes('apenasPromocoes=true') ? 'active' : ''
              }
            >
              Promoções
            </NavLink>
            {isLojistaUser && (
              <NavLink
                to="/lojista"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                Dashboard
              </NavLink>
            )}
          </nav>
        )}

        {/* Barra de Busca rápida no centro/direita da topbar */}
        {!isHome && !isAuthPage && (
          <form
            onSubmit={handleTopSearchSubmit}
            className="topbar-search-form"
            role="search"
            style={{ marginLeft: 'auto', marginRight: 12 }}
          >
            <span className="topbar-search-icon" aria-hidden="true">
              <SearchIcon size={16} />
            </span>
            <input
              type="search"
              className="topbar-search-input"
              placeholder={
                isLojistaPanel ? 'Buscar no inventário...' : 'Buscar peças...'
              }
              value={topSearch}
              onChange={(e) => setTopSearch(e.target.value)}
              aria-label="Buscar peças rapidamente"
            />
          </form>
        )}

        {/* Ações do Usuário (Painel Lojista / Garagem + Perfil) */}
        <div
          className="userbox"
          style={{ marginLeft: isHome || isAuthPage ? 'auto' : 0 }}
        >
          {!isAuthPage && !isLojistaUser && (
            <Link className="btn-garage-top" to="/garagem">
              Garagem Virtual
            </Link>
          )}

          {user ? (
            <div ref={userDropdownRef} style={{ position: 'relative' }}>
              <button
                ref={triggerButtonRef}
                type="button"
                className={
                  isLojistaUser
                    ? `lojista-badge-btn${showUserDropdown ? ' open' : ''}`
                    : `avatar-badge${showUserDropdown ? ' open' : ''}`
                }
                onClick={() => setShowUserDropdown((v) => !v)}
                title={user.nome}
                aria-label="Menu do Usuário"
                aria-expanded={showUserDropdown}
                aria-haspopup="true"
              >
                {isLojistaUser ? (
                  <>
                    <UserCircle size={18} />
                    <span>{user.nome}</span>
                  </>
                ) : (
                  (user.nome || 'U').slice(0, 2).toUpperCase()
                )}
              </button>

              {showUserDropdown && (
                <div
                  className="user-dropdown-menu"
                  role="menu"
                  aria-label="Opções do usuário"
                >
                  <div className="user-dropdown-header">
                    <strong>{user.nome}</strong>
                    <small>{user.email}</small>
                  </div>
                  <div className="user-dropdown-body">
                    {isLojistaUser && (
                      <NavLink
                        to="/lojista"
                        role="menuitem"
                        className={({ isActive }) =>
                          `user-dropdown-item${isActive ? ' active' : ''}`
                        }
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Painel Lojista
                      </NavLink>
                    )}
                    <NavLink
                      to="/garagem"
                      role="menuitem"
                      className={({ isActive }) =>
                        `user-dropdown-item${isActive ? ' active' : ''}`
                      }
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Minha Garagem
                    </NavLink>
                    <NavLink
                      to="/perfil"
                      role="menuitem"
                      className={({ isActive }) =>
                        `user-dropdown-item${isActive ? ' active' : ''}`
                      }
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Gerenciar Conta
                    </NavLink>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="user-dropdown-logout"
                  >
                    Sair da Conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isAuthPage && (
              <Link
                className="btn btn-outline"
                to="/login"
                style={{ padding: '7px 14px', fontSize: '0.8rem' }}
              >
                Entrar
              </Link>
            )
          )}
        </div>
      </header>

      {/* Conteúdo da Página: full width se for a tela de Explorar ou Painel Lojista, ou content-wrap com margem nas outras telas */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isFullWidth ? (
          <Outlet />
        ) : (
          <div className="content-wrap">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}
