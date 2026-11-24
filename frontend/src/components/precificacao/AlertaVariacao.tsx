import { Alert, Box, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { Precificacao } from '../../types/precificacao.types';
import { formatCurrency } from '../../utils/format';

export function AlertaVariacao({ precificacao }: { precificacao: Precificacao }) {
  const variacao = precificacao.variacaoCustoPercentual ?? 0;
  const changed = Math.abs(variacao) > 0.0001;
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
        <Typography variant="subtitle2" fontWeight={700}>Alerta de variação de custo</Typography>
        <Tooltip title="Sempre que o custo dos insumos muda, o sistema compara com a última vez que você precificou. Se houve alteração, ele avisa para você conferir se o preço de venda ainda está adequado.">
          <InfoOutlinedIcon aria-label="Sobre o alerta de variação" sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
        </Tooltip>
      </Box>
      {changed ? (
        <Alert severity="warning" variant="outlined" sx={{ bgcolor: 'rgba(245, 185, 66, 0.08)' }}>
          O custo variou {Math.abs(variacao).toFixed(2)}% desde a última precificação.
          {' '}Último custo: {formatCurrency(precificacao.custoTotalAnterior)} · Atual: {formatCurrency(precificacao.custoTotal)}.
          {' '}Revise o preço de venda.
        </Alert>
      ) : (
        <Alert severity="info" variant="outlined" sx={{ bgcolor: 'action.hover', py: 0.5 }}>
          Custo atual: {formatCurrency(precificacao.custoTotal)} — sem alteração desde a última precificação.
        </Alert>
      )}
    </Box>
  );
}
