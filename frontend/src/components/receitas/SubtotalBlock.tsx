import { TextField } from '@mui/material';
import { formatCurrency } from '../../utils/format';

interface SubtotalBlockProps {
  value: number;
  variantStyle?: 'insumo' | 'componente';
  sx?: object;
}

export function SubtotalBlock({ value, variantStyle = 'insumo', sx = {} }: SubtotalBlockProps) {
  const isComponente = variantStyle === 'componente';

  return (
    <TextField
      size="small"
      label="Subtotal"
      value={formatCurrency(value)}
      InputProps={{
        readOnly: true,
      }}
      sx={{
        width: 140,
        '& .MuiInputBase-root': {
          bgcolor: isComponente ? 'rgba(184, 115, 51, 0.08)' : 'action.hover',
          cursor: 'default',
          ...(isComponente
            ? {
                '& fieldset': {
                  borderColor: 'rgba(184, 115, 51, 0.4)',
                },
              }
            : {}),
        },
        '& .MuiInputBase-input': {
          fontWeight: isComponente ? 700 : 600,
          color: isComponente ? 'primary.main' : 'text.primary',
          textAlign: 'right',
          cursor: 'default',
        },
        ...sx,
      }}
    />
  );
}
