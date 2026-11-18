import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useEffect, useState } from 'react';

interface QuantidadeInputProps {
  value: number;
  onChange: (val: number) => void;
  label?: string;
  sx?: object;
  variantStyle?: 'insumo' | 'componente';
}

export function QuantidadeInput({
  value,
  onChange,
  label = 'Quantidade',
  sx = {},
  variantStyle = 'insumo',
}: QuantidadeInputProps) {
  // Mantém representação em texto para digitação manual livre
  const [text, setText] = useState<string>(() => (value ? String(value) : '1'));

  useEffect(() => {
    // Sincroniza se o valor numérico externo mudar
    const currentNum = parseFloat(text.replace(',', '.'));
    if (value !== currentNum && !isNaN(value)) {
      setText(String(value));
    }
  }, [value]);

  const handleTextChange = (raw: string) => {
    if (raw === '') {
      setText('');
      onChange(0);
      return;
    }

    // Normaliza vírgula para validação
    const normalized = raw.replace(',', '.');

    // Impede sinal negativo
    if (normalized.startsWith('-')) return;

    // Permite começar com ponto/vírgula enquanto digita
    if (normalized === '.' || normalized === '0.') {
      setText('0.');
      onChange(0);
      return;
    }

    // Limite rigoroso: no máximo 3 casas decimais
    // Aceita apenas números com até 3 dígitos após a vírgula/ponto
    const regex = /^\d+([.,]\d{0,3})?$/;
    if (!regex.test(raw)) {
      return; // Rejeita digitação de 4 ou mais casas decimais
    }

    setText(raw);
    const num = parseFloat(normalized);
    if (!isNaN(num)) {
      onChange(Math.round(num * 1000) / 1000);
    }
  };

  // Botão ↑ soma +0,5
  const handleIncrement = () => {
    const current = parseFloat((text || '0').replace(',', '.')) || 0;
    const next = Math.round((current + 0.5) * 1000) / 1000;
    setText(String(next));
    onChange(next);
  };

  // Botão ↓ subtrai -0,5 (nunca permitindo valor negativo)
  const handleDecrement = () => {
    const current = parseFloat((text || '0').replace(',', '.')) || 0;
    const next = Math.max(0, Math.round((current - 0.5) * 1000) / 1000);
    setText(String(next));
    onChange(next);
  };

  const isComponente = variantStyle === 'componente';

  return (
    <TextField
      size="small"
      label={label}
      value={text}
      onChange={(e) => handleTextChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          handleIncrement();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          handleDecrement();
        }
      }}
      inputProps={{
        inputMode: 'decimal',
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end" sx={{ ml: 0.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: 32, justifyContent: 'center' }}>
              <IconButton
                size="small"
                onClick={handleIncrement}
                tabIndex={-1}
                aria-label="Aumentar 0,5"
                sx={{
                  p: '1px',
                  height: 15,
                  width: 22,
                  color: isComponente ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isComponente ? 'rgba(184, 115, 51, 0.12)' : 'action.hover',
                  },
                }}
              >
                <KeyboardArrowUpRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleDecrement}
                tabIndex={-1}
                aria-label="Diminuir 0,5"
                sx={{
                  p: '1px',
                  height: 15,
                  width: 22,
                  color: isComponente ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isComponente ? 'rgba(184, 115, 51, 0.12)' : 'action.hover',
                  },
                }}
              >
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </InputAdornment>
        ),
      }}
      sx={{
        width: 140,
        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
        '& input[type=number]': {
          MozAppearance: 'textfield',
        },
        ...(isComponente
          ? {
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fff',
                '& fieldset': {
                  borderColor: 'rgba(184, 115, 51, 0.45)',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }
          : {}),
        ...sx,
      }}
    />
  );
}
