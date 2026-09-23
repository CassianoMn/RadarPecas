import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useActiveMoto } from '../context/useActiveMoto';
import { api, ApiError } from '../lib/api';
import type { GaragemItem } from '../types';
import {
  ArrowLeftIcon,
  Button,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  Field,
  LockIcon,
  MailIcon,
  TextInput,
  UserIcon,
} from '../components/ui';

export function PerfilPage() {
  const { user, updateProfile, refreshUser, logout } = useAuth();
  const { activeMoto } = useActiveMoto();
  const navigate = useNavigate();

  // Estados dos campos
  const [nome, setNome] = useState(user?.nome ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

  // Toggles de visibilidade de senha
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  // Estados de feedback
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Resumo da garagem
  const [totalMotos, setTotalMotos] = useState<number | null>(null);

  // Sincroniza campos se o usuário mudar
  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
    }
  }, [user]);

  // Carrega contagem da garagem
  useEffect(() => {
    api<GaragemItem[]>('/garagem')
      .then((motos) => setTotalMotos(motos ? motos.length : 0))
      .catch(() => setTotalMotos(null));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!nome.trim()) {
      setErrorMsg('O nome completo é obrigatório.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Informe um endereço de e-mail válido.');
      return;
    }

    // Se preencheu algum campo de senha
    const querAlterarSenha = Boolean(senhaAtual || novaSenha || confirmarNovaSenha);

    if (querAlterarSenha) {
      if (!senhaAtual) {
        setErrorMsg('Informe sua senha atual para autorizar a alteração de senha.');
        return;
      }
      if (!novaSenha || novaSenha.length < 6) {
        setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (novaSenha !== confirmarNovaSenha) {
        setErrorMsg('A confirmação da nova senha não coincide.');
        return;
      }
    }

    setSaving(true);
    try {
      await updateProfile({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senhaAtual: querAlterarSenha ? senhaAtual : undefined,
        novaSenha: querAlterarSenha ? novaSenha : undefined,
      });

      setSuccessMsg('Seus dados foram atualizados com sucesso!');
      // Limpa os campos de senha
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
      await refreshUser();
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível atualizar o perfil. Verifique os dados e tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
    }
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setErrorMsg('');
    setSuccessMsg('');
  }

  function handleLogout() {
    if (window.confirm('Deseja realmente sair da sua conta?')) {
      logout();
      navigate('/login');
    }
  }

  const userInitials = (user?.nome ?? 'U')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="perfil-page-container">
      {/* Navegação de Topo / Breadcrumb */}
      <nav className="perfil-breadcrumb" aria-label="Navegação">
        <Link to="/" className="perfil-back-link">
          <ArrowLeftIcon size={18} />
          <span>Voltar para Início</span>
        </Link>
        <span className="perfil-breadcrumb-separator">/</span>
        <span className="perfil-breadcrumb-current">Gerenciar Conta</span>
      </nav>

      {/* Cabeçalho da Página */}
      <header className="perfil-header">
        <div className="perfil-header-title-box">
          <h1 className="perfil-title">Gerenciar Conta</h1>
          <p className="perfil-subtitle">
            Consulte e atualize seus dados cadastrais, e-mail e credenciais de segurança.
          </p>
        </div>
      </header>

      {/* Card de Identidade do Usuário */}
      <div className="perfil-identity-card">
        <div className="perfil-avatar-circle" aria-hidden="true">
          {userInitials}
        </div>
        <div className="perfil-identity-info">
          <div className="perfil-identity-name-row">
            <h2 className="perfil-user-name">{user?.nome}</h2>
            <span className="perfil-role-badge">
              {user?.tipoUsuario === 'LOJISTA' ? 'Lojista' : 'Motociclista'}
            </span>
          </div>
          <p className="perfil-user-email">{user?.email}</p>
        </div>
      </div>

      {/* Mensagens de Sucesso e Erro */}
      {successMsg && (
        <div className="perfil-alert-success" role="status">
          <CheckIcon size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="perfil-alert-error" role="alert">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid de Conteúdo: Formulário e Painel Lateral */}
      <div className="perfil-grid">
        {/* Coluna Principal: Formulário */}
        <main className="perfil-main-column">
          <form onSubmit={handleSubmit} className="perfil-form" noValidate>
            {/* Seção 1: Dados Pessoais */}
            <section className="perfil-section-card">
              <div className="perfil-section-header">
                <div className="perfil-section-icon" aria-hidden="true">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="perfil-section-title">Dados Pessoais</h3>
                  <p className="perfil-section-desc">
                    Mantenha seu nome e e-mail sempre atualizados para receber notificações.
                  </p>
                </div>
              </div>

              <div className="perfil-fields-group">
                <Field label="Nome Completo">
                  <div className="input-with-icon-wrap">
                    <span className="input-icon-left" aria-hidden="true">
                      <UserIcon size={16} />
                    </span>
                    <TextInput
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Carlos Eduardo Menezes"
                    />
                  </div>
                </Field>

                <Field label="Endereço de E-mail">
                  <div className="input-with-icon-wrap">
                    <span className="input-icon-left" aria-hidden="true">
                      <MailIcon size={16} />
                    </span>
                    <TextInput
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                    />
                  </div>
                  <span className="helper-text">
                    Este e-mail é utilizado para efetuar login na plataforma.
                  </span>
                </Field>
              </div>
            </section>

            {/* Seção 2: Segurança & Senha */}
            <section className="perfil-section-card">
              <div className="perfil-section-header">
                <div className="perfil-section-icon" aria-hidden="true">
                  <LockIcon size={20} />
                </div>
                <div>
                  <h3 className="perfil-section-title">Segurança de Acesso</h3>
                  <p className="perfil-section-desc">
                    Altere sua senha de acesso. Deixe os campos em branco se desejar manter a senha atual.
                  </p>
                </div>
              </div>

              <div className="perfil-fields-group">
                <Field label="Senha Atual">
                  <div className="input-with-icon-wrap">
                    <span className="input-icon-left" aria-hidden="true">
                      <LockIcon size={16} />
                    </span>
                    <TextInput
                      type={showSenhaAtual ? 'text' : 'password'}
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      placeholder="Informe sua senha atual"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-eye-toggle"
                      onClick={() => setShowSenhaAtual((v) => !v)}
                      aria-label={showSenhaAtual ? 'Ocultar senha atual' : 'Mostrar senha atual'}
                    >
                      {showSenhaAtual ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </Field>

                <div className="perfil-passwords-row">
                  <Field label="Nova Senha">
                    <div className="input-with-icon-wrap">
                      <span className="input-icon-left" aria-hidden="true">
                        <LockIcon size={16} />
                      </span>
                      <TextInput
                        type={showNovaSenha ? 'text' : 'password'}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-eye-toggle"
                        onClick={() => setShowNovaSenha((v) => !v)}
                        aria-label={showNovaSenha ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                      >
                        {showNovaSenha ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirmar Nova Senha">
                    <div className="input-with-icon-wrap">
                      <span className="input-icon-left" aria-hidden="true">
                        <LockIcon size={16} />
                      </span>
                      <TextInput
                        type={showConfirmarSenha ? 'text' : 'password'}
                        value={confirmarNovaSenha}
                        onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                        placeholder="Repita a nova senha"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-eye-toggle"
                        onClick={() => setShowConfirmarSenha((v) => !v)}
                        aria-label={showConfirmarSenha ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                      >
                        {showConfirmarSenha ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                  </Field>
                </div>
              </div>
            </section>

            {/* Ações do Formulário */}
            <div className="perfil-actions-bar">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Salvando Alterações...' : 'Salvar Alterações'}
              </Button>
              <Button type="button" variant="ghost" onClick={handleReset} disabled={saving}>
                Descartar Alterações
              </Button>
            </div>
          </form>
        </main>

        {/* Coluna Lateral: Resumo da Garagem e Atalhos */}
        <aside className="perfil-sidebar">
          {/* Card Resumo Garagem */}
          <div className="perfil-side-card">
            <h4 className="perfil-side-title">Garagem Virtual</h4>
            <p className="perfil-side-text">
              Sua garagem ajuda o RadarPeças a sugerir apenas peças compatíveis com sua moto.
            </p>

            <div className="perfil-garage-stats">
              <div className="perfil-stat-item">
                <span className="perfil-stat-number">{totalMotos !== null ? totalMotos : '—'}</span>
                <span className="perfil-stat-label">
                  {totalMotos === 1 ? 'Moto Cadastrada' : 'Motos Cadastradas'}
                </span>
              </div>
            </div>

            {activeMoto ? (
              <div className="perfil-active-moto-box">
                <span className="perfil-active-moto-tag">Moto Ativa para Busca</span>
                <strong className="perfil-active-moto-name">
                  {activeMoto.marca} {activeMoto.modelo} ({activeMoto.anoFabricacao})
                </strong>
                {activeMoto.apelido && (
                  <span className="perfil-active-moto-alias">"{activeMoto.apelido}"</span>
                )}
              </div>
            ) : null}

            <Link to="/garagem" className="btn btn-outline btn-block" style={{ marginTop: 16 }}>
              Acessar Minha Garagem
            </Link>
          </div>

          {/* Card Segurança e Boas Práticas */}
          <div className="perfil-side-card">
            <h4 className="perfil-side-title">Dica de Segurança</h4>
            <p className="perfil-side-text">
              Utilize uma senha com pelo menos 6 caracteres combinando letras e números para maior
              proteção da sua conta.
            </p>
          </div>

          {/* Encerramento da Sessão */}
          <div className="perfil-side-card perfil-danger-zone">
            <h4 className="perfil-side-title" style={{ color: 'var(--accent-red)' }}>
              Sessão
            </h4>
            <p className="perfil-side-text">
              Deseja encerrar seu acesso neste dispositivo?
            </p>
            <Button
              type="button"
              variant="danger"
              className="btn-block"
              onClick={handleLogout}
            >
              Sair da Conta
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
