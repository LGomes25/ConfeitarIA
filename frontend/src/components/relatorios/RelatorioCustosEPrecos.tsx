import { useCallback, useMemo, useState } from 'react';
import {
  Alert, Box, Button, MenuItem, Paper, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TableSortLabel, TextField, Tooltip, Typography,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Link } from 'react-router-dom';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fase4Service } from '../../services/fase4Service';
import { getApiErrorMessage } from '../../services/api';
import { EmptyState, LoadingState } from '../feedback/AsyncStates';
import { PageHeader } from '../common/PageHeader';
import { formatCurrency, formatDate } from '../../utils/format';

type MarginFilter = 'todos' | 'saudavel' | 'boa' | 'atencao' | 'abaixo' | 'acima';
type SortKey = 'nomePublico' | 'dataUltimaAtualizacao' | 'custoTotal' | 'precoVendaFinal'
  | 'margemRealSobreCusto' | 'margemRealSobreVenda' | 'variacaoCustoPercentual';

export function RelatorioCustosEPrecos() {
  const carregar = useCallback(() => fase4Service.listarRelatorio(), []);
  const { data, loading, error, reload } = useAsyncData(carregar);
  const [alertOnly, setAlertOnly] = useState(false);
  const [margin, setMargin] = useState<MarginFilter>('todos');
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('variacaoCustoPercentual');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const filtered = useMemo(() => (data ?? []).filter((row) => {
    if (alertOnly && !row.alertaVariacaoPreco) return false;
    const suggested = row.margemSugeridaPercentual;
    const margem = row.margemRealSobreCusto;
    if (margin === 'saudavel' && margem < 100) return false;
    if (margin === 'boa' && (margem < 80 || margem >= 100)) return false;
    if (margin === 'atencao' && margem >= 80) return false;
    if (margin === 'abaixo' && row.margemRealSobreCusto >= suggested) return false;
    if (margin === 'acima' && row.margemRealSobreCusto <= suggested) return false;
    return true;
  }), [alertOnly, data, margin]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === 'variacaoCustoPercentual') {
        const aValue = a.alertaVariacaoPreco ? (a.variacaoCustoPercentual ?? 0) : null;
        const bValue = b.alertaVariacaoPreco ? (b.variacaoCustoPercentual ?? 0) : null;
        if (aValue === bValue) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;
        const result = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? result : -result;
      }
      let aValue: string | number | null;
      let bValue: string | number | null;
      if (sortKey === 'nomePublico') {
        aValue = a.nomePublico.toLocaleLowerCase();
        bValue = b.nomePublico.toLocaleLowerCase();
      } else if (sortKey === 'dataUltimaAtualizacao') {
        aValue = a.dataUltimaAtualizacao ? new Date(a.dataUltimaAtualizacao).getTime() : 0;
        bValue = b.dataUltimaAtualizacao ? new Date(b.dataUltimaAtualizacao).getTime() : 0;
      } else {
        aValue = a[sortKey];
        bValue = b[sortKey];
      }
      if (aValue === bValue) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      const result = typeof aValue === 'string'
        ? aValue.localeCompare(String(bValue))
        : aValue < (bValue as number) ? -1 : 1;
      return sortDirection === 'asc' ? result : -result;
    });
  }, [filtered, sortDirection, sortKey]);

  const semVariacao = sorted.filter((row) => !row.alertaVariacaoPreco).length;
  const comAlerta = sorted.filter((row) => row.alertaVariacaoPreco).length;

  const ordenar = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const CabecalhoOrdenavel = ({
    sortKey: key,
    label,
    tooltip,
    align,
  }: {
    sortKey: SortKey;
    label: string;
    tooltip: string;
    align?: 'left' | 'right';
  }) => (
    <TableCell
      align={align}
      sx={{
        width: key === 'nomePublico' ? '28%' : undefined,
        minWidth: key === 'nomePublico' ? 180 : key === 'dataUltimaAtualizacao' ? 120 : 105,
        whiteSpace: 'normal',
        lineHeight: 1.2,
        verticalAlign: 'middle',
      }}
    >
      <TableSortLabel
        active={sortKey === key}
        direction={sortKey === key ? sortDirection : 'asc'}
        onClick={() => ordenar(key)}
        sx={{
          width: '100%',
          justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
          '& .MuiTableSortLabel-icon': { marginLeft: 0.5, marginRight: 0 },
        }}
      >
        <Stack direction="row" spacing={0.25} alignItems="center" justifyContent={align === 'right' ? 'flex-end' : 'flex-start'} sx={{ minWidth: 0 }}>
          <Box sx={{ textAlign: align === 'right' ? 'right' : 'left' }}>
            {key === 'dataUltimaAtualizacao'
              ? <>Última<br />Atualização</>
              : key === 'margemRealSobreCusto'
                ? <>Margem <br />Custo</>
                : key === 'margemRealSobreVenda'
                  ? <>Margem <br />Venda</>
                  : label}
          </Box>
          <Tooltip title={tooltip} placement="top" arrow>
            <InfoOutlinedIcon aria-label={tooltip} sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
          </Tooltip>
        </Stack>
      </TableSortLabel>
    </TableCell>
  );

  const exportar = async () => {
    setExporting(true); setExportError(null);
    try {
      const file = margin === 'acima'
        ? new Blob([
          [
            ['Produto', 'Última atualização', 'Custo total', 'Preço final', 'Margem real sobre custo', 'Margem real sobre venda', 'Alerta', 'Variação percentual'].join(';'),
            ...filtered.map((row) => [
              row.nomePublico,
              row.dataUltimaAtualizacao ? formatDate(row.dataUltimaAtualizacao) : '',
              row.custoTotal,
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
        <TextField select label="Filtrar por margem" value={margin} onChange={(event) => setMargin(event.target.value as MarginFilter)} sx={{ minWidth: 240 }}>
          <MenuItem value="todos">Todas as margens</MenuItem>
          <MenuItem value="saudavel">≥ 100% (Saudável)</MenuItem>
          <MenuItem value="boa">80% a 99%</MenuItem>
          <MenuItem value="atencao">&lt; 80% (Atenção)</MenuItem>
          <MenuItem value="abaixo">Abaixo da sugerida</MenuItem>
          <MenuItem value="acima">Acima da sugerida</MenuItem>
        </TextField>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Exibindo {sorted.length} produto(s) · ✅ {semVariacao} sem variação · ⚠️ {comAlerta} com alerta de custo
      </Typography>
      {loading && <LoadingState label="Carregando relatório de custos e preços..." />}
      {!loading && error && <Alert severity="error" action={<Button color="inherit" onClick={reload}>Tentar novamente</Button>}>{error}</Alert>}
      {!loading && !error && !filtered.length && <Paper><EmptyState>Nenhum produto corresponde aos filtros.</EmptyState></Paper>}
      {!loading && !error && Boolean(filtered.length) && (
        <Paper sx={{ overflowX: 'auto', border: '1px solid #f0e7e0', borderRadius: 3 }}>
          <Table aria-label="Relatório de custos e preços">
            <TableHead>
              <TableRow>
                <CabecalhoOrdenavel sortKey="nomePublico" label="Produto" tooltip="Nome do produto cadastrado" />
                <CabecalhoOrdenavel sortKey="dataUltimaAtualizacao" label="Última Atualização" tooltip="Data da última vez que o preço foi salvo" />
                <CabecalhoOrdenavel sortKey="custoTotal" label="Custo Total" tooltip="Custo de insumos + mão de obra por unidade" align="right" />
                <CabecalhoOrdenavel sortKey="precoVendaFinal" label="Preço Final" tooltip="Valor de venda definido por você" align="right" />
                <CabecalhoOrdenavel sortKey="margemRealSobreCusto" label="Margem Custo" tooltip="Percentual de lucro em relação ao custo" align="right" />
                <CabecalhoOrdenavel sortKey="margemRealSobreVenda" label="Margem Venda" tooltip="Percentual de lucro em relação ao preço de venda" align="right" />
                <CabecalhoOrdenavel sortKey="variacaoCustoPercentual" label="Variação" tooltip="Diferença percentual entre o custo atual e o da última precificação" align="right" />
              </TableRow>
            </TableHead>
            <TableBody>{sorted.map((row) => (
              <TableRow hover key={row.produtoId}>
                <TableCell><Typography component={Link} to={`/admin/produtos/${row.produtoId}/precificacao`} fontWeight={700} color="primary">{row.nomePublico}</Typography></TableCell>
                <TableCell>{row.dataUltimaAtualizacao ? formatDate(row.dataUltimaAtualizacao) : '—'}</TableCell>
                <TableCell align="right">{formatCurrency(row.custoTotal)}</TableCell>
                <TableCell align="right">{formatCurrency(row.precoVendaFinal)}</TableCell>
                <TableCell align="right" sx={{
                  color: row.margemRealSobreCusto >= 100
                    ? '#629b81'
                    : row.margemRealSobreCusto >= 80
                      ? '#c88753'
                      : '#d66c68',
                  fontWeight: 700,
                }}>
                  {row.margemRealSobreCusto.toFixed(2)}%
                </TableCell>
                <TableCell align="right">{row.margemRealSobreVenda.toFixed(2)}%</TableCell>
                <TableCell align="right">
                  {!row.alertaVariacaoPreco || row.variacaoCustoPercentual == null
                    ? <Typography color="text.secondary">—</Typography>
                    : row.variacaoCustoPercentual > 0
                      ? <Typography sx={{ color: '#c75b5b', bgcolor: 'rgba(214,108,104,0.08)', px: 0.75, py: 0.25, borderRadius: 1, display: 'inline-block' }}>
                        +{row.variacaoCustoPercentual.toFixed(2)}%
                      </Typography>
                      : row.variacaoCustoPercentual < 0
                        ? <Typography sx={{ color: '#629b81', bgcolor: 'rgba(98,155,129,0.08)', px: 0.75, py: 0.25, borderRadius: 1, display: 'inline-block' }}>
                          {row.variacaoCustoPercentual.toFixed(2)}%
                        </Typography>
                        : <Typography color="text.secondary">—</Typography>}
                </TableCell>
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
