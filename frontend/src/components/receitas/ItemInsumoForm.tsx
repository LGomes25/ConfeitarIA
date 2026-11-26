import { Box, IconButton, MenuItem, TextField } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import type { Insumo } from '../../types/insumo';
import type { ItemReceitaDraft } from './ItemReceitaEditor';
import { QuantidadeInput } from './QuantidadeInput';
import { SubtotalBlock } from './SubtotalBlock';

interface ItemInsumoFormProps {
  item: ItemReceitaDraft;
  index: number;
  insumos: Insumo[];
  onUpdate: (patch: Partial<ItemReceitaDraft>) => void;
  onRemove: () => void;
}

export function ItemInsumoForm({
  item,
  index,
  insumos,
  onUpdate,
  onRemove,
}: ItemInsumoFormProps) {
  const insumo = item.insumoId ? insumos.find((i) => i.id === item.insumoId) : undefined;
  const unitCost = insumo ? Number(insumo.custoUnitario ?? insumo.valorUnitarioAtual ?? 0) : 0;
  const subtotal = (Number(item.quantidade) || 0) * unitCost;

  return (
    /*
     * CSS Grid: 4 colunas – espelha exatamente o ItemComponenteForm
     *   col1: select Insumo (flex: 1)
     *   col2: Quantidade
     *   col3: Subtotal
     *   col4: Lixeira
     *
     * alignItems: 'center' centraliza verticalmente (linha de altura fixa ~40px)
     */
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: 1.5,
        alignItems: 'center',
      }}
    >
      {/* Col 1: select de Insumo */}
      <TextField
        select
        required
        size="small"
        label="Insumo"
        value={item.insumoId || ''}
        onChange={(event) => onUpdate({ insumoId: Number(event.target.value) })}
        sx={{ width: '100%' }}
      >
        {insumos.map((i) => (
          <MenuItem key={i.id} value={i.id}>
            {i.nome} ({i.unidadeMedida})
          </MenuItem>
        ))}
      </TextField>

      {/* Col 2: Quantidade */}
      <QuantidadeInput
        value={item.quantidade}
        onChange={(qtd) => onUpdate({ quantidade: qtd })}
        variantStyle="insumo"
      />

      {/* Col 3: Subtotal */}
      <SubtotalBlock value={subtotal} variantStyle="insumo" />

      {/* Col 4: Lixeira */}
      <IconButton
        aria-label={`Remover insumo ${index + 1}`}
        color="error"
        onClick={onRemove}
        sx={{ p: 1, borderRadius: 1.5, '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}
      >
        <DeleteOutlineRoundedIcon />
      </IconButton>
    </Box>
  );
}
