import { useContext } from 'react';
import { ActiveMotoContext } from './active-moto-context';
import type { ActiveMotoContextValue } from './active-moto-context';

export function useActiveMoto(): ActiveMotoContextValue {
  const context = useContext(ActiveMotoContext);
  if (!context) {
    throw new Error('useActiveMoto deve ser usado dentro de um ActiveMotoProvider');
  }
  return context;
}
