import { useCallback } from 'react';
import { useAsyncData } from './useAsyncData';
import { fase4Service } from '../services/fase4Service';

export function usePrecificacao(produtoId: number) {
  const carregar = useCallback(() => fase4Service.obterPrecificacao(produtoId), [produtoId]);
  return useAsyncData(carregar);
}
