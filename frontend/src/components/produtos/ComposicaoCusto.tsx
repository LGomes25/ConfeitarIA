import { useState } from 'react';
import { Alert, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useComposicaoCusto } from '../../hooks/useComposicaoCusto';
import { EmptyState, ErrorState, LoadingState } from '../feedback/AsyncStates';
import { formatCurrency } from '../../utils/format';

export function ComposicaoCusto({ produtoId }: { produtoId: number }) {
  const { data, loading, error } = useComposicaoCusto(produtoId);
  const [expanded, setExpanded] = useState(false);
  if (loading) return <LoadingState label="Calculando composição de custos..." />;
  if (error) return <ErrorState message={error} />;
  const items = data?.itens ?? [];
  const paretoItems = data?.itensPareto ?? [];
  const sortedItems = items.slice().sort((a, b) => b.custoItem - a.custoItem);
  const rows = expanded ? sortedItems : sortedItems.slice(0, 5);
  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ fontSize: 18, mb: 1 }}>Análise de Impacto — Principais Custos</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Todos os insumos são exibidos individualmente. Os itens em destaque representam aproximadamente 80% do custo total.</Typography>
      {items.length === 0 ? <EmptyState>A composição ainda não possui itens de custo.</EmptyState> : (
        <>
          {!expanded && <Alert severity="info" sx={{ mb: 1 }}>Principais itens responsáveis por aproximadamente 80% do custo.</Alert>}
          <Table size="small" aria-label="Composição detalhada de custo do produto">
            <TableHead><TableRow><TableCell>Insumo</TableCell><TableCell>Origem</TableCell><TableCell>Quantidade</TableCell><TableCell align="right">Valor unitário</TableCell><TableCell align="right">Custo</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.map((item, index) => (
                <TableRow
                  key={`${item.tipo}-${item.descricao}-${index}`}
                  sx={paretoItems.some((pareto) => pareto.tipo === item.tipo && pareto.descricao === item.descricao)
                    ? { bgcolor: 'rgba(184,115,51,0.06)' }
                    : undefined}
                >
                  <TableCell>{item.descricao}</TableCell><TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.quantidade}</TableCell>
                  <TableCell align="right">{formatCurrency(item.valorUnitario)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(item.custoItem)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length > 5 && (
            <Typography
              component="button"
              type="button"
              onClick={() => setExpanded((current) => !current)}
              sx={{
                mt: 1.5,
                border: 0,
                bgcolor: 'transparent',
                color: 'primary.main',
                cursor: 'pointer',
                fontWeight: 700,
                p: 0,
              }}
            >
              {expanded ? 'Recolher lista' : `Ver todos os ${items.length} itens que compõem este produto`}
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
}
