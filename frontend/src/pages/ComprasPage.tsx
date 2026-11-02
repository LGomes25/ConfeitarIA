import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { CompraForm } from '../components/forms/CompraForm';
import { ErrorState, LoadingState } from '../components/feedback/AsyncStates';
import { insumosService } from '../services/insumosService';
import { comprasService } from '../services/comprasService';
import { getApiErrorMessage } from '../services/api';
import { useAsyncData } from '../hooks/useAsyncData';
import type { CompraFormData } from '../types/compra';
import { formatCurrency, formatDate } from '../utils/format';

export function ComprasPage() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error'; text: string } | null>(null);
  const [searchParams] = useSearchParams();
  const initialInsumoId = searchParams.get('insumoId') ?? '';
  const loadInsumos = useCallback(() => insumosService.listar('ativos'), []);
  const { data: insumos, loading, error } = useAsyncData(loadInsumos);

  const registerPurchase = async (data: CompraFormData): Promise<boolean> => {
    setSaving(true);
    setMessage(null);
    try {
      const compra = await comprasService.registrar(data);
      setMessage({
        severity: 'success',
        text: `Compra registrada em ${formatDate(compra.dataCompra)}. Custo unitário calculado: ${formatCurrency(compra.valorUnitario)}.`,
      });
      return true;
    } catch (cause: unknown) {
      setMessage({ severity: 'error', text: getApiErrorMessage(cause) });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Registrar compra"
        description="Registre a entrada de ingredientes e mantenha seu histórico sempre atualizado."
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.25fr) minmax(270px, 0.75fr)' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h3">Dados da compra</Typography>
              <Typography color="text.secondary" fontSize={14} sx={{ mt: 0.6 }}>
                Preencha os dados da nota ou do comprovante.
              </Typography>
            </Box>
            {message && <Alert severity={message.severity}>{message.text}</Alert>}
            {loading && <LoadingState label="Carregando insumos disponíveis..." />}
            {error && <ErrorState message={error} />}
            {!error && (
              <CompraForm
                insumos={insumos ?? []}
                initialInsumoId={initialInsumoId}
                loading={loading}
                saving={saving}
                onSubmit={registerPurchase}
              />
            )}
          </Stack>
        </Paper>

        <Paper
          elevation={1}
          sx={{
            p: 2.5,
            bgcolor: '#fff8f4',
            border: '1px solid #f4e7df',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.dark',
              bgcolor: '#fbe5ed',
              borderRadius: 3,
              mb: 2,
            }}
          >
            <ReceiptLongOutlinedIcon />
          </Box>
          <Typography variant="h3">Cada compra conta</Typography>
          <Typography color="text.secondary" fontSize={14} sx={{ mt: 1, lineHeight: 1.7 }}>
            O valor unitário é calculado automaticamente pela API a partir do valor total dividido
            pela quantidade. Assim, o histórico de preços fica consistente e confiável.
          </Typography>
          <Typography color="text.secondary" fontSize={14} sx={{ mt: 1.5, lineHeight: 1.7 }}>
            Para consultar ou excluir registros, abra os detalhes do insumo correspondente.
          </Typography>
        </Paper>
      </Box>
    </>
  );
}
