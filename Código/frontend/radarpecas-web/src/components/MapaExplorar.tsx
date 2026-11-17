import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../lib/api';
import type { Loja, LocalizacaoSugestao } from '../types';
import { SearchIcon } from './ui';
import { getStoredUserCoords, setStoredUserCoords } from '../lib/location';

interface MapaExplorarProps {
  lojas: Loja[];
  selectedLojaId: string | null;
  onSelectLoja: (lojaId: string) => void;
  onLocationChange: (lat: number, lon: number) => void;
  focusTarget: { lat: number; lon: number; seq: number } | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatLocationStandardName(loc: LocalizacaoSugestao): string {
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
}

export default function MapaExplorar({
  lojas,
  selectedLojaId,
  onSelectLoja,
  onLocationChange,
  focusTarget,
}: MapaExplorarProps) {
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<LocalizacaoSugestao[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [currentZoom, setCurrentZoom] = useState(14);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const searchLocationMarkerRef = useRef<L.Marker | null>(null);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const justSelectedRef = useRef(false);
  const geocodeAbortRef = useRef<AbortController | null>(null);

  // Inicializar o Mapa Leaflet com opções de performance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const storedCoords = getStoredUserCoords();
    const initialCenter: [number, number] = storedCoords
      ? [storedCoords.lat, storedCoords.lng]
      : [-10.6856, -37.4270];

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    }).setView(initialCenter, 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      updateWhenIdle: true,
      keepBuffer: 2,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapRef.current = map;

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

    if (storedCoords) {
      userMarkerRef.current = L.marker([storedCoords.lat, storedCoords.lng], { icon: userIcon }).addTo(map);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mapRef.current) return;
          try {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            if (!userMarkerRef.current) {
              userMarkerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(mapRef.current);
            } else {
              userMarkerRef.current.setLatLng([lat, lng]);
            }
            mapRef.current.setView([lat, lng], 14);
          } catch {
            // Ignora se o mapa estiver desmontado
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

  // Centralizar mapa quando um card na sidebar for clicado
  useEffect(() => {
    if (focusTarget && mapRef.current) {
      mapRef.current.flyTo([focusTarget.lat, focusTarget.lon], 16, { duration: 1.0 });
    }
  }, [focusTarget]);

  // Atualizar marcadores das lojas (labels só no zoom >= 14 ou nas 5 mais próximas)
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    lojas.forEach((loja, index) => {
      if (loja.latitude == null || loja.longitude == null) return;
      const lat = loja.latitude;
      const lng = loja.longitude;
      const showLabel = currentZoom >= 14 || index < 5 || selectedLojaId === loja.id;

      const storePinIcon = L.divIcon({
        className: 'leaflet-custom-marker-store',
        html: showLabel
          ? `
            <div style="position: relative; width: 120px; height: 64px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; cursor: pointer; pointer-events: auto;">
              <div style="background: #ffffff; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #006375; box-shadow: 0 2px 6px rgba(0,0,0,0.18); border: 1px solid #cbd5e1; margin-bottom: 2px; white-space: nowrap; max-width: 116px; overflow: hidden; text-overflow: ellipsis; line-height: 16px; text-align: center;">
                ${escapeHtml(loja.nomeFantasia.split(' - ')[0].split(' / ')[0])}
              </div>
              <svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.32));">
                <path d="M15 0C6.716 0 0 6.716 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.716 23.284 0 15 0Z" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
                <circle cx="15" cy="15" r="7.5" fill="#ffffff"/>
                <path d="M15 11.5V18.5M11.5 15H18.5" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round"/>
              </svg>
            </div>
          `
          : `
            <div style="width: 30px; height: 42px; display: flex; align-items: flex-end; justify-content: center; cursor: pointer; pointer-events: auto;">
              <svg width="26" height="36" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.28));">
                <path d="M15 0C6.716 0 0 6.716 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.716 23.284 0 15 0Z" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
                <circle cx="15" cy="15" r="6.5" fill="#ffffff"/>
              </svg>
            </div>
          `,
        iconSize: showLabel ? [120, 64] : [30, 42],
        iconAnchor: showLabel ? [60, 64] : [15, 42],
        popupAnchor: showLabel ? [0, -64] : [0, -42],
      });

      const marker = L.marker([lat, lng], { icon: storePinIcon });
      marker.bindPopup(`
        <div style="font-family: var(--sans); padding: 4px;">
          <strong style="font-size: 14px; color: #006375; display: block;">${escapeHtml(loja.nomeFantasia)}</strong>
          <p style="margin: 4px 0; font-size: 12px; color: #64748b;">${escapeHtml(loja.enderecoCompleto)}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <span style="color: #f59e0b; font-weight: bold; font-size: 12px;">★ ${loja.mediaAvaliacao.toFixed(1)}</span>
            <a href="/lojas/${loja.id}" style="background: #006375; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 11px; text-decoration: none;">Ver Loja</a>
          </div>
        </div>
      `);

      marker.on('click', () => {
        onSelectLoja(loja.id);
      });

      markersGroup.addLayer(marker);
    });
  }, [lojas, currentZoom, selectedLojaId, onSelectLoja]);

