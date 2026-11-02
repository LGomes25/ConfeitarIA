import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import type { Insumo } from '../../types/insumo';
import { formatCurrency } from '../../utils/format';
import { StatusChip } from '../common/StatusChip';
import { EmptyState } from '../feedback/AsyncStates';
import { Link } from 'react-router-dom';

interface InsumosTableProps {
  insumos: Insumo[];
  onEdit: (insumo: Insumo) => void;
  onChangeStatus: (insumo: Insumo) => void;
}

export function InsumosTable({ insumos, onEdit, onChangeStatus }: InsumosTableProps) {
  if (insumos.length === 0) return <EmptyState>Nenhum insumo encontrado com este filtro.</EmptyState>;

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', borderColor: 'divider' }}>
      <div className="table-scroll">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Insumo</TableCell>
              <TableCell>Unidade</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Custo unitário atual</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {insumos.map((insumo) => (
              <TableRow key={insumo.id} hover>
                <TableCell sx={{ fontWeight: 650 }}>{insumo.nome}</TableCell>
                <TableCell>{insumo.unidadeMedida}</TableCell>
                <TableCell><StatusChip active={insumo.ativo} /></TableCell>
                <TableCell>{formatCurrency(insumo.custoUnitario ?? insumo.valorUnitarioAtual)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver detalhes">
                    <IconButton
                      component={Link}
                      to={`/insumos/${insumo.id}`}
                      aria-label={`Ver detalhes de ${insumo.nome}`}
                      size="small"
                    >
                      <OpenInNewRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={() => onEdit(insumo)}
                      aria-label={`Editar ${insumo.nome}`}
                      size="small"
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={insumo.ativo ? 'Inativar' : 'Reativar'}>
                    <IconButton
                      onClick={() => onChangeStatus(insumo)}
                      aria-label={`${insumo.ativo ? 'Inativar' : 'Reativar'} ${insumo.nome}`}
                      size="small"
                      color={insumo.ativo ? 'default' : 'success'}
                    >
                      {insumo.ativo ? (
                        <PauseCircleOutlineRoundedIcon fontSize="small" />
                      ) : (
                        <PlayCircleOutlineRoundedIcon fontSize="small" />
                      )}
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
