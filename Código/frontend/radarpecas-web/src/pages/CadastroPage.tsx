import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { Button, ErrorState, EyeIcon, EyeOffIcon, Field, TextInput } from '../components/ui';

export function CadastroPage() {
  const { registerMotociclista } = useAuth();
  const navigate = useNavigate();

  const [tipoConta, setTipoConta] = useState<'motociclista' | 'loja'>('motociclista');
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

    if (tipoConta === 'loja') {
      alert('O cadastro de lojista via painel web administrativo está em fase de habilitação. Por favor contate o suporte ou cadastre-se como motociclista.');
      return;
    }

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
    <section className="auth-page-container">
      {/* Cabeçalho */}
      <div className="auth-header-block">
        <h1 style={{ fontSize: '1.9rem', marginBottom: 4 }}>Crie sua conta</h1>
        <p style={{ fontSize: '0.95rem', margin: 0 }}>Junte-se à maior rede de peças e oficinas.</p>
      </div>

      {/* Card de Cadastro */}
      <div className="auth-card-box">
        {/* Toggle Sou Motociclista / Tenho uma Loja */}
        <div className="segmented-control" style={{ marginBottom: 20 }}>
          <button
            type="button"
            className={`segmented-control-btn ${tipoConta === 'motociclista' ? 'active' : ''}`}
            onClick={() => setTipoConta('motociclista')}
          >
            Sou Motociclista
          </button>
          <button
            type="button"
            className={`segmented-control-btn ${tipoConta === 'loja' ? 'active' : ''}`}
            onClick={() => setTipoConta('loja')}
          >
            Tenho uma Loja
          </button>
        </div>

        <form onSubmit={onSubmit} className="form">
          <Field label="Nome Completo">
            <TextInput
              type="text"
              required
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="João da Silva"
            />
          </Field>

          <Field label="E-mail">
            <TextInput
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@exemplo.com"
            />
          </Field>

          <Field label="Senha">
            <div style={{ position: 'relative' }}>
              <TextInput
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                className="password-eye-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </Field>

          <Field label="Confirmar Senha">
            <TextInput
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error ? <ErrorState text={error} /> : null}

          <Button type="submit" block disabled={sending} style={{ padding: '12px', marginTop: 4 }}>
            {sending ? 'Criando Conta...' : 'Criar Conta'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Já tem uma conta?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Entrar
          </Link>
        </div>
      </div>
    </section>
  );
}
