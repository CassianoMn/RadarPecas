import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import {
  Button,
  ErrorState,
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
  const [lembrarMe, setLembrarMe] = useState(true);
  const [showResetInfo, setShowResetInfo] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const loggedUser = await login(email, senha, lembrarMe);
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--text)' }}>
              <input
                type="checkbox"
                checked={lembrarMe}
                onChange={(e) => setLembrarMe(e.target.checked)}
              />
              Lembrar-me
            </label>
            <button
              type="button"
              onClick={() => setShowResetInfo((prev) => !prev)}
              aria-expanded={showResetInfo}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Esqueceu a senha?
            </button>
          </div>

          {showResetInfo && (
            <div
              role="status"
              style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                color: '#0369a1',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: '0.82rem',
                lineHeight: 1.45,
              }}
            >
              Para redefinir sua senha nesta versão acadêmica, acesse seu perfil após entrar ou entre em contato com o suporte do RadarPeças informando seu e-mail cadastrado.
            </div>
          )}

          {error ? <ErrorState text={error} /> : null}

          <Button type="submit" block disabled={sending} style={{ padding: '12px' }}>
            {sending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

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
