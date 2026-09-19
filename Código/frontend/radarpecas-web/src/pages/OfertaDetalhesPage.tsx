import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useActiveMoto } from '../context/useActiveMoto';
import type { OfertaDetalhe } from '../types';
import { Button, Card, CheckIcon, ErrorState, Loading, StarIcon } from '../components/ui';

export function OfertaDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const { activeMoto } = useActiveMoto();

  const [oferta, setOferta] = useState<OfertaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);
  const [reservado, setReservado] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api<OfertaDetalhe>(`/ofertas/${id}`)
      .then((data) => setOferta(data))
      .catch(() => {
        setError('Oferta não encontrada.');
        setOferta(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function formatMoney(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  function handleReservar() {
    setReservado(true);
    if (oferta?.loja.telefoneContato) {
      const cleanPhone = oferta.loja.telefoneContato.replace(/\D/g, '');
      const msg = encodeURIComponent(
        `Olá! Gostaria de reservar o "${oferta.peca.nome}" (Cód: ${oferta.peca.sku || 'N/A'}) que vi no RadarPeças.`
      );
      window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
    }
  }

  function handleIrAteALoja() {
    if (!oferta) return;
    const endereco = encodeURIComponent(oferta.loja.enderecoCompleto);
    window.open(`https://www.google.com/maps/search/?api=1&query=${endereco}`, '_blank');
  }

  if (loading) return <Loading text="Carregando detalhes do produto..." />;
  if (error || !oferta) return <ErrorState text={error || 'Oferta não encontrada.'} />;

  // Fotos disponíveis
  const galleryPhotos = [
    oferta.peca.fotoPecaUrl,
    ...(oferta.loja.galeriaFotosUrls || []),
  ].filter(Boolean) as string[];

  const precoParcelado = oferta.precoEfetivo / 10;

  // Verificação real de compatibilidade com a moto ativa do motociclista
  const isCompativel = Boolean(
    activeMoto &&
    oferta.compatibilidades?.some(
      (c) =>
        c.marca.toLowerCase() === activeMoto.marca.toLowerCase() &&
        c.modelo.toLowerCase() === activeMoto.modelo.toLowerCase() &&
        (c.anoInicio == null || activeMoto.anoFabricacao >= c.anoInicio) &&
        (c.anoFim == null || activeMoto.anoFabricacao <= c.anoFim)
    )
  );

  return (
    <section>
      {/* Layout em Duas Colunas */}
      <div className="details-layout">
        {/* COLUNA ESQUERDA: FOTO GRANDE + MINIATURAS + ESPECIFICAÇÕES */}
        <div>
          {/* Caixa Principal da Foto */}
          <div className="product-main-photo-wrap">
            {/* Badge de compatibilidade apenas se a moto ativa for realmente compatível */}
            {isCompativel && activeMoto && (
              <div className="badge-photo-topleft">
                <span className="badge-compativel" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                  <CheckIcon size={14} /> Compatível com {activeMoto.marca} {activeMoto.modelo} ({activeMoto.anoFabricacao})
                </span>
              </div>
            )}

            {galleryPhotos.length > 0 ? (
              <img
                src={galleryPhotos[activeThumbIndex] || galleryPhotos[0]}
                alt={oferta.peca.nome}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>
                ⚙️
              </div>
            )}
          </div>

          {/* Miniaturas da Galeria (apenas se houver mais de 1 imagem) */}
          {galleryPhotos.length > 1 && (
            <div className="gallery-thumbs-row">
              {galleryPhotos.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`gallery-thumb ${activeThumbIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveThumbIndex(idx)}
                >
                  <img src={url} alt={`Foto miniatura ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}

          {/* Card de Especificações Técnicas */}
          {oferta.peca.especificacoes && (
            <div style={{ marginTop: 24 }}>
              <Card title="Especificações Técnicas">
                <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: '#334155' }}>
                  {oferta.peca.especificacoes}
                </p>
              </Card>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: PREÇO, RESERVA & INFORMAÇÕES DA LOJA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card de Dados do Produto e Compra */}
          <Card>
            {oferta.peca.sku && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: '#64748b' }}>
                Cód: {oferta.peca.sku}
              </span>
            )}

            <h1 style={{ fontSize: '1.5rem', margin: '6px 0 10px', lineHeight: 1.3 }}>
              {oferta.peca.nome}
            </h1>

            {/* Avaliação em estrelas se houver */}
            {oferta.loja.totalAvaliacoes > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <div style={{ display: 'flex', color: '#f59e0b' }}>
                  <StarIcon size={16} />
                </div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {oferta.loja.mediaAvaliacao.toFixed(1)} ({oferta.loja.totalAvaliacoes} {oferta.loja.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'})
                </span>
              </div>
            )}

            {/* Preço e Parcelamento */}
            <div style={{ margin: '14px 0 20px' }}>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#006375' }}>
                {formatMoney(oferta.precoEfetivo)}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                em até 10x de {formatMoney(precoParcelado)} sem juros
              </p>
            </div>

            {/* Botão Reservar na Loja Física */}
            <Button
              type="button"
              variant="outline"
              block
              onClick={handleReservar}
              style={{ padding: '12px', fontSize: '0.88rem' }}
            >
              Reservar na Loja Física
            </Button>

            {reservado && (
              <p style={{ color: '#006375', fontSize: '0.82rem', textAlign: 'center', marginTop: 8 }}>
                ✓ Abrindo contato direto com o lojista via WhatsApp...
              </p>
            )}
          </Card>

          {/* Card de Informações da Loja */}
          <Card title="Informações da Loja">
            {/* Cabeçalho da Loja */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-sm)',
                  background: '#ddf0f5',
                  color: '#006375',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  fontFamily: 'var(--mono)',
                }}
              >
                {oferta.loja.nomeFantasia.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <strong style={{ fontSize: '1rem', display: 'block' }}>{oferta.loja.nomeFantasia}</strong>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  ✓ Vendedor Verificado
                </span>
              </div>
            </div>

            {/* Mini Mapa Preview estilizado */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 120,
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                background: '#e2e8f0',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Imagem de fundo do mapa */}
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80"
                alt="Mapa da Loja"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
              />

              {/* Pin central */}
              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '1.8rem', color: '#dc2626' }}>📍</span>
                <span
                  style={{
                    background: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {oferta.distanciaKm != null ? `A ${oferta.distanciaKm.toFixed(1)} km de você` : 'Localização da loja'}
                </span>
              </div>
            </div>

            {/* Endereço */}
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 16px', display: 'flex', gap: 6 }}>
              <span>🕮</span> {oferta.loja.enderecoCompleto}
            </p>

            {/* Botão Ir até a Loja */}
            <button
              type="button"
              onClick={handleIrAteALoja}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-strong)',
                background: '#f8fafc',
                color: '#334155',
                fontFamily: 'var(--mono)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>⮹</span> Ir até a Loja
            </button>
          </Card>
        </div>
      </div>
    </section>
  );
}
