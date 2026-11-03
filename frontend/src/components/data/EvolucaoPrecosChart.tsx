import { useEffect, useState } from 'react';
import { Box, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PontoGraficoPreco } from '../../types/compra';
import { formatCurrency, formatDate } from '../../utils/format';
import { EmptyState } from '../feedback/AsyncStates';

interface ChartPoint extends PontoGraficoPreco {
  dataLabel: string;
  valorUnitarioEscalado: number;
}

function multiplicadorInicial(unidadeMedida: string): number {
  const unidade = unidadeMedida.toLowerCase();
  if (unidade === 'grama' || unidade === 'ml') return 1000;
  if (unidade === 'centimetro') return 100;
  return 1;
}

function unidadeExibida(unidadeMedida: string, multiplicador: number): string {
  const unidade = unidadeMedida.toLowerCase();
  if (unidade === 'grama' && multiplicador === 1000) return 'kg';
  if (unidade === 'ml' && multiplicador === 1000) return 'L';
  if (unidade === 'centimetro' && multiplicador === 100) return 'metro';
  if (unidade === 'grama') return `${multiplicador.toLocaleString('pt-BR')} g`;
  if (unidade === 'ml') return `${multiplicador.toLocaleString('pt-BR')} ml`;
  if (unidade === 'centimetro') return `${multiplicador.toLocaleString('pt-BR')} cm`;
  return multiplicador === 1
    ? unidadeMedida
    : `${multiplicador.toLocaleString('pt-BR')} ${unidadeMedida}`;
}

interface EvolucaoPrecosChartProps {
  pontos: PontoGraficoPreco[];
  unidadeMedida: string;
}

export function EvolucaoPrecosChart({ pontos, unidadeMedida }: EvolucaoPrecosChartProps) {
  const [multiplicador, setMultiplicador] = useState(() => multiplicadorInicial(unidadeMedida));
  const [multiplicadorInput, setMultiplicadorInput] = useState(() =>
    String(multiplicadorInicial(unidadeMedida)),
  );
  const multiplicadorInvalido =
    !multiplicadorInput ||
    !Number.isFinite(Number(multiplicadorInput)) ||
    Number(multiplicadorInput) <= 0;

  useEffect(() => {
    const initialValue = multiplicadorInicial(unidadeMedida);
    setMultiplicador(initialValue);
    setMultiplicadorInput(String(initialValue));
  }, [unidadeMedida]);

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 12);
  const cutoffDate = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(
    cutoff.getDate(),
  ).padStart(2, '0')}`;
  const chartData: ChartPoint[] = pontos
    .filter((point) => point.dataCompra.slice(0, 10) >= cutoffDate)
    .sort((left, right) => left.dataCompra.localeCompare(right.dataCompra))
    .map((point) => ({
      ...point,
      dataLabel: formatDate(point.dataCompra),
      valorUnitarioEscalado: point.valorUnitario * multiplicador,
    }));

  if (chartData.length === 0) {
    return <EmptyState>Ainda não há compras nos últimos 12 meses para exibir no gráfico.</EmptyState>;
  }

  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
        }}
      >
        <Box>
          <Typography fontSize={13} fontWeight={600}>
            Visualizando valores por {unidadeExibida(unidadeMedida, multiplicador)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {multiplicador}× o valor unitário original. O histórico não é alterado.
          </Typography>
        </Box>
        <TextField
          size="small"
          label="Multiplicador"
          type="number"
          value={multiplicadorInput}
          onChange={(event) => {
            const value = event.target.value;
            setMultiplicadorInput(value);
            const parsedValue = Number(value);
            if (value && Number.isFinite(parsedValue) && parsedValue > 0) {
              setMultiplicador(parsedValue);
            }
          }}
          inputProps={{ min: '0.0001', step: 'any' }}
          InputProps={{
            endAdornment: <InputAdornment position="end">{unidadeMedida}</InputAdornment>,
          }}
          error={multiplicadorInvalido}
          helperText={
            multiplicadorInvalido
              ? 'Informe um valor válido maior que zero.'
              : 'Informe a quantidade para comparação.'
          }
          sx={{ width: { xs: '100%', sm: 220 } }}
        />
      </Box>
      <div style={{ width: '100%', height: 310 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 12, bottom: 4, left: 8 }}>
            <CartesianGrid stroke="#f1e9e3" strokeDasharray="4 5" vertical={false} />
            <XAxis
              dataKey="dataLabel"
              tick={{ fill: '#82736d', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis
              tickFormatter={(value: number) =>
                `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`
              }
              tick={{ fill: '#82736d', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={75}
            />
            <Tooltip
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as ChartPoint | undefined;
                if (!active || !point) return null;
                return (
                  <div className="chart-tooltip">
                    <strong>{point.dataLabel}</strong>
                    <div style={{ marginTop: 4, color: '#b95274' }}>
                      {formatCurrency(point.valorUnitarioEscalado)} / {unidadeExibida(unidadeMedida, multiplicador)}
                    </div>
                    {multiplicador !== 1 && (
                      <Typography variant="caption" color="text.secondary">
                        Original: {formatCurrency(point.valorUnitario)} / {unidadeMedida}
                      </Typography>
                    )}
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="valorUnitarioEscalado"
              name="Valor unitário"
              stroke="#d97493"
              strokeWidth={3}
              dot={{ r: 4, fill: '#fff', stroke: '#d97493', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#b95274' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Stack>
  );
}
