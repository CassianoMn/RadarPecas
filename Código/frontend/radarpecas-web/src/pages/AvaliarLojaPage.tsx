import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import type { Loja } from '../types';
import { Button, ErrorState, Loading } from '../components/ui';

export function AvaliarLojaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loja, setLoja] = useState<Loja | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados da avaliação
  const [nota, setNota] = useState<number>(4);
  const [comentario, setComentario] = useState('');
  const [recomenda, setRecomenda] = useState<boolean>(true);
  const [enviando, setEnviando] = useState(false);
  const [formError, setFormError] = useState('');

  const labelsNotas: Record<number, string> = {
    1: 'Muito Ruim (1/5)',
    2: 'Ruim (2/5)',
    3: 'Regular (3/5)',
    4: 'Muito Boa (4/5)',
    5: 'Excelente (5/5)',
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api<Loja>(`/lojas/${id}`)
      .then((data) => setLoja(data))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Loja não encontrada.');
        setLoja(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setFormError('');
    setEnviando(true);
    try {
      await api(`/lojas/${id}/avaliacoes`, {
        method: 'POST',
        body: JSON.stringify({
          nota,
          comentario: comentario.trim() || null,
          recomenda,
        }),
      });
      alert('Avaliação enviada com sucesso! Obrigado pela colaboração.');
      navigate(`/lojas/${id}`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Erro ao enviar avaliação.');
    } finally {
      setEnviando(false);
    }
  }

  if (loading) return <Loading text="Carregando dados da loja..." />;
  if (error || !loja) return <ErrorState text={error || 'Loja não encontrada.'} />;

  return (
    <section className="rate-store-container">
      {/* Título & Subtítulo */}
      <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Avaliar Loja</h1>
      <p style={{ fontSize: '0.92rem', color: '#64748b', marginBottom: 20 }}>
        Sua opinião ajuda outros motociclistas a encontrarem as melhores lojas e serviços.
      </p>

      {/* Card Centralizado de Avaliação */}
      <div className="card" style={{ padding: 24 }}>
        {/* Banner com foto e nome da loja */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 24,
          }}
        >
          {loja.fotoPerfilUrl ? (
            <img
              src={loja.fotoPerfilUrl}
              alt={loja.nomeFantasia}
              style={{
                width: 60,
                height: 60,
                borderRadius: 'var(--radius-sm)',
                objectFit: 'cover',
                border: '1px solid var(--border)',
              }}
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 'var(--radius-sm)',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
              }}
            >
              🏪
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '1.15rem', margin: '0 0 2px' }}>{loja.nomeFantasia}</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              {loja.enderecoCompleto}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Pergunta de experiência */}
          <h3 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: 6 }}>
            Como foi sua experiência?
          </h3>

          {/* Seletor de Estrelas */}
          <div className="star-rating-selector">
            {[1, 2, 3, 4, 5].map((starVal) => (
              <button
                key={starVal}
                type="button"
                className={`star-btn ${starVal <= nota ? 'active' : ''}`}
                onClick={() => setNota(starVal)}
                title={`${starVal} estrelas`}
                aria-label={`${starVal} estrelas`}
              >
                ★
              </button>
            ))}
          </div>

          {/* Rótulo reativo em teal */}
          <div className="rate-feedback-label">{labelsNotas[nota]}</div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }} />

          {/* Campo de Comentário */}
          <div style={{ marginBottom: 20 }}>
            <label className="field-label-mono" style={{ display: 'block', marginBottom: 8 }}>
              Conte sua experiência (Opcional)
            </label>
            <textarea
              className="input"
              rows={4}
              placeholder="Como foi o atendimento? A peça era a correta?"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Pergunta Você recomenda esta loja? */}
          <div>
            <label className="field-label-mono" style={{ display: 'block', marginBottom: 8 }}>
              Você recomenda esta loja?
            </label>
            <div className="recommend-choice-row">
              <button
                type="button"
                className={`recommend-btn ${recomenda ? 'selected' : ''}`}
                onClick={() => setRecomenda(true)}
              >
                <span>👍</span> Sim
              </button>
              <button
                type="button"
                className={`recommend-btn ${!recomenda ? 'selected' : ''}`}
                onClick={() => setRecomenda(false)}
              >
                <span>👎</span> Não
              </button>
            </div>
          </div>

          {formError ? <ErrorState text={formError} /> : null}

          <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }} />

          {/* Botões de Ação */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              type="button"
              variant="ghost"
              block
              onClick={() => navigate(`/lojas/${id}`)}
              style={{ padding: '12px' }}
            >
              Cancelar
            </Button>
            <Button type="submit" block disabled={enviando} style={{ padding: '12px' }}>
              {enviando ? 'Enviando Avaliação...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
