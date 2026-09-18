import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { Button, ErrorState, Field, InputWithIcon } from '../components/ui';

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

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

export function CadastroPage() {
  const { registerMotociclista } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setSending(true);
    try {
      await registerMotociclista(nome, email, senha);
      navigate('/garagem', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível realizar o cadastro.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="auth-wrap">
      <div className="auth-brand">
        <h1>Criar Conta de Motociclista</h1>
        <p>Cadastre sua moto, encontre peças compatíveis e explore lojas próximas</p>
      </div>
      <div className="card auth-card">
        <form onSubmit={onSubmit} className="form">
          <Field label="Nome completo">
            <InputWithIcon
              icon={<UserIcon />}
              type="text"
              required
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João da Silva"
            />
          </Field>

          <Field label="E-mail">
            <InputWithIcon
              icon={<MailIcon />}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
            />
          </Field>

          <Field label="Senha">
            <InputWithIcon
              icon={<LockIcon />}
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
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

          <Field label="Confirmar Senha">
            <InputWithIcon
              icon={<LockIcon />}
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a senha"
            />
          </Field>

          {error ? <ErrorState text={error} /> : null}

          <Button type="submit" block disabled={sending}>
            {sending ? 'Cadastrando...' : 'Cadastrar e Ir para Garagem'}
          </Button>
        </form>

        <p className="auth-alt">
          Já possui conta? <Link className="link" to="/login">Entrar</Link>
        </p>
      </div>
    </section>
  );
}
