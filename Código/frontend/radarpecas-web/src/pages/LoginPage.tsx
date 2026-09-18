import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { Button, ErrorState, Field, InputWithIcon } from '../components/ui';

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await login(email, senha);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="auth-wrap">
      <div className="auth-brand">
        <h1>RadarPeças</h1>
        <p>Acesso ao ecossistema de motopeças</p>
      </div>
      <div className="card auth-card">
        <form onSubmit={onSubmit} className="form">
          <Field label="E-mail">
            <InputWithIcon
              icon={<MailIcon />}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
            />
          </Field>
          <Field label="Senha">
            <InputWithIcon
              icon={<LockIcon />}
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              action={
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              }
            />
          </Field>
          {error ? <ErrorState text={error} /> : null}
          <Button type="submit" block disabled={sending}>
            {sending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <p className="auth-alt">
          Não tem uma conta? <Link className="link" to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </section>
  );
}
