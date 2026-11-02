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
}

export function EvolucaoPrecosChart({ pontos }: { pontos: PontoGraficoPreco[] }) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 12);
  const cutoffDate = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(
    cutoff.getDate(),
  ).padStart(2, '0')}`;
  const chartData: ChartPoint[] = pontos
    .filter((point) => point.dataCompra.slice(0, 10) >= cutoffDate)
    .sort((left, right) => left.dataCompra.localeCompare(right.dataCompra))
    .map((point) => ({ ...point, dataLabel: formatDate(point.dataCompra) }));

  if (chartData.length === 0) {
    return <EmptyState>Ainda não há compras nos últimos 12 meses para exibir no gráfico.</EmptyState>;
  }

  return (
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
            tickFormatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
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
                    {formatCurrency(point.valorUnitario)} / unidade
                  </div>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="valorUnitario"
            name="Valor unitário"
            stroke="#d97493"
            strokeWidth={3}
            dot={{ r: 4, fill: '#fff', stroke: '#d97493', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#b95274' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
