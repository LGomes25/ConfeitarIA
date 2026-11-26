export interface ItemComposicaoCusto {
  tipo: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  custoItem: number;
  percentualDoCusto: number;
}

export interface ComposicaoCusto {
  produtoId: number;
  produtoNome: string;
  custoTotalInsumos: number;
  custoTotal: number;
  itens: ItemComposicaoCusto[];
  itensPareto: ItemComposicaoCusto[];
  demaisItens: ItemComposicaoCusto[];
  custoDemaisItens: number;
}
