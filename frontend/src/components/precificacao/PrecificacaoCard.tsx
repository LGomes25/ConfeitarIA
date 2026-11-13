import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { Precificacao, PrecificacaoFormData } from '../../types/precificacao.types';
import { formatCurrency } from '../../utils/format';

export function PrecificacaoCard({
  value,
  saving,
  error,
  onSave,
}: {
  value: Precificacao;
  saving: boolean;
  error: string | null;
  onSave: (data: PrecificacaoFormData) => void;
}) {
  const [laborMinutes, setLaborMinutes] = useState(value.tempoMaoObraMinutos?.toString() ?? '');
  const [hourCost, setHourCost] = useState(value.valorHoraMaoObra?.toString() ?? '');
  const [price, setPrice] = useState(String(value.precoVendaFinal));
  useEffect(() => {
    setLaborMinutes(value.tempoMaoObraMinutos?.toString() ?? '');
    setHourCost(value.valorHoraMaoObra?.toString() ?? '');
    setPrice(String(value.precoVendaFinal));
  }, [value]);

  const preview = useMemo(() => {
    const mins = laborMinutes === '' ? 0 : Number(laborMinutes);
    const hourly = hourCost === '' ? 0 : Number(hourCost);
    const labor = mins > 0 && hourly > 0 ? mins / 60 * hourly : 0;
    const total = value.custoTotalInsumos + labor;
    const finalPrice = Number(price) || 0;
    const profit = finalPrice - total;
    return {
      labor,
      total,
      suggested: total * 2,
      profit,
      marginCost: total > 0 ? profit / total * 100 : 0,
      marginSale: finalPrice > 0 ? profit / finalPrice * 100 : 0,
    };
  }, [hourCost, laborMinutes, price, value.custoTotalInsumos]);

  const submit = () => {
    const mins = laborMinutes === '' ? null : Number(laborMinutes);
    const hourly = hourCost === '' ? null : Number(hourCost);
    const finalPrice = Number(price);
    if ((mins !== null && (!Number.isInteger(mins) || mins < 0)) ||
      (hourly !== null && (!Number.isFinite(hourly) || hourly < 0)) ||
      !Number.isFinite(finalPrice) || finalPrice <= 0) return;
    onSave({ tempoMaoObraMinutos: mins, valorHoraMaoObra: hourly, precoVendaFinal: finalPrice });
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ fontSize: 18, mb: 2 }}>Precificação</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField label="Mão de obra (minutos)" type="number" value={laborMinutes} inputProps={{ min: 0, step: 1 }} onChange={(event) => setLaborMinutes(event.target.value)} />
          <TextField label="Valor da hora (R$)" type="number" value={hourCost} inputProps={{ min: 0, step: 0.01 }} onChange={(event) => setHourCost(event.target.value)} />
        </Stack>
        <Alert severity="info">
          Insumos: {formatCurrency(value.custoTotalInsumos)} · Mão de obra: {formatCurrency(preview.labor)} · Custo total: <strong>{formatCurrency(preview.total)}</strong>
          <br />Preço sugerido (margem de 100%): <strong>{formatCurrency(preview.suggested)}</strong>
        </Alert>
        <TextField
          required
          label="Preço de venda final (R$)"
          type="number"
          value={price}
          inputProps={{ min: 0.01, step: 0.01 }}
          onChange={(event) => setPrice(event.target.value)}
          helperText="Pode ajustar o preço sugerido; as margens são recalculadas automaticamente."
        />
        <Typography variant="body2">
          Lucro bruto: <strong>{formatCurrency(preview.profit)}</strong> · Margem sobre custo: <strong>{preview.marginCost.toFixed(2)}%</strong> · Margem sobre venda: <strong>{preview.marginSale.toFixed(2)}%</strong>
        </Typography>
        <Button variant="contained" onClick={submit} disabled={saving || !Number.isFinite(Number(price)) || Number(price) <= 0}>
          {saving ? 'Salvando...' : 'Salvar preço final'}
        </Button>
      </Stack>
    </Paper>
  );
}
