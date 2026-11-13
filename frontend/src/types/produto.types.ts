import type { ItemExtraProduto } from './itemExtraProduto.types';

export interface ProdutoPublico {
  nomePublico: string;
  descricaoPublica: string | null;
  ingredientesPrincipais: string | null;
}

export interface Produto {
  id: number;
  nomePublico: string;
  descricaoPublica: string | null;
  ingredientesPrincipais: string | null;
  receitaCompletaId: number | null;
  receitaCompletaNome: string | null;
  semLactose: boolean;
  semGluten: boolean;
  vegano: boolean;
  especificacaoExtra: string | null;
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
  semLactose: boolean;
  semGluten: boolean;
  vegano: boolean;
  especificacaoExtra: string;
  apresentarAoPublico: boolean;
  ativo: boolean;
}
