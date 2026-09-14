import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

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
        <nav className="nav">
          <NavLink to="/">Início</NavLink>
          <NavLink to="/busca">Buscar</NavLink>
          <NavLink to="/garagem">Garagem</NavLink>
          <NavLink to="/lojas">Lojas</NavLink>
        </nav>
        <div className="userbox">
          {user ? (
            <>
              <span>{user.nome}</span>
              <button className="btn btn-ghost" type="button" onClick={handleLogout}>
                Sair
              </button>
            </>
          ) : (
            <Link className="btn" to="/login">
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