  // Debounce para autocomplete de localizações com AbortController
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
      geocodeAbortRef.current?.abort();
      const controller = new AbortController();
      geocodeAbortRef.current = controller;
      setLoadingSuggestions(true);
      try {
        const res = await api<LocalizacaoSugestao[]>(
          `/geocoding/sugestoes?query=${encodeURIComponent(locationQuery.trim())}&limite=15`,
          { signal: controller.signal }
        );
        const items = res ?? [];
        setSugestoes(items);
        setShowSuggestions(items.length > 0);
        setHighlightedIndex(-1);
      } catch {
        if (!controller.signal.aborted) {
          setSugestoes([]);
          setShowSuggestions(false);
        }
      } finally {
        if (geocodeAbortRef.current === controller) {
          setLoadingSuggestions(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      geocodeAbortRef.current?.abort();
    };
  }, [locationQuery]);

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

  const handleSelectLocation = useCallback(
    async (loc: LocalizacaoSugestao) => {
      justSelectedRef.current = true;
      const placeName = formatLocationStandardName(loc);
      setSelectedLocationName(placeName);
      setLocationQuery(placeName);
      setShowSuggestions(false);
      setSugestoes([]);
      setHighlightedIndex(-1);

      const lat = Number(loc.latitude);
      const lon = Number(loc.longitude);
      setStoredUserCoords({ lat, lng: lon, nome: placeName });

      if (mapRef.current) {
        mapRef.current.flyTo([lat, lon], 15, { duration: 1.2 });

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

      onLocationChange(lat, lon);
    },
    [onLocationChange]
  );

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
        void handleSelectLocation(sugestoes[highlightedIndex]);
      } else if (sugestoes.length > 0) {
        void handleSelectLocation(sugestoes[0]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  function handleLocateMe() {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setStoredUserCoords({ lat, lng });
      if (userMarkerRef.current) userMarkerRef.current.setLatLng([lat, lng]);
      mapRef.current?.flyTo([lat, lng], 15, { duration: 1.0 });
      onLocationChange(lat, lng);
    });
  }

  return (
    <>
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏳</span>
          )}
          {locationQuery && (
            <button
              type="button"
              onClick={handleClearSelectedLocation}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '14px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
              title="Limpar localização"
              aria-label="Limpar localização"
            >
              ✕
            </button>
          )}
        </div>

        {showSuggestions && sugestoes.length > 0 && (
          <div ref={suggestionsContainerRef} className="map-location-suggestions" role="listbox">
            {sugestoes.map((sugestao, idx) => {
              const isActive = highlightedIndex === idx;
              return (
                <div
                  key={`${sugestao.latitude}-${sugestao.longitude}-${idx}`}
                  className={`map-suggestion-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => void handleSelectLocation(sugestao)}
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
          onClick={() => mapRef.current?.zoomIn()}
          title="Aproximar Zoom"
          aria-label="Aproximar Zoom"
        >
          +
        </button>
        <button
          type="button"
          className="map-ctrl-btn"
          onClick={() => mapRef.current?.zoomOut()}
          title="Afastar Zoom"
          aria-label="Afastar Zoom"
        >
          −
        </button>
      </div>

      <div ref={mapContainerRef} className="explore-map" />
    </>
  );
}
