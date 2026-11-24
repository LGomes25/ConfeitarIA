import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Precificacao, PrecificacaoFormData } from '../../types/precificacao.types';
import { formatCurrency } from '../../utils/format';

function Kpi({
  icon,
  name,
  value,
  tip,
  highlight = false,
}: {
  icon: ReactNode;
  name: string;
  value: string;
  tip: string;
  highlight?: boolean;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: highlight ? 'rgba(184,115,51,0.06)' : 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
        <Box sx={{ color: highlight ? 'primary.main' : 'text.secondary', display: 'flex' }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>{name}</Typography>
        <Tooltip title={tip}>
          <InfoOutlinedIcon aria-label={`Explicação: ${name}`} sx={{ fontSize: 17, color: 'text.secondary', cursor: 'help' }} />
        </Tooltip>
      </Box>
      <Typography fontWeight={800} fontSize={18}>{value}</Typography>
    </Paper>
  );
}

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
  const [laborExpanded, setLaborExpanded] = useState(false);
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

  const marginStatus = preview.marginCost >= 100
    ? {
        message: '✅ Excelente — margem saudável',
        background: 'rgba(98,155,129,0.12)',
        border: '#629b81',
      }
    : preview.marginCost >= 80
      ? {
          message: '⚠️ Boa — fique atento às variações de custo',
          background: 'rgba(245,185,66,0.14)',
          border: '#c88753',
        }
      : preview.marginCost >= 60
        ? {
            message: '⚠️ Margem apertada — acompanhe seus custos',
            background: 'rgba(230,153,74,0.14)',
            border: '#d9893d',
          }
        : {
            message: '❌ Atenção — este preço pode não cobrir os custos reais',
            background: 'rgba(214,108,104,0.12)',
            border: '#d66c68',
          };

  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ fontSize: 18, mb: 2 }}>Precificação</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2}>
        <Accordion
          expanded={laborExpanded}
          onChange={(_, expanded) => setLaborExpanded(expanded)}
          variant="outlined"
          disableGutters
          sx={{ borderRadius: '11px', '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1, gap: 2 }}>
              <Typography fontWeight={700}>⏱️ Mão de Obra (clique para expandir)</Typography>
              <Typography variant="body2" fontWeight={700} color="primary.main">
                Custo: {formatCurrency(preview.labor)}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pt: 0 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
              <TextField
                label="Tempo de preparo (min)"
                type="number"
                value={laborMinutes}
                inputProps={{ min: 0, step: 1 }}
                onChange={(event) => setLaborMinutes(event.target.value)}
                sx={{ flex: 1, minWidth: { xs: '100%', sm: 180 } }}
              />
              <Typography color="text.secondary" fontWeight={700}>×</Typography>
              <TextField
                label="Valor da mão de obra / hora (R$)"
                type="number"
                value={hourCost}
                inputProps={{ min: 0, step: 0.01 }}
                onChange={(event) => setHourCost(event.target.value)}
                sx={{ flex: 1, minWidth: { xs: '100%', sm: 220 } }}
              />
              <Typography color="text.secondary" fontWeight={700}>=</Typography>
              <TextField
                label="Custo de Mão de Obra"
                value={formatCurrency(preview.labor)}
                InputProps={{ readOnly: true }}
                sx={{ flex: 1, minWidth: { xs: '100%', sm: 180 } }}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ mb: 1 }}>
            💡 Preço Sugerido (100%): {formatCurrency(preview.suggested)}
          </Typography>
          <TextField
            required
            fullWidth
            label="Preço de venda final (R$)"
            type="number"
            value={price}
            inputProps={{ min: 0.01, step: 0.01 }}
            onChange={(event) => setPrice(event.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: marginStatus.background,
                '& fieldset': { borderColor: marginStatus.border, borderWidth: 2 },
                '&:hover fieldset': { borderColor: marginStatus.border },
                '&.Mui-focused fieldset': { borderColor: marginStatus.border },
              },
            }}
          />
          <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
            {marginStatus.message}
          </Typography>
        </Paper>
        {Math.abs(Number(price || 0) - preview.suggested) > 0.01 && (
          <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
            O preço final está diferente do preço sugerido. Você pode vender pelo valor que considerar adequado.
          </Alert>
        )}
        {value.alertaVariacaoPreco && (
          <Alert severity="warning" variant="outlined" sx={{ py: 0.5 }}>
            O custo atualizou — verifique se o preço ainda está adequado.
          </Alert>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          <Kpi icon={<Inventory2OutlinedIcon />} name="Custo de Insumos" value={formatCurrency(value.custoTotalInsumos)} tip="Quanto custam apenas os ingredientes e materiais usados neste produto." />
          <Kpi icon={<AccessTimeOutlinedIcon />} name="Custo de Mão de Obra" value={formatCurrency(preview.labor)} tip="Quanto custa o tempo de trabalho para fazer este produto. Calculado a partir do tempo informado multiplicado pelo valor da sua hora de trabalho." />
          <Kpi icon={<AccountBalanceWalletOutlinedIcon />} name="Custo Total" value={formatCurrency(preview.total)} tip="Quanto custa, no total, para produzir uma unidade deste produto. É a soma de todos os ingredientes + mão de obra." highlight />
          <Kpi icon={<TrendingUpOutlinedIcon />} name="Lucro Bruto" value={formatCurrency(preview.profit)} tip="O quanto sobra do preço depois de pagar todos os custos. É o dinheiro que efetivamente fica com você antes de outras despesas." />
          <Kpi icon={<PercentOutlinedIcon />} name="Margem sobre Venda (%)" value={`${preview.marginSale.toFixed(2)}%`} tip="Quanto do preço de venda é lucro. Exemplo: vendeu por R$ 70, lucrou R$ 30, 42,5% do valor recebido é lucro." />
          <Kpi icon={<PercentOutlinedIcon />} name="Margem sobre Custo (%)" value={`${preview.marginCost.toFixed(2)}%`} tip="Quanto você ganha em relação ao que gastou. Exemplo: se gastou R$ 40 e vendeu por R$ 80, lucrou 100% sobre o custo." />
        </Box>
        <Button
          variant="contained"
          onClick={submit}
          disabled={saving || !Number.isFinite(Number(price)) || Number(price) <= 0}
          sx={value.alertaVariacaoPreco ? { boxShadow: '0 0 0 3px rgba(245,185,66,0.22)' } : undefined}
        >
          {saving ? 'Salvando...' : 'Salvar preço final'}
        </Button>
      </Stack>
    </Paper>
  );
}
