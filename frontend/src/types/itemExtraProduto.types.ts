export interface ItemExtraProduto {
  id: number;
  insumoId: number | null;
  insumoNome?: string | null;
  descricaoItem: string | null;
  quantidade: number | null;
  valorUnitario: number;
  custoItem: number;
}

export type ItemExtraProdutoFormData =
  | { insumoId: number; quantidade: number }
  | { descricaoItem: string; valorUnitario: number };
