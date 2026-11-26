import type { ItemReceita, ItemReceitaFormData } from './componente.types';

export interface ReceitaCompleta {
  id: number;
  nome: string;
  descricao: string | null;
  tempoPreparoMinutos: number | null;
  rendimento: string | null;
  ativo: boolean;
  itens: ItemReceita[];
  custoTotal?: number;
  dataCriacao?: string;
  dataUltimaAlteracao?: string;
}

export interface ReceitaCompletaFormData {
  nome: string;
  descricao: string;
  tempoPreparoMinutos: number | null;
  rendimento: string;
  ativo: boolean;
}

export type ReceitaItemFormData = ItemReceitaFormData;
