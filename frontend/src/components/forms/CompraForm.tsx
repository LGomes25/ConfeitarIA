import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import type { Insumo } from '../../types/insumo';
import type { CompraFormData } from '../../types/compra';
import { todayAsInputValue } from '../../utils/format';

interface CompraFormProps {
  insumos: Insumo[];
  initialInsumoId?: string;
  loading: boolean;
  saving: boolean;
  onSubmit: (data: CompraFormData) => Promise<boolean>;
}

export function CompraForm({
  insumos,
  initialInsumoId = '',
  loading,
  saving,
  onSubmit,
}: CompraFormProps) {
  const [insumoId, setInsumoId] = useState('');
  const [dataCompra, setDataCompra] = useState(todayAsInputValue);
  const [quantidade, setQuantidade] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const activeInsumos = insumos.filter((insumo) => insumo.ativo);

  useEffect(() => {
    if (
      !insumoId &&
      initialInsumoId &&
      insumos.some((insumo) => insumo.ativo && String(insumo.id) === initialInsumoId)
    ) {
      setInsumoId(initialInsumoId);
    }
  }, [initialInsumoId, insumoId, insumos]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const saved = await onSubmit({
      insumoId: Number(insumoId),
      dataCompra,
      quantidade: Number(quantidade),
      valorTotal: Number(valorTotal),
      fornecedor: fornecedor.trim(),
    });
    if (saved) {
      setQuantidade('');
      setValorTotal('');
      setFornecedor('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        {activeInsumos.length === 0 && !loading && (
          <Alert severity="info">
            Cadastre ou reative um insumo antes de registrar uma compra.
          </Alert>
        )}
        <TextField
          select
          label="Insumo"
          value={insumoId}
          onChange={(event) => setInsumoId(event.target.value)}
          required
          disabled={loading || activeInsumos.length === 0}
          fullWidth
        >
          {activeInsumos.map((insumo) => (
            <MenuItem key={insumo.id} value={insumo.id}>
              {insumo.nome} ({insumo.unidadeMedida})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Data da compra"
          type="date"
          value={dataCompra}
          onChange={(event) => setDataCompra(event.target.value)}
          required
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Quantidade"
            type="number"
            value={quantidade}
            onChange={(event) => setQuantidade(event.target.value)}
            inputProps={{ min: '0.0001', step: '0.0001' }}
            helperText="Informe a quantidade na unidade do insumo."
            required
            fullWidth
          />
          <TextField
            label="Valor total"
            type="number"
            value={valorTotal}
            onChange={(event) => setValorTotal(event.target.value)}
            inputProps={{ min: '0', step: '0.01' }}
            helperText="O custo unitário é calculado pela API."
            required
            fullWidth
          />
        </Box>
        <TextField
          label="Fornecedor (opcional)"
          value={fornecedor}
          onChange={(event) => setFornecedor(event.target.value)}
          inputProps={{ maxLength: 200 }}
          fullWidth
        />
        <Alert severity="info" icon={false} sx={{ bgcolor: '#fff8f1', color: 'text.secondary' }}>
          <Typography variant="body2">
            Não é necessário informar o valor unitário. Ele será calculado automaticamente com base
            na quantidade e no valor total.
          </Typography>
        </Alert>
        <Button
          type="submit"
          variant="contained"
          startIcon={<AddRoundedIcon />}
          disabled={
            saving ||
            loading ||
            activeInsumos.length === 0 ||
            !insumoId ||
            !dataCompra ||
            Number(quantidade) <= 0 ||
            Number(valorTotal) < 0
          }
          fullWidth
          sx={{ mt: 0.5 }}
        >
          {saving ? 'Registrando compra...' : 'Registrar compra'}
        </Button>
      </Stack>
    </Box>
  );
}
