import type { ChangeEvent, FormEvent } from 'react';
import {
  Clock,
  ImagePlus,
  Mail,
  MapPin,
  Pencil,
  Phone,
  PlusCircle,
  ShieldCheck,
  Store,
  Trash2,
  Upload,
} from 'lucide-react';
import { SmartImage } from '../../components/SmartImage';
import { Button, Field, TextInput } from '../../components/ui';
import { DEFAULT_HORARIOS_LOJA, type HorarioDia } from '../../lib/formatters';
import type { User } from '../../auth/AuthContext';
import type { Loja } from '../../types';
import { PRODUCT_BANNER_IMAGES } from './lojistaTypes';

interface FotoGaleria {
  title: string;
  url: string;
}

interface LojistaPerfilTabProps {
  loja: Loja | null;
  user: User | null;
  editandoPerfil: boolean;
  setEditandoPerfil: React.Dispatch<React.SetStateAction<boolean>>;
  pfNomeFantasia: string;
  setPfNomeFantasia: (v: string) => void;
  pfFotoPerfilUrl: string;
  setPfFotoPerfilUrl: (v: string) => void;
  pfTelefone: string;
  setPfTelefone: (v: string) => void;
  pfEmailContato: string;
  setPfEmailContato: (v: string) => void;
  pfEndereco: string;
  setPfEndereco: (v: string) => void;
  pfHorarios: HorarioDia[];
  setPfHorarios: React.Dispatch<React.SetStateAction<HorarioDia[]>>;
  pfFotos: FotoGaleria[];
  setPfFotos: React.Dispatch<React.SetStateAction<FotoGaleria[]>>;
  pfSaving: boolean;
  statusLojaAtual: { aberto: boolean; label: string };
  onFotoFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => Promise<void>;
}

