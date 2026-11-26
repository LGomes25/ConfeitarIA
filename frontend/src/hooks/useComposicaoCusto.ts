import { useCallback } from 'react';
import { useAsyncData } from './useAsyncData';
import { fase4Service } from '../services/fase4Service';

export function useComposicaoCusto(produtoId: number) {
  const carregar = useCallback(() => fase4Service.obterComposicaoCusto(produtoId), [produtoId]);
  return useAsyncData(carregar);
}
