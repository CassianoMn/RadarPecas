import { NavLink, useLocation } from 'react-router-dom';
import { Bike, Home, Store, Tag, UserCircle } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

export function MobileTabBar() {
  const { user } = useAuth();
  const location = useLocation();

  const isPromocoes =
    location.pathname === '/busca' && location.search.includes('apenasPromocoes=true');

  const isPerfilActive =
    location.pathname === '/perfil' || (!user && location.pathname === '/login');

  return (
    <nav className="mobile-tab-bar" aria-label="Navegação Mobile">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `mobile-tab-item${isActive ? ' active' : ''}`}
      >
        <Home size={22} aria-hidden="true" />
        <span>Explorar</span>
      </NavLink>

      <NavLink
        to="/lojas"
        className={({ isActive }) => `mobile-tab-item${isActive ? ' active' : ''}`}
      >
        <Store size={22} aria-hidden="true" />
        <span>Lojas</span>
      </NavLink>

      <NavLink
        to="/busca?apenasPromocoes=true"
        className={`mobile-tab-item${isPromocoes ? ' active' : ''}`}
        aria-current={isPromocoes ? 'page' : undefined}
      >
        <Tag size={22} aria-hidden="true" />
        <span>Promoções</span>
      </NavLink>

      <NavLink
        to="/garagem"
        className={({ isActive }) => `mobile-tab-item${isActive ? ' active' : ''}`}
      >
        <Bike size={22} aria-hidden="true" />
        <span>Garagem</span>
      </NavLink>

      <NavLink
        to={user ? '/perfil' : '/login'}
        className={`mobile-tab-item${isPerfilActive ? ' active' : ''}`}
        aria-current={isPerfilActive ? 'page' : undefined}
      >
        <UserCircle size={22} aria-hidden="true" />
        <span>{user ? 'Perfil' : 'Entrar'}</span>
      </NavLink>
    </nav>
  );
}
