import { useCallback, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { PageHeader } from '../components/common/PageHeader';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { InsumoFormDialog } from '../components/forms/InsumoFormDialog';
import { InsumosTable } from '../components/data/InsumosTable';
import { ErrorState, LoadingState } from '../components/feedback/AsyncStates';
import { insumosService, type StatusInsumos } from '../services/insumosService';
import { getApiErrorMessage } from '../services/api';
import type { Insumo, InsumoFormData } from '../types/insumo';
import { useAsyncData } from '../hooks/useAsyncData';

export function InsumosPage() {
  const [status, setStatus] = useState<StatusInsumos>('ativos');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);
  const [statusTarget, setStatusTarget] = useState<Insumo | null>(null);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const loadInsumos = useCallback(() => insumosService.listar(status), [status]);
  const { data: insumos, loading, error, reload } = useAsyncData(loadInsumos);

  const openCreateForm = () => {
    setSelectedInsumo(null);
    setFormOpen(true);
    setBanner(null);
  };

  const openEditForm = (insumo: Insumo) => {
    setSelectedInsumo(insumo);
    setFormOpen(true);
    setBanner(null);
  };

  const saveInsumo = async (data: InsumoFormData) => {
    setSaving(true);
    setBanner(null);
    try {
      if (selectedInsumo) {
        await insumosService.atualizar(selectedInsumo.id, data);
        setBanner({ severity: 'success', message: 'Insumo atualizado com sucesso.' });
      } else {
        await insumosService.criar(data);
        setBanner({ severity: 'success', message: 'Insumo cadastrado com sucesso.' });
      }
      setFormOpen(false);
      reload();
    } catch (cause: unknown) {
      setBanner({ severity: 'error', message: getApiErrorMessage(cause) });
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (insumo: Insumo) => {
    setBanner(null);
    if (insumo.ativo) {
      setStatusTarget(insumo);
      return;
    }

    setSaving(true);
    try {
      await insumosService.reativar(insumo.id);
      setBanner({ severity: 'success', message: 'Insumo reativado com sucesso.' });
      reload();
    } catch (cause: unknown) {
      setBanner({ severity: 'error', message: getApiErrorMessage(cause) });
    } finally {
      setSaving(false);
    }
  };

  const confirmInactivation = async () => {
    if (!statusTarget) return;
    setSaving(true);
    setBanner(null);
    try {
      await insumosService.inativar(statusTarget.id);
      setBanner({ severity: 'success', message: 'Insumo inativado com sucesso.' });
      setStatusTarget(null);
      reload();
    } catch (cause: unknown) {
      setBanner({ severity: 'error', message: getApiErrorMessage(cause) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Seus insumos"
        description="Organize seus ingredientes e acompanhe o custo de cada um."
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreateForm}>
            Novo insumo
          </Button>
        }
      />

      <Stack spacing={2.2}>
        {banner && <Alert severity={banner.severity}>{banner.message}</Alert>}
        <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box>
              <Box component="span" sx={{ fontWeight: 700, fontSize: 17 }}>
                Lista de insumos
              </Box>
              <Box component="span" sx={{ display: 'block', mt: 0.3, color: 'text.secondary', fontSize: 13 }}>
                {insumos?.length ?? 0} {insumos?.length === 1 ? 'item' : 'itens'}
              </Box>
            </Box>
            <TextField
              select
              size="small"
              label="Status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusInsumos);
                setBanner(null);
              }}
              sx={{ width: { xs: '100%', sm: 190 } }}
            >
              <MenuItem value="ativos">Ativos</MenuItem>
              <MenuItem value="inativos">Inativos</MenuItem>
              <MenuItem value="todos">Todos</MenuItem>
            </TextField>
          </Box>
          {loading && <LoadingState label="Carregando insumos..." />}
          {!loading && error && <ErrorState message={error} />}
          {!loading && !error && (
            <InsumosTable
              insumos={insumos ?? []}
              onEdit={openEditForm}
              onChangeStatus={changeStatus}
            />
          )}
        </Paper>
      </Stack>

      <InsumoFormDialog
        open={formOpen}
        insumo={selectedInsumo}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={saveInsumo}
      />
      <ConfirmDialog
        open={Boolean(statusTarget)}
        title="Inativar insumo?"
        message={`"${statusTarget?.nome ?? ''}" deixará de aparecer nas opções de novas compras. O histórico será mantido.`}
        confirmLabel="Inativar"
        busy={saving}
        onCancel={() => setStatusTarget(null)}
        onConfirm={confirmInactivation}
      />
    </>
  );
}
