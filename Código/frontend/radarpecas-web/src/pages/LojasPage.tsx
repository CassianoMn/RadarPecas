import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import type { Loja } from '../types';
import { Button, Card, Chip, EmptyState, ErrorState, Loading } from '../components/ui';

export function LojasPage() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [raioKm, setRaioKm] = useState<number | ''>('');

  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string>('');

  function obterLocalizacao() {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocalização não suportada.');
      return;
    }
    setGeoLoading(true);
    setGeoStatus('Obtendo localização...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setGeoLoading(false);
        setGeoStatus('✓ Localização obtida!');
      },
      (err) => {
        setGeoLoading(false);
        setGeoStatus('Não foi possível obter localização: ' + err.message);
      },
      { timeout: 8000 }
    );
  }

  const carregarLojas = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (userCoords) {
      params.set('userLat', userCoords.lat.toString());
      params.set('userLon', userCoords.lon.toString());
    }
    if (raioKm) {
      params.set('raioKm', raioKm.toString());
    }

    try {
      const data = await api<Loja[]>(`/lojas?${params.toString()}`);
      setLojas(data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar lista de lojas.');
    } finally {
      setLoading(false);
    }
  }, [userCoords, raioKm]);

  useEffect(() => {
    carregarLojas();
  }, [carregarLojas]);

  // Filtro de texto local por nome ou endereço
  const lojasFiltradas = lojas.filter((l) => {
    if (!busca.trim()) return true;
    const term = busca.toLowerCase();
    return (
      l.nomeFantasia.toLowerCase().includes(term) ||
      l.enderecoCompleto.toLowerCase().includes(term)
    );
  });

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Lojas Parceiras</h1>
          <p>Encontre autopeças e motopeças credenciadas mais perto de você.</p>
        </div>
      </div>

      {/* Controles de Filtro e Localização */}
      <div
        className="card"
        style={{
          margin: '16px 0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          alignItems: 'flex-end',
        }}
      >
        <div>
          <label style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
            Buscar por nome ou endereço
          </label>
          <input
            type="search"
            className="input"
            placeholder="Ex: MotoPeças Central, Centro..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
            Raio de distância
          </label>
          <select
            className="input"
            value={raioKm}
            onChange={(e) => setRaioKm(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Todas as lojas</option>
            <option value="5">Até 5 km</option>
            <option value="10">Até 10 km</option>
            <option value="25">Até 25 km</option>
            <option value="50">Até 50 km</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
            Sua localização
          </label>
          <Button
            type="button"
            variant={userCoords ? 'outline' : 'ghost'}
            style={{ width: '100%', padding: '10px 12px' }}
            onClick={obterLocalizacao}
            disabled={geoLoading}
          >
            {geoLoading ? 'Localizando...' : userCoords ? '📍 Atualizar Local' : '📍 Usar Minha Localização'}
          </Button>
        </div>
      </div>

      {geoStatus && (
        <p style={{ fontSize: '0.85rem', color: userCoords ? 'var(--primary)' : 'var(--muted)', marginTop: -14, marginBottom: 16 }}>
          {geoStatus}
        </p>
      )}

      {loading && <Loading text="Carregando lojas parceiras..." />}
      {error && <ErrorState text={error} onRetry={carregarLojas} />}

      {!loading && !error && lojasFiltradas.length === 0 && (
        <EmptyState text="Nenhuma loja encontrada com os filtros selecionados." />
      )}

      {!loading && !error && lojasFiltradas.length > 0 && (
        <div className="grid">
          {lojasFiltradas.map((loja) => (
            <Card
              key={loja.id}
              title={loja.nomeFantasia}
              footer={
                <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link className="btn btn-outline" to={`/lojas/${loja.id}`}>
                    Ver Estoque & Avaliações
                  </Link>
                  {loja.telefoneContato && (
                    <a
                      href={`tel:${loja.telefoneContato.replace(/\D/g, '')}`}
                      className="btn btn-ghost"
                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    >
                      Ligar
                    </a>
                  )}
                </div>
              }
            >
              <div style={{ display: 'flex', gap: 14 }}>
                {loja.fotoPerfilUrl ? (
                  <img
                    src={loja.fotoPerfilUrl}
                    alt={loja.nomeFantasia}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 'var(--radius)',
                      objectFit: 'cover',
                      border: '1px solid var(--border)',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 'var(--radius)',
                      background: 'var(--chip-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      flexShrink: 0,
                    }}
                  >
                    🏪
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div className="chips-row" style={{ marginBottom: 6 }}>
                    {loja.distanciaKm != null && (
                      <Chip variant="muted">{loja.distanciaKm.toFixed(1)} km</Chip>
                    )}
                    <span className="rating">
                      ★ {loja.mediaAvaliacao.toFixed(1)}{' '}
                      <span className="store-line">({loja.totalAvaliacoes})</span>
                    </span>
                  </div>

                  <p style={{ margin: '4px 0', fontSize: '0.88rem', color: 'var(--text)' }}>
                    📍 {loja.enderecoCompleto}
                  </p>

                  {loja.horariosFuncionamento && (
                    <p style={{ margin: '2px 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
                      🕒 {loja.horariosFuncionamento}
                    </p>
                  )}

                  {loja.telefoneContato && (
                    <p style={{ margin: '2px 0', fontSize: '0.8rem', color: 'var(--primary)' }}>
                      📞 {loja.telefoneContato}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
