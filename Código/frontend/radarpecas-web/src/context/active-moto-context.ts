import { createContext } from 'react';

export interface ActiveMoto {
  id?: string; // Guid da garagem se cadastrado
  modeloMotoId: number;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  apelido?: string | null;
  fotoMotoUrl?: string | null;
}

export interface ActiveMotoContextValue {
  activeMoto: ActiveMoto | null;
  setActiveMoto: (moto: ActiveMoto | null) => void;
}

export const ActiveMotoContext = createContext<ActiveMotoContextValue | null>(null);
