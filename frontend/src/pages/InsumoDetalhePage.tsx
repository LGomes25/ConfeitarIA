import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { PageHeader } from '../components/common/PageHeader';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { StatusChip } from '../components/common/StatusChip';
import { ComprasTable } from '../components/data/ComprasTable';
import { EvolucaoPrecosChart } from '../components/data/EvolucaoPrecosChart';
import { ErrorState, LoadingState } from '../components/feedback/AsyncStates';
import { getApiErrorMessage } from '../services/api';
import { comprasService } from '../services/comprasService';
import { insumosService } from '../services/insumosService';
import type { Compra, GraficoEvolucaoPrecos } from '../types/compra';
import type { InsumoDetalhe } from '../types/insumo';
import { formatCurrency, formatDate } from '../utils/format';
import { useAsyncData } from '../hooks/useAsyncData';

interface DetailPageData {
  insumo: InsumoDetalhe;
  compras: Compra[];
  grafico: GraficoEvolucaoPrecos;
}

function MetricCard({ label, value, caption }: { label: string; value: string; caption?: string }) {
  return (
    <Paper elevation={1} sx={{ p: 2.3, minHeight: 116 }}>
      <Typography color="text.secondary" fontSize={13} fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="h2" sx={{ mt: 1, fontSize: '1.45rem' }}>
        {value}
      </Typography>
      {caption && <Typography color="text.secondary" fontSize={12} sx={{ mt: 0.4 }}>{caption}</Typography>}
    </Paper>
  );
}

export function InsumoDetalhePage() {
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const navigate = useNavigate();
  const validId = Number.isInteger(id) && id > 0;
  const [deleteTarget, setDeleteTarget] = useState<Compra | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ severity: 'success' | 'error'; text: string } | null>(null);

  const loadDetail = useCallback(async (): Promise<DetailPageData> => {
    if (!validId) throw new Error('Identificador de insumo inválido.');
    const [insumo, compras, grafico] = await Promise.all([
      insumosService.obter(id),
      insumosService.listarCompras(id),
      insumosService.obterGrafico(id),
    ]);
    return { insumo, compras, grafico };
  }, [id, validId]);
  const { data, loading, error, reload } = useAsyncData(loadDetail);

  useEffect(() => {
    if (!validId) navigate('/insumos', { replace: true });
  }, [navigate, validId]);

  if (!validId) return null;

  const deletePurchase = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionMessage(null);
    try {
      await comprasService.excluir(deleteTarget.id);
      setActionMessage({ severity: 'success', text: 'Compra excluída. O histórico e o custo atual foram atualizados.' });
      setDeleteTarget(null);
      reload();
    } catch (cause: unknown) {
      setActionMessage({ severity: 'error', text: getApiErrorMessage(cause) });
    } finally {
      setDeleting(false);
    }
  };

  const insumo = data?.insumo;
  const lastPurchase = insumo?.ultimoRegistro;

  return (
    <>
      <Button
        component={Link}
        to="/insumos"
        startIcon={<ArrowBackRoundedIcon />}
        color="inherit"
        sx={{ mb: 2 }}
      >
        Voltar para insumos
      </Button>

      {loading && <LoadingState label="Carregando detalhes do insumo..." />}
      {!loading && error && (
        <Stack spacing={2}>
          <ErrorState message={error} />
          <Button variant="outlined" onClick={reload} sx={{ alignSelf: 'flex-start' }}>
            Tentar novamente
          </Button>
        </Stack>
      )}
      {!loading && !error && data && (
        <>
          <PageHeader
            title={insumo?.nome ?? 'Detalhes do insumo'}
            description={`Acompanhe custos e compras de ${insumo?.nome ?? 'seu insumo'}.`}
            action={insumo ? <StatusChip active={insumo.ativo} /> : undefined}
          />
          <Stack spacing={2.5}>
            {actionMessage && <Alert severity={actionMessage.severity}>{actionMessage.text}</Alert>}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              <MetricCard
                label="Custo unitário atual"
                value={formatCurrency(insumo?.custoUnitario ?? insumo?.valorUnitarioAtual)}
                caption={insumo?.unidadeMedida ? `por ${insumo.unidadeMedida}` : undefined}
              />
              <MetricCard label="Última compra" value={formatDate(lastPurchase?.dataCompra)} />
              <MetricCard
                label="Quantidade da última compra"
                value={
                  lastPurchase
                    ? `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 }).format(lastPurchase.quantidade)} ${lastPurchase.unidadeMedida}`
                    : '—'
                }
              />
              <MetricCard label="Compras registradas" value={String(data.compras.length)} />
            </Box>

            {lastPurchase && (
              <Paper elevation={1} sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Box>
                    <Typography variant="h3">Último registro</Typography>
                    <Typography color="text.secondary" fontSize={13} sx={{ mt: 0.5 }}>
                      {lastPurchase.fornecedor || 'Fornecedor não informado'} · Valor total{' '}
                      {formatCurrency(lastPurchase.valorTotal)}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${formatCurrency(lastPurchase.valorUnitario)} / ${lastPurchase.unidadeMedida}`}
                    sx={{ bgcolor: '#fbe9ef', color: 'primary.dark', fontWeight: 700 }}
                  />
                </Box>
              </Paper>
            )}

            <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h3">Evolução de preços</Typography>
                <Typography color="text.secondary" fontSize={13} sx={{ mt: 0.5 }}>
                  Valor unitário registrado em cada compra nos últimos 12 meses.
                </Typography>
              </Box>
              <EvolucaoPrecosChart
                pontos={data.grafico.pontos}
                unidadeMedida={insumo?.unidadeMedida ?? data.grafico.unidadeMedida}
              />
            </Paper>

            <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h3">Histórico de compras</Typography>
                  <Typography color="text.secondary" fontSize={13} sx={{ mt: 0.5 }}>
                    Registros vinculados a este insumo.
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  to={`/compras?insumoId=${insumo?.id ?? ''}`}
                  size="small"
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                >
                  Registrar nova compra
                </Button>
              </Box>
              <ComprasTable compras={data.compras} onDelete={setDeleteTarget} />
            </Paper>
          </Stack>
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir compra?"
        message={`O registro de ${formatDate(deleteTarget?.dataCompra)} será removido. O insumo e os demais registros serão mantidos.`}
        confirmLabel="Excluir compra"
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deletePurchase}
      />
    </>
  );
}
