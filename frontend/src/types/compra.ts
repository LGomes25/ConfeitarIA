export interface Compra {
  id: number;
  insumoId: number;
  insumoNome: string;
  unidadeMedida: string;
  dataCompra: string;
  quantidade: number;
  valorTotal: number;
  valorUnitario: number;
  fornecedor: string | null;
}

export interface CompraFormData {
  insumoId: number;
  dataCompra: string;
  quantidade: number;
  valorTotal: number;
  fornecedor: string;
}

export interface PontoGraficoPreco {
  dataCompra: string;
  valorUnitario: number;
  quantidade: number;
  valorTotal: number;
  fornecedor: string | null;
}

export interface GraficoEvolucaoPrecos {
  insumoId: number;
  insumoNome: string;
  unidadeMedida: string;
  insumoAtivo: boolean;
  precoAtual: number | null;
  pontos: PontoGraficoPreco[];
}
