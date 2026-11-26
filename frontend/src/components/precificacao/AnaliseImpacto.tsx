import { Paper } from '@mui/material';
import { ComposicaoCusto } from '../produtos/ComposicaoCusto';

export function AnaliseImpacto({ produtoId }: { produtoId: number }) {
  return (
    <Paper sx={{ p: 0, border: 'none', bgcolor: 'transparent' }}>
      <ComposicaoCusto produtoId={produtoId} />
    </Paper>
  );
}
