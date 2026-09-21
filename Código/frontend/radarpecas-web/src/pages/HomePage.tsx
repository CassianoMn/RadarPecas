import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { api } from '../lib/api';
import { formatHorariosFuncionamento } from '../lib/formatters';
import type { Loja, LocalizacaoSugestao } from '../types';
import { EmptyState, FilterIcon, Loading, MicIcon, SearchIcon, StarIcon } from '../components/ui';

export function HomePage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [selectedLojaId, setSelectedLojaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Busca de Localização no Mapa (Geocoding & Autocomplete)
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<LocalizacaoSugestao[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Mapa Leaflet & Referências
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const searchLocationMarkerRef = useRef<L.Marker | null>(null);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const justSelectedRef = useRef(false);

  const categories = ['Pneus', 'Óleos', 'Freios', 'Relação', 'Baterias', 'Filtros'];

  const carregarLojasPorCoordenadas = useCallback(async (lat?: number, lon?: number) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (lat != null && lon != null) {
        query.set('userLat', lat.toString());
        query.set('userLon', lon.toString());
      }
      const queryString = query.toString();
      const lojasData = await api<Loja[]>(queryString ? `/lojas?${queryString}` : '/lojas');
      setLojas(lojasData ?? []);
    } catch {
      setLojas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar lojas reais da API (passando geolocalização inicial quando disponível)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          carregarLojasPorCoordenadas(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          carregarLojasPorCoordenadas();
        },
        { timeout: 5000 }
      );
    } else {
      carregarLojasPorCoordenadas();
    }
  }, [carregarLojasPorCoordenadas]);

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
          if (!mapRef.current || !userMarkerRef.current) return;
          try {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            userMarkerRef.current.setLatLng([lat, lng]);
            mapRef.current.setView([lat, lng], 14);
          } catch {
            // Ignora se o mapa estiver desmontado ou inicializando
          }
        },
        () => {}
      );
    }

    return () => {
      userMarkerRef.current = null;
      searchLocationMarkerRef.current = null;
      markersGroupRef.current = null;
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

  // Debounce para autocomplete de localizações
  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (!locationQuery || locationQuery.trim().length < 2) {
      setSugestoes([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await api<LocalizacaoSugestao[]>(
          `/geocoding/sugestoes?query=${encodeURIComponent(locationQuery.trim())}&limite=15`
        );
        const items = res ?? [];
        setSugestoes(items);
        setShowSuggestions(items.length > 0);
        setHighlightedIndex(-1);
      } catch {
        setSugestoes([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [locationQuery]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsContainerRef.current &&
        !suggestionsContainerRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollSuggestionIntoView = (index: number) => {
    if (!suggestionsContainerRef.current) return;
    const items = suggestionsContainerRef.current.querySelectorAll('.map-suggestion-item');
    if (items[index]) {
      (items[index] as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  const formatLocationStandardName = (loc: LocalizacaoSugestao): string => {
    if (loc.nomeFormatadoPadrao) {
      return loc.nomeFormatadoPadrao;
    }

    const streetPrefixes = [
      'rua', 'avenida', 'av.', 'rodovia', 'rod.', 'alameda', 'al.',
      'travessa', 'tv.', 'estrada', 'est.', 'praça', 'praca', 'via', 'viela'
    ];

    let rua = loc.rua?.trim();
    const titulo = loc.titulo?.trim();
    if (!rua && titulo) {
      const lower = titulo.toLowerCase();
      if (streetPrefixes.some((p) => lower.startsWith(p))) {
        rua = titulo;
      }
    }

    const cidade = loc.cidade?.trim();
    const estado = loc.estado?.trim();

    if (rua) {
      const parts = [rua];
      if (cidade) parts.push(cidade);
      if (estado && estado !== cidade) parts.push(estado);
      return parts.join(', ');
    }

    const local = cidade || titulo || '';
    if (local) {
      if (estado && estado !== local) {
        return `${local}, ${estado}`;
      }
      return local;
    }

    return loc.displayName || 'Localização selecionada';
  };

  const handleClearSelectedLocation = () => {
    justSelectedRef.current = false;
    setSelectedLocationName(null);
    setLocationQuery('');
    setSugestoes([]);
    setShowSuggestions(false);
    if (searchLocationMarkerRef.current) {
      searchLocationMarkerRef.current.remove();
      searchLocationMarkerRef.current = null;
    }
  };

  const handleSelectLocation = async (loc: LocalizacaoSugestao) => {
    justSelectedRef.current = true;
    const placeName = formatLocationStandardName(loc);
    setSelectedLocationName(placeName);
    setLocationQuery(placeName);
    setShowSuggestions(false);
    setSugestoes([]);
    setHighlightedIndex(-1);

    const lat = Number(loc.latitude);
    const lon = Number(loc.longitude);

    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 15, { duration: 1.5 });

      // Atualizar ou criar marcador da localização buscada: SÓ O PIN NO LUGAR ESCOLHIDO (sem nome ao lado)
      const searchPinIcon = L.divIcon({
        className: 'leaflet-custom-marker-search-pin',
        html: `
          <div class="map-search-pin-wrapper">
            <svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
              <path d="M14 0C6.27 0 0 6.27 0 14C0 24.5 14 38 14 38C14 38 28 24.5 28 14C28 6.27 21.73 0 14 0Z" fill="#006375"/>
              <circle cx="14" cy="13" r="5.5" fill="#ffffff"/>
              <circle cx="14" cy="13" r="2.5" fill="#006375"/>
            </svg>
          </div>
        `,
        iconSize: [28, 38],
        iconAnchor: [14, 38],
      });

      if (!searchLocationMarkerRef.current) {
        searchLocationMarkerRef.current = L.marker([lat, lon], { icon: searchPinIcon }).addTo(mapRef.current);
      } else {
        searchLocationMarkerRef.current.setIcon(searchPinIcon);
        searchLocationMarkerRef.current.setLatLng([lat, lon]);
      }
    }

    await carregarLojasPorCoordenadas(lat, lon);
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || sugestoes.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        setShowSuggestions(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < sugestoes.length - 1 ? prev + 1 : 0;
        scrollSuggestionIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : sugestoes.length - 1;
        scrollSuggestionIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < sugestoes.length) {
        handleSelectLocation(sugestoes[highlightedIndex]);
      } else if (sugestoes.length > 0) {
        handleSelectLocation(sugestoes[0]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

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
        {/* Nome do lugar buscado no canto superior esquerdo do quadrante de mapa */}
        {selectedLocationName && (
          <div className="map-selected-location-badge" role="status" aria-label="Localização selecionada no mapa">
            <span className="map-badge-icon">📍</span>
            <div className="map-badge-content">
              <span className="map-badge-label">Localização</span>
              <span className="map-badge-title" title={selectedLocationName}>
                {selectedLocationName}
              </span>
            </div>
            <button
              type="button"
              className="map-badge-close"
              onClick={handleClearSelectedLocation}
              title="Remover localização"
              aria-label="Remover localização"
            >
              ✕
            </button>
          </div>
        )}

        {/* Barra flutuante de busca de localização sobre o mapa com autocomplete */}
        <div className="map-floating-search-wrapper">
          <div className="map-floating-search">
            <SearchIcon size={18} />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Buscar localização..."
              value={locationQuery}
              onChange={(e) => {
                justSelectedRef.current = false;
                const val = e.target.value;
                setLocationQuery(val);
                if (!val) {
                  setSelectedLocationName(null);
                  if (searchLocationMarkerRef.current) {
                    searchLocationMarkerRef.current.remove();
                    searchLocationMarkerRef.current = null;
                  }
                }
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (sugestoes.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={handleLocationKeyDown}
              aria-label="Buscar localização"
              autoComplete="off"
            />
            {loadingSuggestions && (
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>⏳</span>
            )}
            {locationQuery && (
              <button
                type="button"
                onClick={handleClearSelectedLocation}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Limpar localização"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown com limite visual de 3 sugestões e scroll até 15 */}
          {showSuggestions && sugestoes.length > 0 && (
            <div ref={suggestionsContainerRef} className="map-location-suggestions" role="listbox">
              {sugestoes.map((sugestao, idx) => {
                const isActive = highlightedIndex === idx;
                return (
                  <div
                    key={`${sugestao.latitude}-${sugestao.longitude}-${idx}`}
                    className={`map-suggestion-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleSelectLocation(sugestao)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    role="option"
                    aria-selected={isActive}
                  >
                    <div className="map-suggestion-icon">📍</div>
                    <div className="map-suggestion-content">
                      <span className="map-suggestion-title">{sugestao.titulo}</span>
                      {sugestao.subtitulo && (
                        <span className="map-suggestion-subtitle">{sugestao.subtitulo}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
