import { useState } from 'react';
import { Alert, Button, Stack } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { PrecificacaoCard } from '../../components/precificacao/PrecificacaoCard';
import { AlertaVariacao } from '../../components/precificacao/AlertaVariacao';
import { AnaliseImpacto } from '../../components/precificacao/AnaliseImpacto';
import { LoadingState } from '../../components/feedback/AsyncStates';
import { usePrecificacao } from '../../hooks/usePrecificacao';
import { fase4Service } from '../../services/fase4Service';
import { getApiErrorMessage } from '../../services/api';
import type { PrecificacaoFormData } from '../../types/precificacao.types';

export function PrecificacaoPage() {
  const { id } = useParams();
  const produtoId = Number(id);
  const { data, loading, error, reload } = usePrecificacao(produtoId);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const save = async (payload: PrecificacaoFormData) => {
    setSaving(true); setSaveError(null); setSuccess(false);
    try {
      await fase4Service.salvarPrecificacao(produtoId, payload);
      setSuccess(true);
      reload();
    } catch (cause) {
      setSaveError(getApiErrorMessage(cause));
    } finally { setSaving(false); }
  };
  if (loading) return <LoadingState label="Carregando dados de precificação..." />;
  if (error || !data) return <Alert severity="error">{error ?? 'Dados de precificação indisponíveis.'}<Button color="inherit" onClick={reload}>Tentar novamente</Button></Alert>;
  return (
    <Stack spacing={2.2}>
      <PageHeader title="Precificação do produto" description="Ajuste mão de obra e preço final. Os indicadores são recalculados ao editar." action={<Button component={Link} to={`/admin/produtos/${produtoId}`} variant="outlined">Voltar ao produto</Button>} />
      {success && <Alert severity="success">Preço final salvo. O alerta de variação foi revisado.</Alert>}
      <AlertaVariacao precificacao={data} />
      <PrecificacaoCard value={data} saving={saving} error={saveError} onSave={save} />
      <AnaliseImpacto produtoId={produtoId} />
    </Stack>
  );
}
