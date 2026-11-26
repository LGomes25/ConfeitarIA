import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { ItemInsumoForm } from './ItemInsumoForm';
import { ItemComponenteForm } from './ItemComponenteForm';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useMemo, useState } from 'react';
import type { Insumo } from '../../types/insumo';
import type { Componente, ItemReceita, ItemReceitaFormData } from '../../types/componente.types';
import { formatCurrency } from '../../utils/format';

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

  // Cálculo de Custo Total em tempo real
  const custoTotalCalculado = useMemo(() => {
    return itens.reduce((sum, item) => {
      const qtd = Number(item.quantidade) || 0;
      if (item.componenteId) {
        const comp = componentes.find((c) => c.id === item.componenteId);
        const compCost = comp?.custoTotal ?? (comp?.itens ?? []).reduce((acc, sub) => acc + (sub.custoItem || 0), 0);
        return sum + qtd * compCost;
      }
      if (item.insumoId) {
        const insumo = insumos.find((i) => i.id === item.insumoId);
        const unitCost = Number(insumo?.custoUnitario ?? insumo?.valorUnitarioAtual ?? 0);
        return sum + qtd * unitCost;
      }
      return sum;
    }, 0);
  }, [itens, insumos, componentes]);

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
      {itens.map((item, index) => {
        if (item.componenteId) {
          const comp = componentes.find((c) => c.id === item.componenteId);
          return (
            <ItemComponenteForm
              key={item.id ?? `novo-${index}`}
              item={item}
              componente={comp}
              onUpdate={(patch) => atualizar(index, patch)}
              onRemove={() => onChange(itens.filter((_, i) => i !== index))}
            />
          );
        }
        // insumo item
        return (
          <ItemInsumoForm
            key={item.id ?? `novo-${index}`}
            item={item}
            index={index}
            insumos={insumos}
            onUpdate={(patch) => atualizar(index, patch)}
            onRemove={() => onChange(itens.filter((_, i) => i !== index))}
          />
        );
      })}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, pt: 1 }}>
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
        <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', fontSize: '1.1rem' }}>
          Custo Total: {formatCurrency(custoTotalCalculado)}
        </Typography>
      </Box>
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
