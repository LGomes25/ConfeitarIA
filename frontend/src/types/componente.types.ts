export interface ItemReceita {
  id: number;
  insumoId: number | null;
  insumoNome: string | null;
  componenteId: number | null;
  componenteNome: string | null;
  unidadeMedida?: string;
  quantidade: number;
  valorUnitarioNoCusto: number;
  custoItem: number;
  itensComponente?: ItemReceita[];
}

export interface Componente {
  id: number;
  nome: string;
  descricao: string | null;
  tempoPreparoMinutos: number | null;
  ativo: boolean;
  itens: ItemReceita[];
  custoTotal?: number;
  dataCriacao?: string;
  dataUltimaAlteracao?: string;
}

export interface ComponenteFormData {
  nome: string;
  descricao: string;
  tempoPreparoMinutos: number | null;
  ativo: boolean;
}

export interface ItemReceitaFormData {
  insumoId?: number;
  componenteId?: number;
  quantidade: number;
}
