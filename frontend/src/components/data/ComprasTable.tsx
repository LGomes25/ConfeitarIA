import { IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import type { Compra } from '../../types/compra';
import { formatCurrency, formatDate } from '../../utils/format';
import { EmptyState } from '../feedback/AsyncStates';

interface ComprasTableProps {
  compras: Compra[];
  onDelete: (compra: Compra) => void;
}

export function ComprasTable({ compras, onDelete }: ComprasTableProps) {
  if (compras.length === 0) return <EmptyState>Nenhuma compra registrada para este insumo.</EmptyState>;

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', borderColor: 'divider' }}>
      <div className="table-scroll">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Valor total</TableCell>
              <TableCell>Valor unitário</TableCell>
              <TableCell>Fornecedor</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {compras.map((compra) => (
              <TableRow key={compra.id} hover>
                <TableCell>{formatDate(compra.dataCompra)}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 }).format(compra.quantidade)}{' '}
                  {compra.unidadeMedida}
                </TableCell>
                <TableCell>{formatCurrency(compra.valorTotal)}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(compra.valorUnitario)}</TableCell>
                <TableCell>{compra.fornecedor || '—'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Excluir compra">
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Excluir compra de ${formatDate(compra.dataCompra)}`}
                      onClick={() => onDelete(compra)}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Paper>
  );
}
