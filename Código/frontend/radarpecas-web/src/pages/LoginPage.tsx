import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { Button, ErrorState, Field, TextInput } from '../components/ui';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="narrow">
      <h1>Entrar</h1>
      <form onSubmit={onSubmit} className="form">
        <Field label="E-mail">
          <TextInput
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </Field>
        <Field label="Senha">
          <TextInput
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        {error ? <ErrorState text={error} /> : null}
        <Button type="submit" disabled={sending}>
          {sending ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <p>
        Sem conta? <Link className="link" to="/cadastro">Cadastre-se</Link>
      </p>
    </section>
  );
}
