import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import {
  AppleIcon,
  Button,
  ErrorState,
  GoogleIcon,
  InputWithIcon,
  LockIcon,
  MailIcon,
  RadarLogo,
} from '../components/ui';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrarMe, setLembrarMe] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const loggedUser = await login(email, senha);
      if (loggedUser.tipoUsuario === 'LOJISTA' && from === '/') {
        navigate('/lojista', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar. Verifique seus dados.');
    } finally {
      setSending(false);
    }
  }

  function handleSocialLogin(provider: string) {
    alert(`Autenticação com ${provider} estará disponível em breve na versão de produção.`);
  }

  return (
    <section className="auth-page-container">
      {/* Cabeçalho de Identidade Visual */}
      <div className="auth-header-block">
        <div style={{ display: 'inline-flex', marginBottom: 12 }}>
          <RadarLogo size={70} />
        </div>
        <h1 style={{ fontSize: '1.9rem', color: 'var(--primary)', marginBottom: 4 }}>RadarPeças</h1>
        <p style={{ fontSize: '0.95rem', margin: 0 }}>Acesso ao ecossistema de motopeças</p>
      </div>

      {/* Card de Login */}
      <div className="auth-card-box">
        <form onSubmit={onSubmit} className="form">
          <InputWithIcon
            icon={<MailIcon />}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
          />

          <InputWithIcon
            icon={<LockIcon />}
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
          />

          {/* Lembrar-me e Esqueceu a Senha */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--text)' }}>
              <input
                type="checkbox"
                checked={lembrarMe}
                onChange={(e) => setLembrarMe(e.target.checked)}
              />
              Lembrar-me
            </label>
            <a
              href="#esqueceu-senha"
              onClick={(e) => {
                e.preventDefault();
                alert('Instruções para redefinir a senha serão enviadas para o seu e-mail cadastrado.');
              }}
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              Esqueceu a senha?
            </a>
          </div>

          {error ? <ErrorState text={error} /> : null}

          <Button type="submit" block disabled={sending} style={{ padding: '12px' }}>
            {sending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* Divisor "Ou continue com" */}
        <div className="auth-divider-line">
          <span>Ou continue com</span>
        </div>

        {/* Botões Sociais Google & Apple */}
        <div className="social-auth-row">
          <button
            type="button"
            className="social-auth-btn"
            onClick={() => handleSocialLogin('Google')}
            title="Entrar com Google"
            aria-label="Entrar com Google"
          >
            <GoogleIcon size={20} />
          </button>
          <button
            type="button"
            className="social-auth-btn"
            onClick={() => handleSocialLogin('Apple')}
            title="Entrar com Apple"
            aria-label="Entrar com Apple"
          >
            <AppleIcon size={20} />
          </button>
        </div>

        {/* Link para Cadastro */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Não tem uma conta?{' '}
          <Link to="/cadastro" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Cadastre-se
          </Link>
        </div>
      </div>
    </section>
  );
}
