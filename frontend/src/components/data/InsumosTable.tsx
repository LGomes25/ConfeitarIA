import {
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import type { Insumo } from '../../types/insumo';
import { formatCurrency5 } from '../../utils/format';
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
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {insumos.map((insumo) => (
              <TableRow key={insumo.id} hover>
                <TableCell>
                  <Typography
                    component={Link}
                    to={`/insumos/${insumo.id}`}
                    fontWeight={650}
                    color="primary"
                    sx={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {insumo.nome}
                  </Typography>
                </TableCell>
                <TableCell>{insumo.unidadeMedida}</TableCell>
                <TableCell><StatusChip active={insumo.ativo} /></TableCell>
                <TableCell>{formatCurrency5(insumo.custoUnitario ?? insumo.valorUnitarioAtual)}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                    <Tooltip title="Detalhes">
                      <IconButton
                        component={Link}
                        to={`/insumos/${insumo.id}`}
                        aria-label={`Ver detalhes de ${insumo.nome}`}
                        size="medium"
                        color="success"
                        sx={{ color: '#2179fd'  }}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => onEdit(insumo)}
                        aria-label={`Editar ${insumo.nome}`}
                        size="medium"
                        color="warning"
                        sx={{ color: '#e69500' }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {insumo.ativo ? (
                      <Tooltip title="Inativar">
                        <IconButton
                          onClick={() => onChangeStatus(insumo)}
                          aria-label={`Inativar ${insumo.nome}`}
                          size="medium"
                          color="error"
                          sx={{ color: '#d32f2f' }}
                        >
                          <PauseCircleOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Ativar">
                        <IconButton
                          onClick={() => onChangeStatus(insumo)}
                          aria-label={`Ativar ${insumo.nome}`}
                          size="small"
                          color="success"
                          sx={{ color: '#2e7d32' }}
                        >
                          <PlayCircleOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Paper>
  );
}
