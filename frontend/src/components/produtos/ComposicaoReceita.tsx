import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useComposicaoCusto } from '../../hooks/useComposicaoCusto';
import { EmptyState, ErrorState, LoadingState } from '../feedback/AsyncStates';

export function ComposicaoReceita({ produtoId }: { produtoId: number }) {
  const { data, loading, error } = useComposicaoCusto(produtoId);

  if (loading) return <LoadingState label="Carregando composição da receita..." />;
  if (error) return <ErrorState message={error} />;

  const items = data?.itens ?? [];

  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ fontSize: 18, mb: 1 }}>
        Composição da Receita
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Esta é a composição completa da receita, com todos os ingredientes e quantidades utilizados no preparo.
      </Typography>

      {items.length === 0 ? (
        <EmptyState>A receita ainda não possui insumos cadastrados.</EmptyState>
      ) : (
        <Table size="small" aria-label="Composição dos ingredientes da receita">
          <TableHead>
            <TableRow>
              <TableCell>Insumo</TableCell>
              <TableCell>Origem</TableCell>
              <TableCell>Quantidade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={`${item.tipo}-${item.descricao}-${index}`} hover>
                <TableCell>{item.descricao}</TableCell>
                <TableCell>{item.tipo}</TableCell>
                <TableCell>{item.quantidade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}
