import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import type { LocalizacaoSugestao } from '../types';
import { Bike, Store, FileText, Mail, MapPin, Lock, User, Check } from 'lucide-react';
import { Button, ErrorState, EyeIcon, EyeOffIcon, Field, TextInput } from '../components/ui';

function isCnpjValido(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;

  const calcDv = (slice: string, weights: number[]) => {
    const sum = slice.split('').reduce((acc, ch, idx) => acc + Number(ch) * weights[idx], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const dv1 = calcDv(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = calcDv(digits.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return Number(digits[12]) === dv1 && Number(digits[13]) === dv2;
}

export function CadastroPage() {
  const { registerMotociclista, registerLojista } = useAuth();
  const navigate = useNavigate();

  const [tipoConta, setTipoConta] = useState<'motociclista' | 'loja'>('motociclista');
  const [nome, setNome] = useState('');
  const [nomeLoja, setNomeLoja] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [enderecoLoja, setEnderecoLoja] = useState('');
  const [coordsSelecionadas, setCoordsSelecionadas] = useState<{ lat: number; lon: number } | null>(null);
  const [sugestoesEndereco, setSugestoesEndereco] = useState<LocalizacaoSugestao[]>([]);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const geocodeAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (tipoConta !== 'loja' || coordsSelecionadas) {
      setSugestoesEndereco([]);
      return;
    }

    const q = enderecoLoja.trim();
    if (q.length < 4) {
      setSugestoesEndereco([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      geocodeAbortRef.current?.abort();
      const controller = new AbortController();
      geocodeAbortRef.current = controller;
      setBuscandoEndereco(true);
      try {
        const res = await api<LocalizacaoSugestao[]>(
          `/geocoding/sugestoes?q=${encodeURIComponent(q)}&limite=5`,
          { signal: controller.signal }
        );
        setSugestoesEndereco(res ?? []);
      } catch {
        setSugestoesEndereco([]);
      } finally {
        if (geocodeAbortRef.current === controller) {
          setBuscandoEndereco(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      geocodeAbortRef.current?.abort();
    };
  }, [enderecoLoja, tipoConta, coordsSelecionadas]);

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

    if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha)) {
      setError('A senha deve ter no mínimo 8 caracteres, com letras e números.');
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
        if (cnpj.trim() && !isCnpjValido(cnpj)) {
          setError('O CNPJ informado é inválido. Verifique os 14 dígitos ou deixe em branco.');
          setSending(false);
          return;
        }
        if (!enderecoLoja.trim() || enderecoLoja.trim().length < 5) {
          setError('Informe o endereço principal da loja (rua, cidade e UF).');
          setSending(false);
          return;
        }
        await registerLojista({
          nome: nomeLoja.trim(),
          nomeFantasia: nomeLoja.trim(),
          cnpj: cnpj.trim() || undefined,
          email: email.trim(),
          senha,
          enderecoCompleto: enderecoLoja.trim(),
          latitude: coordsSelecionadas?.lat,
          longitude: coordsSelecionadas?.lon,
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
                    placeholder="Ex: MotoPeças Itabaiana"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </Field>

              <Field label="CNPJ (Opcional)">
                <div style={{ position: 'relative' }}>
                  <FileText size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <TextInput
                    type="text"
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

              <Field label="Endereço Principal">
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <TextInput
                    type="text"
                    required
                    value={enderecoLoja}
                    onChange={(e) => {
                      setEnderecoLoja(e.target.value);
                      setCoordsSelecionadas(null);
                    }}
                    placeholder="Ex: Av. Ivo de Carvalho, 500 - Centro, Itabaiana - SE"
                    style={{ paddingLeft: 38 }}
                  />
                  {buscandoEndereco && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                      Buscando endereço no mapa...
                    </span>
                  )}
                  {coordsSelecionadas && (
                    <span style={{ fontSize: '0.76rem', color: '#047857', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontWeight: 600 }}>
                      <Check size={14} /> Localização confirmada no mapa
                    </span>
                  )}
                  {sugestoesEndereco.length > 0 && (
                    <ul
                      role="listbox"
                      style={{
                        listStyle: 'none',
                        margin: '6px 0 0',
                        padding: 0,
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--radius-sm)',
                        background: '#ffffff',
                        maxHeight: 190,
                        overflowY: 'auto',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {sugestoesEndereco.map((s, idx) => (
                        <li key={`${s.latitude}-${s.longitude}-${idx}`}>
                          <button
                            type="button"
                            onClick={() => {
                              setEnderecoLoja(s.nomeFormatadoPadrao || s.displayName);
                              setCoordsSelecionadas({ lat: s.latitude, lon: s.longitude });
                              setSugestoesEndereco([]);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 12px',
                              border: 'none',
                              borderBottom: '1px solid var(--border)',
                              background: 'transparent',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                            }}
                          >
                            <strong style={{ display: 'block', color: 'var(--text)' }}>{s.titulo}</strong>
                            <span style={{ color: 'var(--text-muted)' }}>{s.subtitulo || s.displayName}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
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
