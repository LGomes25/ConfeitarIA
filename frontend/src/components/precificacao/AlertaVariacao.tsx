import { Alert } from '@mui/material';
import type { Precificacao } from '../../types/precificacao.types';
import { formatCurrency } from '../../utils/format';

export function AlertaVariacao({ precificacao }: { precificacao: Precificacao }) {
  if (!precificacao.alertaVariacaoPreco) return null;
  return (
    <Alert severity="warning">
      Atenção: o custo deste produto variou {precificacao.variacaoCustoPercentual?.toFixed(2) ?? '5'}% desde a última atualização.
      {' '}Custo anterior: {formatCurrency(precificacao.custoTotalAnterior)}; custo atual: {formatCurrency(precificacao.custoTotal)}.
      {' '}Revise o preço de venda.
    </Alert>
  );
}
