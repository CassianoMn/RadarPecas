import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { api } from '../lib/api';
import { formatHorariosFuncionamento } from '../lib/formatters';
import type { Loja } from '../types';
import { EmptyState, FilterIcon, Loading, MicIcon, SearchIcon, StarIcon } from '../components/ui';

export function HomePage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [selectedLojaId, setSelectedLojaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mapa Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const categories = ['Pneus', 'Óleos', 'Freios', 'Relação', 'Baterias', 'Filtros'];

  // Carregar lojas reais da API (passando geolocalização quando disponível)
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              query.set('userLat', pos.coords.latitude.toString());
              query.set('userLon', pos.coords.longitude.toString());
              const lojasData = await api<Loja[]>(`/lojas?${query.toString()}`);
              setLojas(lojasData ?? []);
              setLoading(false);
            },
            async () => {
              const lojasData = await api<Loja[]>('/lojas');
              setLojas(lojasData ?? []);
              setLoading(false);
            },
            { timeout: 5000 }
          );
        } else {
          const lojasData = await api<Loja[]>('/lojas');
          setLojas(lojasData ?? []);
          setLoading(false);
        }
      } catch {
        setLojas([]);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Inicializar o Mapa Leaflet com OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([-23.553, -46.642], 14);

    // Tiles oficiais OpenStreetMap (100% gratuitos e abertos, sem necessidade de API Key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapRef.current = map;

    // Marcador do usuário estilo radar pulsante ◉
    const userIcon = L.divIcon({
      className: 'leaflet-custom-marker-user',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(0, 99, 117, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 20px; height: 20px; border-radius: 50%; background: #ffffff; border: 3px solid #006375; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
          <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #006375;"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([-23.553, -46.642], { icon: userIcon }).addTo(map);
    userMarkerRef.current = userMarker;

    // Obter posição real do navegador
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          userMarker.setLatLng([lat, lng]);
          map.setView([lat, lng], 14);
        },
        () => {}
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Atualizar marcadores no mapa apenas com coordenadas reais cadastradas
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    lojas.forEach((loja) => {
      // Usar coordenadas reais se cadastradas
      if (loja.latitude == null || loja.longitude == null) return;
      const lat = loja.latitude;
      const lng = loja.longitude;

      const storePinIcon = L.divIcon({
        className: 'leaflet-custom-marker-store',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: #ffffff; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #006375; box-shadow: 0 2px 6px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; margin-bottom: 3px; white-space: nowrap;">
              ${loja.nomeFantasia.split(' ')[0]}
            </div>
            <div style="width: 38px; height: 38px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: #0284c7; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.25); border: 2px solid #ffffff;">
              <span style="transform: rotate(45deg); color: #ffffff; font-size: 16px;">⚙</span>
            </div>
          </div>
        `,
        iconSize: [60, 60],
        iconAnchor: [30, 50],
      });

      const marker = L.marker([lat, lng], { icon: storePinIcon });
      marker.bindPopup(`
        <div style="font-family: var(--sans); padding: 4px;">
          <strong style="font-size: 14px; color: #006375; display: block;">${loja.nomeFantasia}</strong>
          <p style="margin: 4px 0; font-size: 12px; color: #64748b;">${loja.enderecoCompleto}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <span style="color: #f59e0b; font-weight: bold; font-size: 12px;">★ ${loja.mediaAvaliacao.toFixed(1)}</span>
            <a href="/lojas/${loja.id}" style="background: #006375; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 11px; text-decoration: none;">Ver Loja</a>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedLojaId(loja.id);
      });

      markersGroup.addLayer(marker);
    });
  }, [lojas]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca?termo=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/busca');
    }
  }

  function handleCategoryClick(cat: string) {
    if (selectedCategory === cat) {
      setSelectedCategory(null);
      navigate('/busca');
    } else {
      setSelectedCategory(cat);
      navigate(`/busca?categoria=${encodeURIComponent(cat)}`);
    }
  }

  function handleCardClick(loja: Loja) {
    setSelectedLojaId(loja.id);
    if (mapRef.current && loja.latitude != null && loja.longitude != null) {
      mapRef.current.flyTo([loja.latitude, loja.longitude], 16, { duration: 1.2 });
    }
  }

  function handleLocateMe() {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      if (userMarkerRef.current) userMarkerRef.current.setLatLng([lat, lng]);
      mapRef.current?.flyTo([lat, lng], 15, { duration: 1.2 });
    });
  }

  function handleZoomIn() {
    if (mapRef.current) mapRef.current.zoomIn();
  }

  function handleZoomOut() {
    if (mapRef.current) mapRef.current.zoomOut();
  }

  return (
    <div className="explore-container">
      {/* PAINEL LATERAL ESQUERDO */}
      <aside className="explore-sidebar">
        {/* Barra de busca */}
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
            <SearchIcon size={18} />
          </span>
          <input
            type="search"
            placeholder="Buscar peças, marcas ou lojas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 40px 11px 40px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-strong)',
              fontSize: '0.9rem',
              outline: 'none',
              background: '#ffffff',
            }}
          />
          <button
            type="button"
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Buscar por voz"
          >
            <MicIcon size={18} />
          </button>
        </form>

        {/* Linha de Chips / Categorias */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          <button
            type="button"
            className="chip"
            style={{
              cursor: 'pointer',
              border: 'none',
              background: '#ddf0f5',
              color: '#006375',
              padding: '6px 12px',
              flexShrink: 0,
            }}
            onClick={() => navigate('/busca')}
          >
            <FilterIcon size={14} /> Filtros
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className="chip chip-muted"
              style={{
                cursor: 'pointer',
                border: '1px solid var(--border)',
                background: selectedCategory === cat ? '#006375' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#334155',
                padding: '6px 12px',
                flexShrink: 0,
              }}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Título de Seção */}
        <div>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748b',
            }}
          >
            LOJAS PRÓXIMAS EM DESTAQUE
          </span>
        </div>

        {loading && <Loading text="Carregando lojas parceiras..." />}

        {!loading && lojas.length === 0 && (
          <EmptyState text="Nenhuma loja parceira cadastrada na região no momento." />
        )}

        {/* Lista de Cards de Lojas Reais */}
        {!loading && lojas.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {lojas.map((loja) => {
              const isSelected = selectedLojaId === loja.id;

              return (
                <div
                  key={loja.id}
                  onClick={() => handleCardClick(loja)}
                  style={{
                    background: '#ffffff',
                    border: isSelected ? '2px solid #006375' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 14,
                    boxShadow: isSelected ? 'var(--shadow)' : 'var(--shadow-sm)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Badge de Avaliação superior direito */}
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        background: '#f8fafc',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      <StarIcon size={13} />
                      <span>{loja.mediaAvaliacao.toFixed(1)}</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1rem', margin: '0 0 4px', paddingRight: 60 }}>{loja.nomeFantasia}</h3>

                  {/* Exibir distância apenas se calculada; caso contrário exibir endereço real */}
                  <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#64748b' }}>
                    {loja.distanciaKm != null
                      ? `📍 ${loja.distanciaKm.toFixed(1)} km • ${loja.enderecoCompleto}`
                      : `📍 ${loja.enderecoCompleto}`}
                  </p>

                  {loja.horariosFuncionamento && (
                    <small style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>
                      🕒 {formatHorariosFuncionamento(loja.horariosFuncionamento)}
                    </small>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </aside>

      {/* PAINEL DIREITO: MAPA INTERATIVO OPENSTREETMAP */}
      <div className="explore-map-wrapper">
        {/* Barra flutuante de busca sobre o mapa */}
        <div className="map-floating-search">
          <SearchIcon size={18} />
          <input
            type="search"
            placeholder="Search ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
          />
          <span style={{ color: '#94a3b8', cursor: 'pointer' }}>⧩</span>
          <span style={{ color: '#94a3b8', cursor: 'pointer' }}>☷</span>
        </div>

        {/* Controles de navegação do mapa */}
        <div className="map-controls-panel">
          <button
            type="button"
            className="map-ctrl-btn"
            onClick={handleLocateMe}
            title="Minha Localização"
            aria-label="Minha Localização"
          >
            ⌖
          </button>
          <button
            type="button"
            className="map-ctrl-btn"
            onClick={handleZoomIn}
            title="Aproximar Zoom"
            aria-label="Aproximar Zoom"
          >
            +
          </button>
          <button
            type="button"
            className="map-ctrl-btn"
            onClick={handleZoomOut}
            title="Afastar Zoom"
            aria-label="Afastar Zoom"
          >
            −
          </button>
        </div>

        {/* Container Leaflet */}
        <div ref={mapContainerRef} className="explore-map" />
      </div>
    </div>
  );
}
