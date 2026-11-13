export interface Precificacao {
  produtoId: number;
  custoTotalInsumos: number;
  tempoMaoObraMinutos: number | null;
  valorHoraMaoObra: number | null;
  custoMaoDeObra: number | null;
  custoTotalAnterior: number | null;
  custoTotal: number;
  variacaoCustoPercentual: number | null;
  alertaVariacaoPreco: boolean;
  margemSugeridaPercentual: number;
  precoSugerido: number;
  precoVendaFinal: number;
  lucroBruto: number;
  margemRealSobreCusto: number;
  margemRealSobreVenda: number;
}

export interface PrecificacaoFormData {
  tempoMaoObraMinutos: number | null;
  valorHoraMaoObra: number | null;
  precoVendaFinal: number;
}

export interface RelatorioCustoPreco {
  produtoId: number;
  nomePublico: string;
  custoTotal: number;
  precoSugerido: number;
  precoVendaFinal: number;
  margemRealSobreCusto: number;
  margemRealSobreVenda: number;
  margemSugeridaPercentual: number;
  alertaVariacaoPreco: boolean;
  custoTotalAnterior: number | null;
  variacaoCustoPercentual: number | null;
}
