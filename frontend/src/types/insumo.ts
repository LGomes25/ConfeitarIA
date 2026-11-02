export interface Insumo {
  id: number;
  nome: string;
  unidadeMedida: string;
  ativo: boolean;
  custoUnitario: number | null;
  dataCriacao: string;
  valorUnitarioAtual?: number | null;
}

export interface InsumoDetalhe extends Insumo {
  ultimoRegistro: UltimoRegistroCompra | null;
}

export interface UltimoRegistroCompra {
  id: number;
  dataCompra: string;
  quantidade: number;
  unidadeMedida: string;
  valorTotal: number;
  valorUnitario: number;
  fornecedor: string | null;
}

export interface InsumoFormData {
  nome: string;
  unidadeMedida: string;
}
