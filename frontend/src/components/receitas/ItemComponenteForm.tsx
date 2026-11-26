import { Box, Collapse, IconButton, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { useState } from 'react';
import type { Componente, ItemReceita } from '../../types/componente.types';
import type { ItemReceitaDraft } from './ItemReceitaEditor';
import { QuantidadeInput } from './QuantidadeInput';
import { SubtotalBlock } from './SubtotalBlock';

interface ItemComponenteFormProps {
  item: ItemReceitaDraft;
  componente: Componente | undefined;
  onUpdate: (patch: Partial<ItemReceitaDraft>) => void;
  onRemove: () => void;
}

export function ItemComponenteForm({
  item,
  componente,
  onUpdate,
  onRemove,
}: ItemComponenteFormProps) {
  const [expanded, setExpanded] = useState(false);

  const unitCost = componente
    ? componente.custoTotal ??
      (componente.itens ?? []).reduce((acc, sub) => acc + (sub.custoItem ?? 0), 0)
    : 0;
  const subtotal = (Number(item.quantidade) || 0) * unitCost;

  const RADIUS = '11px'; // tema: MuiOutlinedInput borderRadius: 11
  const BORDER = '1px solid rgba(0,0,0,0.23)';

  return (
    /*
     * CSS Grid: 4 colunas
     *   col1: nome do componente (flex: 1) + lista expansível
     *   col2: Quantidade
     *   col3: Subtotal
     *   col4: Lixeira
     *
     * alignItems: 'start' → col2/col3/col4 ficam SEMPRE alinhados ao topo
     * da col1, independente de quantas linhas a lista expansível ocupar.
     */
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: 1.5,
        alignItems: 'start',
        // Mobile: empilha nome em cima, controles em linha abaixo
        '@media (max-width: 600px)': {
          gridTemplateColumns: '1fr',
          '& > *:not(:first-of-type)': {
            display: 'inline-flex',
          },
        },
      }}
    >
      {/* ── Col 1: nome + lista expansível ── */}
      <Box sx={{ minWidth: 0 }}>
        {/* Campo nome, clicável para expandir */}
        <Box
          onClick={() => setExpanded((v) => !v)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            px: 1.75,
            height: 40,  // mesma altura do TextField size="small"
            cursor: 'pointer',
            border: BORDER,
            borderRadius: expanded ? `${RADIUS} ${RADIUS} 0 0` : RADIUS,
            borderBottomColor: expanded ? 'transparent' : 'rgba(0,0,0,0.23)',
            bgcolor: '#fff',
            transition: 'border-color 0.15s',
            '&:hover': { borderColor: 'rgba(0,0,0,0.87)' },
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            🧩 {componente?.nome ?? 'Componente'}
          </Typography>
          {expanded
            ? <ExpandLessRoundedIcon fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
            : <ExpandMoreRoundedIcon fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />}
        </Box>

        {/* Lista de insumos – somente abaixo do campo nome */}
        <Collapse in={expanded}>
          <Box
            sx={{
              bgcolor: 'rgba(184,115,51,0.08)',
              border: BORDER,
              borderTop: 'none',
              borderRadius: `0 0 ${RADIUS} ${RADIUS}`,
              px: 1.75,
              py: 1,
            }}
          >
            {componente?.itens?.length ? (
              componente.itens.map((ing: ItemReceita) => (
                <Box
                  key={ing.id}
                  sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.5 }}
                >
                  <Typography variant="body2">{ing.insumoNome}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {ing.quantidade} {ing.unidadeMedida}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Este componente ainda não possui insumos.
              </Typography>
            )}
          </Box>
        </Collapse>
      </Box>

      {/* ── Col 2: Quantidade ── */}
      <QuantidadeInput
        value={item.quantidade}
        onChange={(qtd) => onUpdate({ quantidade: qtd })}
        variantStyle="componente"
      />

      {/* ── Col 3: Subtotal ── */}
      <SubtotalBlock value={subtotal} variantStyle="componente" />

      {/* ── Col 4: Lixeira ── */}
      <IconButton
        aria-label={`Remover componente ${item.componenteNome || ''}`}
        color="error"
        size="small"
        onClick={onRemove}
        sx={{ p: 1, borderRadius: RADIUS, '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}
      >
        <DeleteOutlineRoundedIcon />
      </IconButton>
    </Box>
  );
}
