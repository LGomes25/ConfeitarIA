import { Paper, Typography } from '@mui/material';
import { ComposicaoCusto } from '../produtos/ComposicaoCusto';

export function AnaliseImpacto({ produtoId }: { produtoId: number }) {
  return (
    <Paper sx={{ p: 0, border: 'none', bgcolor: 'transparent' }}>
      <Typography variant="h2" sx={{ fontSize: 18, mb: 1.5 }}>Análise de impacto (Pareto)</Typography>
      <ComposicaoCusto produtoId={produtoId} />
    </Paper>
  );
}
