import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useState } from 'react';
import type { Insumo } from '../../types/insumo';
import type { Componente, ItemReceita, ItemReceitaFormData } from '../../types/componente.types';

export interface ItemReceitaDraft extends ItemReceitaFormData, Partial<Pick<ItemReceita, 'componenteNome' | 'itensComponente'>> {
  id?: number;
}

export function ItemReceitaEditor({
  itens,
  insumos,
  componentes = [],
  permitirComponentes = false,
  onChange,
}: {
  itens: ItemReceitaDraft[];
  insumos: Insumo[];
  componentes?: Componente[];
  permitirComponentes?: boolean;
  onChange: (itens: ItemReceitaDraft[]) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [componenteSelecionado, setComponenteSelecionado] = useState('');
  const atualizar = (index: number, patch: Partial<ItemReceitaDraft>) => {
    onChange(itens.map((item, current) => current === index ? { ...item, ...patch } : item));
  };
  const adicionarComponente = () => {
    const component = componentes.find((item) => item.id === Number(componenteSelecionado));
    if (!component) return;
    onChange([...itens, {
      componenteId: component.id,
      componenteNome: component.nome,
      itensComponente: component.itens,
      quantidade: 1,
    }]);
    setComponenteSelecionado('');
    setDialogOpen(false);
  };
  return (
    <Stack spacing={1.5}>
      {itens.map((item, index) => (
        item.componenteId ? (
          <Accordion key={item.id ?? `novo-${index}`} disableGutters variant="outlined" sx={{ borderRadius: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ flex: '1 1 180px', fontWeight: 700 }}>🧩 {item.componenteNome}</Typography>
                <TextField
                  type="number"
                  size="small"
                  label="Quantidade"
                  value={item.quantidade}
                  inputProps={{ min: 0.0001, step: 0.0001 }}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => atualizar(index, { quantidade: Number(event.target.value) })}
                  sx={{ width: 140 }}
                />
                <IconButton
                  aria-label={`Remover componente ${item.componenteNome}`}
                  color="error"
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange(itens.filter((_, current) => current !== index));
                  }}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={0.75}>
                {(item.itensComponente ?? []).map((ingredient) => (
                  <Box key={ingredient.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Typography>{ingredient.insumoNome}</Typography>
                    <Typography color="text.secondary">{ingredient.quantidade} {ingredient.unidadeMedida}</Typography>
                  </Box>
                ))}
                {!item.itensComponente?.length && <Typography color="text.secondary">Este componente ainda não possui insumos.</Typography>}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ) : (
          <Box key={item.id ?? `novo-${index}`} sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              select
              required
              label="Insumo"
              value={item.insumoId || ''}
              onChange={(event) => atualizar(index, { insumoId: Number(event.target.value) })}
              sx={{ flex: '1 1 220px' }}
            >
              {insumos.map((insumo) => (
                <MenuItem key={insumo.id} value={insumo.id}>{insumo.nome} ({insumo.unidadeMedida})</MenuItem>
              ))}
            </TextField>
            <TextField
              required
              type="number"
              label="Quantidade"
              value={item.quantidade}
              inputProps={{ min: 0.0001, step: 0.0001 }}
              onChange={(event) => atualizar(index, { quantidade: Number(event.target.value) })}
              sx={{ width: { xs: '100%', sm: 160 } }}
            />
            <IconButton
              aria-label={`Remover insumo ${index + 1}`}
              color="error"
              onClick={() => onChange(itens.filter((_, current) => current !== index))}
            >
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </Box>
        )
      ))}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
        <Button
          type="button"
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          onClick={() => onChange([...itens, { insumoId: 0, quantidade: 1 }])}
        >
          Adicionar insumo
        </Button>
        {permitirComponentes && (
          <Button type="button" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>
            Adicionar Componente
          </Button>
        )}
      </Stack>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Adicionar componente</DialogTitle>
        <DialogContent>
          <TextField
            select
            autoFocus
            fullWidth
            label="Componente"
            value={componenteSelecionado}
            onChange={(event) => setComponenteSelecionado(event.target.value)}
            sx={{ mt: 1 }}
          >
            {componentes.map((component) => (
              <MenuItem key={component.id} value={component.id}>{component.nome}</MenuItem>
            ))}
          </TextField>
          {!componentes.length && <Typography color="text.secondary" sx={{ mt: 2 }}>Nenhum componente ativo disponível.</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={adicionarComponente} disabled={!componenteSelecionado}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
