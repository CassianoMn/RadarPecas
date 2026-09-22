export interface StoredUserCoords {
  lat: number;
  lng: number;
  nome?: string;
}

const LOCATION_STORAGE_KEY = 'radarpecas:user_coords';

export function getStoredUserCoords(): StoredUserCoords | null {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUserCoords;
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
      return parsed;
    }
  } catch {
    // Falha silenciosa em caso de json corrompido
  }
  return null;
}

export function setStoredUserCoords(coords: StoredUserCoords): void {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(coords));
  } catch {
    // Falha silenciosa em caso de restrições de localStorage
  }
}

export function clearStoredUserCoords(): void {
  try {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch {
    // Falha silenciosa
  }
}
