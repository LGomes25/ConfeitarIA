import { useCallback, useMemo, useState } from 'react';
import { Alert, Button, Chip, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { Link } from 'react-router-dom';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fase4Service } from '../../services/fase4Service';
import { getApiErrorMessage } from '../../services/api';
import { EmptyState, LoadingState } from '../feedback/AsyncStates';
import { PageHeader } from '../common/PageHeader';
import { formatCurrency } from '../../utils/format';

type MarginFilter = 'todos' | 'abaixo' | 'acima';

export function RelatorioCustosEPrecos() {
  const carregar = useCallback(() => fase4Service.listarRelatorio(), []);
  const { data, loading, error, reload } = useAsyncData(carregar);
  const [alertOnly, setAlertOnly] = useState(false);
  const [margin, setMargin] = useState<MarginFilter>('todos');
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const filtered = useMemo(() => (data ?? []).filter((row) => {
    if (alertOnly && !row.alertaVariacaoPreco) return false;
    const suggested = row.margemSugeridaPercentual;
    if (margin === 'abaixo' && row.margemRealSobreCusto >= suggested) return false;
    if (margin === 'acima' && row.margemRealSobreCusto <= suggested) return false;
    return true;
  }), [alertOnly, data, margin]);

  const exportar = async () => {
    setExporting(true); setExportError(null);
    try {
      const file = margin === 'acima'
        ? new Blob([
          [
            ['Produto', 'Custo total', 'Preço sugerido', 'Preço final', 'Margem real sobre custo', 'Margem real sobre venda', 'Alerta', 'Variação percentual'].join(';'),
            ...filtered.map((row) => [
              row.nomePublico,
              row.custoTotal,
              row.precoSugerido,
              row.precoVendaFinal,
              row.margemRealSobreCusto,
              row.margemRealSobreVenda,
              row.alertaVariacaoPreco ? 'Sim' : 'Não',
              row.variacaoCustoPercentual ?? '',
            ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
          ].join('\r\n'),
        ], { type: 'text/csv;charset=utf-8' })
        : await fase4Service.exportarRelatorio({
          alerta: alertOnly ? true : undefined,
          margemAbaixoSugerida: margin === 'abaixo' ? true : undefined,
        });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'custos-e-precos.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) { setExportError(getApiErrorMessage(cause)); }
    finally { setExporting(false); }
  };

  return (
    <>
      <PageHeader title="Custos e preços" description="Acompanhe custo total, preço sugerido, margem e alertas de variação." action={<Button variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={() => void exportar()} disabled={exporting}>{exporting ? 'Exportando...' : 'Exportar planilha'}</Button>} />
      {exportError && <Alert severity="error" sx={{ mb: 2 }}>{exportError}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField select label="Variação de custo" value={alertOnly ? 'alertas' : 'todos'} onChange={(event) => setAlertOnly(event.target.value === 'alertas')} sx={{ minWidth: 210 }}>
          <MenuItem value="todos">Todos os ativos</MenuItem><MenuItem value="alertas">Somente com alerta</MenuItem>
        </TextField>
        <TextField select label="Margem real (sobre custo)" value={margin} onChange={(event) => setMargin(event.target.value as MarginFilter)} sx={{ minWidth: 240 }}>
          <MenuItem value="todos">Todas as margens</MenuItem><MenuItem value="abaixo">Abaixo da sugerida</MenuItem><MenuItem value="acima">Acima da sugerida</MenuItem>
        </TextField>
      </Stack>
      {loading && <LoadingState label="Carregando relatório de custos e preços..." />}
      {!loading && error && <Alert severity="error" action={<Button color="inherit" onClick={reload}>Tentar novamente</Button>}>{error}</Alert>}
      {!loading && !error && !filtered.length && <Paper><EmptyState>Nenhum produto corresponde aos filtros.</EmptyState></Paper>}
      {!loading && !error && Boolean(filtered.length) && (
        <Paper sx={{ overflowX: 'auto', border: '1px solid #f0e7e0', borderRadius: 3 }}>
          <Table aria-label="Relatório de custos e preços">
            <TableHead><TableRow><TableCell>Produto</TableCell><TableCell>Custo total</TableCell><TableCell>Preço sugerido</TableCell><TableCell>Preço final</TableCell><TableCell>Margem / custo</TableCell><TableCell>Margem / venda</TableCell><TableCell>Variação</TableCell></TableRow></TableHead>
            <TableBody>{filtered.map((row) => (
              <TableRow hover key={row.produtoId}>
                <TableCell><Typography component={Link} to={`/admin/produtos/${row.produtoId}/precificacao`} fontWeight={700} color="primary">{row.nomePublico}</Typography></TableCell>
                <TableCell>{formatCurrency(row.custoTotal)}</TableCell><TableCell>{formatCurrency(row.precoSugerido)}</TableCell><TableCell>{formatCurrency(row.precoVendaFinal)}</TableCell>
                <TableCell>{row.margemRealSobreCusto.toFixed(2)}%</TableCell><TableCell>{row.margemRealSobreVenda.toFixed(2)}%</TableCell>
                <TableCell>{row.alertaVariacaoPreco ? <Chip size="small" color="warning" label={`${row.variacaoCustoPercentual?.toFixed(2) ?? ''}% · revisar`} /> : '—'}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </Paper>
      )}
      {!loading && !error && data && data.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Abra um produto para consultar a composição e ajustar o preço.
        </Typography>
      )}
    </>
  );
}
