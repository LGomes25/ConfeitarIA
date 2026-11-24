import { useCallback, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fase4Service } from '../../services/fase4Service';
import { formatCurrency, formatDate } from '../../utils/format';
import { EmptyState, LoadingState } from '../feedback/AsyncStates';

interface EvolucaoPoint {
  data: string;
  dataLabel: string;
  custo: number;
  preco: number;
  margem: number;
  variacaoMargem: number | null;
}

function EvolucaoTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: EvolucaoPoint }>;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <Paper variant="outlined" sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.96)' }}>
      <Typography variant="caption" fontWeight={700}>{formatDate(point.data)}</Typography>
      <Typography variant="body2">{formatCurrency(point.custo)} · Custo</Typography>
      <Typography variant="body2">{formatCurrency(point.preco)} · Preço</Typography>
      <Typography variant="body2">{point.margem.toFixed(2)}% · Margem</Typography>
    </Paper>
  );
}

export function EvolucaoPrecificacao({ produtoId }: { produtoId: number }) {
  const [expanded, setExpanded] = useState(false);
  const carregar = useCallback(
    () => fase4Service.listarHistoricoPrecificacao(produtoId),
    [produtoId],
  );
  const { data, loading, error, reload } = useAsyncData(carregar);

  const rows = [...(data ?? [])].sort((a, b) =>
    new Date(b.dataRegistro).getTime() - new Date(a.dataRegistro).getTime(),
  );
  const chartData: EvolucaoPoint[] = rows
    .slice()
    .reverse()
    .map((item) => ({
      data: item.dataRegistro,
      dataLabel: formatDate(item.dataRegistro),
      custo: item.custoTotal,
      preco: item.precoVendaFinal,
      margem: item.margemLucro,
      variacaoMargem: item.variacaoMargem,
    }));

  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ fontSize: 18, mb: 0.5 }}>
        Evolução — Custo × Preço × Margem
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Período: últimos 12 meses · Registrado automaticamente ao salvar
      </Typography>

      <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={700}>O que cada linha significa:</Typography>
        <Typography variant="body2">🔵 Custo Total → Quanto custou para produzir</Typography>
        <Typography variant="body2">🟣 Preço de Venda → Por quanto você vendeu</Typography>
        <Typography variant="body2">🟢 Margem de Lucro → Quanto percentual de lucro sobrou</Typography>
        <Typography variant="caption" color="text.secondary">
          ✅ estável/positivo · ⚠️ atenção: margem diminuiu
        </Typography>
      </Alert>

      {loading && <LoadingState label="Carregando evolução..." />}
      {!loading && error && (
        <Alert severity="error" action={<Typography component="button" onClick={reload}>Tentar novamente</Typography>}>
          {error}
        </Alert>
      )}
      {!loading && !error && rows.length === 0 && (
        <EmptyState>
          Ainda não há registros salvos. O histórico será criado a partir da primeira precificação salva.
        </EmptyState>
      )}
      {!loading && !error && rows.length > 0 && (
        <>
          <Box sx={{ width: '100%', height: 330 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                <XAxis dataKey="dataLabel" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="money" tickFormatter={(value) => formatCurrency(Number(value))} width={82} />
                <YAxis yAxisId="percent" orientation="right" tickFormatter={(value) => `${value}%`} width={55} />
                <Tooltip content={<EvolucaoTooltip />} />
                <Legend />
                <Line yAxisId="money" type="monotone" dataKey="custo" name="Custo Total" stroke="#1976d2" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="money" type="monotone" dataKey="preco" name="Preço de Venda" stroke="#9c27b0" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="percent" type="monotone" dataKey="margem" name="Margem de Lucro" stroke="#2e7d32" strokeWidth={3} dot={(props: { cx?: number; cy?: number; payload?: EvolucaoPoint }) => {
                  const decreased = (props.payload?.variacaoMargem ?? 0) < 0;
                  return (
                    <g>
                      <circle cx={props.cx} cy={props.cy} r={7} fill="#fff" stroke="#2e7d32" strokeWidth={2} />
                      <text x={props.cx} y={(props.cy ?? 0) + 3} textAnchor="middle" fontSize={8}>
                        {decreased ? '⚠️' : '✅'}
                      </text>
                    </g>
                  );
                }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Accordion expanded={expanded} onChange={(_, open) => setExpanded(open)} sx={{ mt: 1.5 }} variant="outlined">
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
              <Typography fontWeight={700}>Histórico completo</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pb: 0 }}>
              <Table size="small" aria-label="Histórico de precificação">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell align="right">Custo Total</TableCell>
                    <TableCell align="right">Preço de Venda</TableCell>
                    <TableCell align="right">Margem</TableCell>
                    <TableCell align="right">Variação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{formatDate(row.dataRegistro)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.custoTotal)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.precoVendaFinal)}</TableCell>
                      <TableCell align="right">{row.margemLucro.toFixed(2)}%</TableCell>
                      <TableCell align="right">
                        {row.variacaoMargem === null
                          ? '—'
                          : `${row.variacaoMargem >= 0 ? '+' : ''}${row.variacaoMargem.toFixed(2)} p.p.`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Paper>
  );
}
