import { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useComposicaoCusto } from '../../hooks/useComposicaoCusto';
import { EmptyState, ErrorState, LoadingState } from '../feedback/AsyncStates';
import { formatCurrency } from '../../utils/format';

export function ComposicaoCusto({ produtoId }: { produtoId: number }) {
  const { data, loading, error } = useComposicaoCusto(produtoId);
  const [expanded, setExpanded] = useState(false);
  if (loading) return <LoadingState label="Calculando composição de custos..." />;
  if (error) return <ErrorState message={error} />;
  const items = data?.itens ?? [];
  const paretoItems = data?.itensPareto ?? items
    .slice()
    .sort((a, b) => b.custoItem - a.custoItem);
  const demaisItens = data?.demaisItens ?? [];
  const rows = expanded ? items : paretoItems;
  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ fontSize: 18, mb: 1 }}>Composição detalhada de custos</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Todos os insumos são exibidos individualmente, incluindo os componentes usados na montagem.</Typography>
      {items.length === 0 ? <EmptyState>A composição ainda não possui itens de custo.</EmptyState> : (
        <>
          {!expanded && <Alert severity="info" sx={{ mb: 1 }}>Principais itens responsáveis por aproximadamente 80% do custo.</Alert>}
          <Table size="small" aria-label="Composição detalhada de custo do produto">
            <TableHead><TableRow><TableCell>Insumo</TableCell><TableCell>Origem</TableCell><TableCell>Quantidade</TableCell><TableCell>Valor unitário</TableCell><TableCell>Custo</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.map((item, index) => (
                <TableRow key={`${item.tipo}-${item.descricao}-${index}`}>
                  <TableCell>{item.descricao}</TableCell><TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.quantidade}</TableCell>
                  <TableCell>{formatCurrency(item.valorUnitario)}</TableCell>
                  <TableCell>{formatCurrency(item.custoItem)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Accordion expanded={expanded} onChange={(_, open) => setExpanded(open)} elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
              <Typography>{expanded ? 'Recolher lista completa' : `Ver todos os ${items.length} itens (incluindo os demais insumos)`}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {!expanded && demaisItens.map((item, index) => (
                <Typography key={`${item.tipo}-${item.descricao}-${index}`} variant="body2" color="text.secondary">
                  {item.descricao}: {formatCurrency(item.custoItem)}
                </Typography>
              ))}
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Paper>
  );
}
