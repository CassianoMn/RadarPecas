import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" to="/">
          RadarPeças
        </Link>
        <nav className="nav" aria-label="Principal">
          <NavLink to="/">Explorar</NavLink>
          <NavLink to="/busca">Buscar</NavLink>
          <NavLink to="/lojas">Lojas</NavLink>
        </nav>
        <div className="userbox">
          <Link className="btn" to="/garagem">
            Garagem Virtual
          </Link>
          {user ? (
            <>
              <span className="avatar" title={user.nome}>
                {initials(user.nome)}
              </span>
              <button className="btn btn-ghost" type="button" onClick={handleLogout}>
                Sair
              </button>
            </>
          ) : (
            <Link className="btn btn-outline" to="/login">
              Entrar
            </Link>
          )}
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <footer className="footer">
        <small>RadarPeças · TCC UFS</small>
      </footer>
    </div>
  );
}
