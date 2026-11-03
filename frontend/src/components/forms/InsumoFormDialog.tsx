import { useEffect, useState, type FormEvent } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Insumo, InsumoFormData } from '../../types/insumo';

const unidadesMedida = ['centimetro', 'metro', 'grama', 'ml', 'rolo', 'unidade'];

interface InsumoFormDialogProps {
  open: boolean;
  insumo: Insumo | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (data: InsumoFormData) => Promise<void>;
}

export function InsumoFormDialog({
  open,
  insumo,
  saving,
  onClose,
  onSubmit,
}: InsumoFormDialogProps) {
  const [nome, setNome] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('');

  useEffect(() => {
    setNome(insumo?.nome ?? '');
    const unidadeAtual = insumo?.unidadeMedida.toLowerCase() ?? '';
    setUnidadeMedida(unidadesMedida.includes(unidadeAtual) ? unidadeAtual : '');
  }, [insumo, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ nome: nome.trim(), unidadeMedida: unidadeMedida.trim() });
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{insumo ? 'Editar insumo' : 'Novo insumo'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.2} sx={{ pt: 1 }}>
            <TextField
              label="Nome do insumo"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              required
              autoFocus
              inputProps={{ maxLength: 200 }}
              fullWidth
            />
            <TextField
              select
              label="Unidade de medida"
              value={unidadeMedida}
              onChange={(event) => setUnidadeMedida(event.target.value)}
              required
              fullWidth
            >
              <MenuItem value="" disabled>
                Selecione uma unidade
              </MenuItem>
              {unidadesMedida.map((unidade) => (
                <MenuItem key={unidade} value={unidade}>
                  {unidade}
                </MenuItem>
              ))}
            </TextField>
            {insumo && !unidadesMedida.includes(insumo.unidadeMedida.toLowerCase()) && (
              <Typography color="warning.main" variant="caption">
                A unidade atual ({insumo.unidadeMedida}) não está na lista. Selecione uma unidade
                disponível para salvar.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={saving} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !nome.trim() || !unidadeMedida.trim()}
          >
            {saving ? 'Salvando...' : insumo ? 'Salvar alterações' : 'Cadastrar insumo'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