export function LojistaPerfilTab({
  loja,
  user,
  editandoPerfil,
  setEditandoPerfil,
  pfNomeFantasia,
  setPfNomeFantasia,
  pfFotoPerfilUrl,
  setPfFotoPerfilUrl,
  pfTelefone,
  setPfTelefone,
  pfEmailContato,
  setPfEmailContato,
  pfEndereco,
  setPfEndereco,
  pfHorarios,
  setPfHorarios,
  pfFotos,
  setPfFotos,
  pfSaving,
  statusLojaAtual,
  onFotoFileChange,
  onSubmit,
}: LojistaPerfilTabProps) {
  return (
    <div>
      <div className="lojista-page-header">
        <div>
          <h1 className="lojista-title">Perfil da Loja</h1>
          <p className="lojista-subtitle">
            Gerencie as informações públicas da sua loja visíveis para os motociclistas.
          </p>
        </div>
        <Button
          type="button"
          variant={editandoPerfil ? 'ghost' : 'primary'}
          onClick={() => setEditandoPerfil((v) => !v)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            marginLeft: 'auto',
          }}
        >
          <Pencil size={15} />
          {editandoPerfil ? 'Cancelar Edição' : 'Editar Perfil'}
        </Button>
      </div>

      <div className="lojista-split-grid">
        {/* Card Principal da Loja */}
        <div className="card lojista-card" style={{ padding: 28, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              gap: 22,
              alignItems: 'center',
              flexWrap: 'wrap',
              paddingBottom: 24,
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            {/* Foto de Perfil */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div className="lojista-avatar-box">
                {pfFotoPerfilUrl || loja?.fotoPerfilUrl ? (
                  <SmartImage
                    src={pfFotoPerfilUrl || loja?.fotoPerfilUrl || ''}
                    alt={loja?.nomeFantasia || 'Foto de Perfil'}
                    width={96}
                    height={96}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <>
                    <Store size={34} strokeWidth={1.8} />
                    <span
                      className="lojista-mono"
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        color: '#475569',
                      }}
                    >
                      OFICIAL
                    </span>
                  </>
                )}
              </div>

              {editandoPerfil && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <label className="lojista-upload-mini-btn" title="Fazer upload de imagem do computador">
                    <Upload size={12} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFotoFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {(pfFotoPerfilUrl || loja?.fotoPerfilUrl) && (
                    <button
                      type="button"
                      onClick={() => setPfFotoPerfilUrl('')}
                      className="lojista-remove-mini-btn"
                      title="Excluir foto de perfil"
                    >
                      <Trash2 size={12} />
                      <span>Excluir</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>
                {loja?.nomeFantasia || user?.nome}
              </h2>
              <div className="lojista-mono" style={{ color: '#64748b', fontSize: '0.84rem', marginTop: 4 }}>
                CNPJ: {loja?.cnpj || '12.345.678/0001-90'}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                <span
                  className="lojista-pill-badge lojista-pill-badge--teal"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <ShieldCheck size={14} /> Loja Verificada
                </span>
                <span
                  className="lojista-pill-badge lojista-mono"
                  style={{
                    padding: '4px 10px',
                    background: '#f1f5f9',
                    color: '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Desde 2026
                </span>
              </div>
            </div>
          </div>

          {editandoPerfil ? (
            <form
              onSubmit={onSubmit}
              style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <Field label="Nome Fantasia da Loja">
                <TextInput
                  required
                  value={pfNomeFantasia}
                  onChange={(e) => setPfNomeFantasia(e.target.value)}
                />
              </Field>
              <Field label="URL da Foto de Perfil (ou use o botão de Upload acima)">
                <TextInput
                  type="url"
                  placeholder="https://exemplo.com/foto-loja.jpg"
                  value={pfFotoPerfilUrl}
                  onChange={(e) => setPfFotoPerfilUrl(e.target.value)}
                />
              </Field>
              <div className="lojista-form-grid-2">
                <Field label="Telefone / WhatsApp">
                  <TextInput
                    value={pfTelefone}
                    onChange={(e) => setPfTelefone(e.target.value)}
                    placeholder="(11) 98765-4321"
                  />
                </Field>
                <Field label="E-mail Comercial">
                  <TextInput
                    type="email"
                    value={pfEmailContato}
                    onChange={(e) => setPfEmailContato(e.target.value)}
                    placeholder="contato@motopecas.com.br"
                  />
                </Field>
              </div>
              <Field label="Endereço Principal Completo">
                <TextInput value={pfEndereco} onChange={(e) => setPfEndereco(e.target.value)} />
              </Field>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  marginTop: 8,
                  flexWrap: 'wrap',
                }}
              >
                <Button type="button" variant="ghost" onClick={() => setEditandoPerfil(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pfSaving}>
                  {pfSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="lojista-form-grid-2" style={{ gap: 28, marginTop: 24 }}>
              <div>
                <div
                  className="lojista-mono"
                  style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8 }}
                >
                  Endereço Principal
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <MapPin size={18} color="#006375" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.55, color: '#1e293b' }}>
                    {loja?.enderecoCompleto ||
                      'Av. dos Bandeirantes, 1450 - Vila Olímpia, São Paulo - SP'}
                  </div>
                </div>
              </div>
              <div>
                <div
                  className="lojista-mono"
                  style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8 }}
                >
                  Contato
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    fontSize: '0.92rem',
                    color: '#1e293b',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Phone size={16} color="#006375" />
                    <span>{loja?.telefoneContato || '(11) 98765-4321'} (WhatsApp)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Mail size={16} color="#006375" />
                    <span>{loja?.emailContato || user?.email || 'contato@motopecas.com.br'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Horário de Funcionamento */}
        <div className="card lojista-card" style={{ padding: 24, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>Horário</strong>
            <Clock size={18} color="#64748b" />
          </div>

          {editandoPerfil && (
            <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setPfHorarios(DEFAULT_HORARIOS_LOJA)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  color: '#006375',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Preencher Padrão Comercial (08h-18h / Sáb até 13h)
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pfHorarios.map((h, idx) => (
              <div
                key={h.dia}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.86rem',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <span style={{ color: '#475569', minWidth: 65, fontWeight: 500 }}>{h.dia}</span>
                {editandoPerfil ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!h.fechado}
                        onChange={(e) => {
                          const next = [...pfHorarios];
                          next[idx] = { ...h, fechado: !e.target.checked };
                          setPfHorarios(next);
                        }}
                      />
                      <span style={{ color: h.fechado ? '#94a3b8' : '#006375', fontWeight: 600 }}>
                        {h.fechado ? 'Fechado' : 'Aberto'}
                      </span>
                    </label>

                    {!h.fechado && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="time"
                          value={h.abre}
                          onChange={(e) => {
                            const next = [...pfHorarios];
                            next[idx] = { ...h, abre: e.target.value };
                            setPfHorarios(next);
                          }}
                          className="lojista-time-input lojista-mono"
                        />
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>às</span>
                        <input
                          type="time"
                          value={h.fecha}
                          onChange={(e) => {
                            const next = [...pfHorarios];
                            next[idx] = { ...h, fecha: e.target.value };
                            setPfHorarios(next);
                          }}
                          className="lojista-time-input lojista-mono"
                        />
                      </div>
                    )}
                  </div>
                ) : h.fechado ? (
                  <strong className="lojista-mono" style={{ color: '#b91c1c' }}>
                    Fechado
                  </strong>
                ) : (
                  <strong className="lojista-mono" style={{ color: '#0f172a' }}>
                    {h.abre} - {h.fecha}
                  </strong>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span className="lojista-mono" style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Status Atual:
            </span>
            <span
              className={`lojista-pill-badge ${statusLojaAtual.aberto ? 'lojista-pill-badge--teal' : 'lojista-pill-badge--danger'}`}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: statusLojaAtual.aberto ? '#006375' : '#dc2626',
                }}
              />
              {statusLojaAtual.label}
            </span>
          </div>
        </div>
      </div>

      {/* Galeria da Loja */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <strong style={{ fontSize: '1.08rem', color: '#0f172a' }}>Galeria da Loja</strong>
          <button
            type="button"
            onClick={() =>
              setPfFotos((prev) => [
                ...prev,
                {
                  title: `Ambiente da Loja #${prev.length + 1}`,
                  url: PRODUCT_BANNER_IMAGES[prev.length % PRODUCT_BANNER_IMAGES.length],
                },
              ])
            }
            className="lojista-link-btn"
            style={{
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ImagePlus size={15} />
            <span>+ Adicionar Foto</span>
          </button>
        </div>

        <div className="lojista-gallery-grid">
          {pfFotos.slice(0, 3).map((foto, i) => (
            <div
              key={i}
              style={{
                height: 155,
                borderRadius: 12,
                backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.1), rgba(15,23,42,0.72)), url(${foto.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: 14,
                display: 'flex',
                alignItems: 'flex-end',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.84rem',
                border: '1px solid #e2e8f0',
              }}
            >
              {foto.title}
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setPfFotos((prev) => [
                ...prev,
                {
                  title: `Estoque Técnico #${prev.length + 1}`,
                  url: PRODUCT_BANNER_IMAGES[prev.length % PRODUCT_BANNER_IMAGES.length],
                },
              ])
            }
            className="lojista-gallery-add-card"
          >
            <PlusCircle size={26} color="#64748b" />
            <span className="lojista-mono" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Nova Foto
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
