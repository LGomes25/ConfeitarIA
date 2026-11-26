import type { ItemExtraProduto } from './itemExtraProduto.types';

export interface ProdutoPublico {
  nomePublico: string;
  descricaoPublica: string | null;
  ingredientesPrincipais: string | null;
  semLactose?: boolean;
  semGluten?: boolean;
  vegano?: boolean;
  especificacoesAdicionais?: string | null;
  tipoProduto?: string | null;
}

export interface Produto {
  id: number;
  nomePublico: string;
  descricaoPublica: string | null;
  ingredientesPrincipais: string | null;
  receitaCompletaId: number | null;
  receitaCompletaNome: string | null;
  tipoProduto?: string | null;
  semLactose: boolean;
  semGluten: boolean;
  vegano: boolean;
  especificacoesAdicionais?: string | null;
  especificacaoExtra?: string | null;
  apresentarAoPublico: boolean;
  ativo: boolean;
  componentes: ProdutoComponente[];
  itensExtras: ItemExtraProduto[];
  alertaVariacaoPreco?: boolean;
  dataCriacao?: string;
  dataUltimaAlteracao?: string;
}

export interface ProdutoComponente {
  id: number;
  componenteId: number | null;
  componenteNome?: string | null;
  receitaCompletaId: number | null;
  receitaCompletaNome?: string | null;
  ordem: number;
}

export interface ProdutoFormData {
  nomePublico: string;
  descricaoPublica: string;
  ingredientesPrincipais: string;
  tipoProduto: string;
  especificacoesAdicionais: string;
  especificacaoExtra?: string;
  semLactose: boolean;
  semGluten: boolean;
  vegano: boolean;
  apresentarAoPublico: boolean;
  ativo: boolean;
  receitaCompletaId?: number | null;
  componentes?: Array<{ componenteId?: number; receitaCompletaId?: number; ordem: number }>;
  itensExtras?: Array<{ insumoId?: number; descricaoItem?: string; quantidade?: number; valorUnitario?: number }>;
}

export const TIPOS_PRODUTO = [
  { value: 'bolos', label: 'Bolos' },
  { value: 'sobremesas', label: 'Sobremesas' },
  { value: 'docinhos-festa', label: 'Docinhos de Festa' },
  { value: 'bolos-decorados', label: 'Bolos Decorados' },
  { value: 'massas-salgadas', label: 'Massas Salgadas' },
  { value: 'edicao-limitada', label: 'Edição Limitada' },
  { value: 'combo', label: 'Combo' },
  { value: 'outros', label: 'Outros' },
] as const;
