import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { Bike, Store, FileText, Mail, MapPin, Lock, User } from 'lucide-react';
import { Button, ErrorState, EyeIcon, EyeOffIcon, Field, TextInput } from '../components/ui';

export function CadastroPage() {
  const { registerMotociclista, registerLojista } = useAuth();
  const navigate = useNavigate();

  const [tipoConta, setTipoConta] = useState<'motociclista' | 'loja'>('motociclista');
  const [nome, setNome] = useState('');
  const [nomeLoja, setNomeLoja] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [enderecoLoja, setEnderecoLoja] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  function formatCnpj(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (tipoConta === 'motociclista' && senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setSending(true);
    try {
      if (tipoConta === 'loja') {
        if (!nomeLoja.trim()) {
          setError('Informe o nome da loja.');
          setSending(false);
          return;
        }
        await registerLojista({
          nome: nomeLoja.trim(),
          nomeFantasia: nomeLoja.trim(),
          cnpj: cnpj.trim() || undefined,
          email: email.trim(),
          senha,
          enderecoCompleto: enderecoLoja.trim() || undefined,
        });
        navigate('/lojista', { replace: true });
      } else {
        await registerMotociclista(nome, email, senha);
        navigate('/garagem', { replace: true });
      }
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
            onClick={() => {
              setTipoConta('motociclista');
              setError('');
            }}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Bike size={16} />
            Sou Motociclista
          </button>
          <button
            type="button"
            className={`segmented-control-btn ${tipoConta === 'loja' ? 'active' : ''}`}
            onClick={() => {
              setTipoConta('loja');
              setError('');
            }}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Store size={16} />
            Tenho uma Loja
          </button>
        </div>

        <form onSubmit={onSubmit} className="form">
          {tipoConta === 'motociclista' ? (
            <>
              <Field label="Nome Completo">
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <TextInput
                    type="text"
                    required
                    autoComplete="name"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="João da Silva"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </Field>

              <Field label="E-mail">
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <TextInput
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joao@exemplo.com"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </Field>

              <Field label="Senha">
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <TextInput
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingLeft: 38, paddingRight: 40 }}
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
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <TextInput
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </Field>
            </>
          ) : (
            <>
              <Field label="Nome da Loja">
                <div style={{ position: 'relative' }}>
                  <Store size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <TextInput
                    type="text"
                    required
                    value={nomeLoja}
                    onChange={(e) => setNomeLoja(e.target.value)}
                    placeholder="Ex: MotoPeças Silva"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </Field>

              <Field label="CNPJ">
                <div style={{ position: 'relative' }}>
                  <FileText size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <TextInput
                    type="text"
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                    placeholder="00.000.000/0001-00"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </Field>

              <Field label="E-mail Comercial">
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <TextInput
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@sualoja.com"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </Field>

              <Field label="Endereço Principal (Opcional)">
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <TextInput
                    type="text"
                    value={enderecoLoja}
                    onChange={(e) => setEnderecoLoja(e.target.value)}
                    placeholder="Ex: Av. Tiradentes, 500 - Centro, São Paulo - SP"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </Field>

              <Field label="Senha">
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <TextInput
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingLeft: 38, paddingRight: 40 }}
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
            </>
          )}

          {error ? <ErrorState text={error} /> : null}

          <Button type="submit" block disabled={sending} style={{ padding: '12px', marginTop: 4 }}>
            {sending
              ? 'Criando Conta...'
              : tipoConta === 'loja'
                ? 'Criar Conta de Lojista'
                : 'Criar Conta'}
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
