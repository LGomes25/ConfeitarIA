import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Chip, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/AsyncStates';
import { ProdutoForm } from '../../components/produtos/ProdutoForm';
import { ItensExtrasEditor } from '../../components/produtos/ItensExtrasEditor';
import { ComposicaoCusto } from '../../components/produtos/ComposicaoCusto';
import { AlertaVariacao } from '../../components/precificacao/AlertaVariacao';
import { useAsyncData } from '../../hooks/useAsyncData';
import { usePrecificacao } from '../../hooks/usePrecificacao';
import { fase4Service } from '../../services/fase4Service';
import { getApiErrorMessage } from '../../services/api';
import type { Produto, ProdutoFormData } from '../../types/produto.types';

export function ProdutosListaPage() {
  const [status, setStatus] = useState('ativos');
  const [alvo, setAlvo] = useState<Produto | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorAction, setErrorAction] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const carregar = useCallback(() => fase4Service.listarProdutos(), [version]);
  const { data, loading, error, reload } = useAsyncData(carregar);
  const produtos = (data ?? []).filter((produto) => produto.receitaCompletaId !== null &&
    (status === 'todos' || (status === 'ativos' ? produto.ativo : !produto.ativo)));
  const inativar = async () => {
    if (!alvo) return;
    setSaving(true);
    setErrorAction(null);
    try { await fase4Service.inativarProduto(alvo.id); setAlvo(null); setVersion((current) => current + 1); }
    catch (cause) { setErrorAction(getApiErrorMessage(cause)); }
    finally { setSaving(false); }
  };
  return (
    <>
      <PageHeader title="Produtos" description="Edite os dados públicos dos produtos gerados a partir de receitas completas." />
      {errorAction && <Alert severity="error" sx={{ mb: 2 }}>{errorAction}</Alert>}
      <Stack spacing={2}>
        <TextField select label="Status" size="small" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ width: { xs: '100%', sm: 220 } }}>
          <MenuItem value="ativos">Ativos</MenuItem><MenuItem value="inativos">Inativos</MenuItem><MenuItem value="todos">Todos</MenuItem>
        </TextField>
        {loading && <LoadingState label="Carregando produtos..." />}
        {!loading && error && <Alert severity="error" action={<Button color="inherit" onClick={reload}>Tentar novamente</Button>}>{error}</Alert>}
        {!loading && !error && !produtos.length && <Paper><EmptyState>Nenhum produto encontrado.</EmptyState></Paper>}
        {!loading && !error && Boolean(produtos.length) && (
          <Paper sx={{ overflowX: 'auto', border: '1px solid #f0e7e0', borderRadius: 3 }}>
            <Table aria-label="Produtos cadastrados">
              <TableHead><TableRow><TableCell>Produto</TableCell><TableCell>Receita</TableCell><TableCell>Status</TableCell><TableCell>Alerta de custo</TableCell><TableCell align="right">Ações</TableCell></TableRow></TableHead>
              <TableBody>{produtos.map((produto) => (
                <TableRow hover key={produto.id}>
                  <TableCell><Typography fontWeight={700}>{produto.nomePublico}</Typography><Typography variant="caption" color="text.secondary">{produto.descricaoPublica}</Typography></TableCell>
                  <TableCell>{produto.receitaCompletaNome}</TableCell>
                  <TableCell><Chip size="small" label={produto.ativo ? 'Ativo' : 'Inativo'} color={produto.ativo ? 'success' : 'default'} /></TableCell>
                  <TableCell>{produto.alertaVariacaoPreco ? <Chip size="small" color="warning" label="Revisar preço" /> : '—'}</TableCell>
                  <TableCell align="right">
                    <Button component={Link} to={`/admin/produtos/${produto.id}`} aria-label={`Abrir ${produto.nomePublico}`} startIcon={<VisibilityOutlinedIcon />}>Detalhes</Button>
                    <Button component={Link} to={`/admin/produtos/${produto.id}/editar`} aria-label={`Editar ${produto.nomePublico}`} startIcon={<EditOutlinedIcon />}>Editar</Button>
                    {produto.ativo && <Button color="warning" aria-label={`Inativar ${produto.nomePublico}`} startIcon={<BlockOutlinedIcon />} onClick={() => setAlvo(produto)}>Inativar</Button>}
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </Paper>
        )}
      </Stack>
      <ConfirmDialog open={Boolean(alvo)} title="Inativar produto?" message={`"${alvo?.nomePublico ?? ''}" deixará de aparecer na vitrine pública.`} confirmLabel="Inativar" busy={saving} onCancel={() => setAlvo(null)} onConfirm={inativar} />
    </>
  );
}

export function ProdutoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const carregar = useCallback(() => fase4Service.obterProduto(Number(id)), [id]);
  const { data, loading, error: loadError } = useAsyncData(carregar);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<Array<{ insumoId: number; nome: string }>>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [ingredientsError, setIngredientsError] = useState<string | null>(null);
  useEffect(() => {
    if (!data) return;
    if (!data.receitaCompletaId) {
      setLoadingIngredients(false);
      return;
    }
    let active = true;
    setLoadingIngredients(true);
    void fase4Service.obterReceita('receita', data.receitaCompletaId)
      .then((recipe) => {
        if (!active) return;
        const byId = new Map<number, string>();
        for (const item of recipe.itens) {
          if (item.insumoId && item.insumoNome) byId.set(item.insumoId, item.insumoNome);
          for (const ingredient of item.itensComponente ?? []) {
            if (ingredient.insumoId && ingredient.insumoNome) byId.set(ingredient.insumoId, ingredient.insumoNome);
          }
        }
        setRecipeName(recipe.nome);
        setIngredients([...byId].map(([insumoId, nome]) => ({ insumoId, nome })));
      })
      .catch((cause: unknown) => { if (active) setIngredientsError(getApiErrorMessage(cause)); })
      .finally(() => { if (active) setLoadingIngredients(false); });
    return () => { active = false; };
  }, [data?.receitaCompletaId]);
  const save = async (formData: ProdutoFormData) => {
    setSaving(true); setError(null);
    try {
      const saved = await fase4Service.atualizarProduto(Number(id), formData);
      navigate(`/admin/produtos/${saved.id}`);
    } catch (cause) { setError(getApiErrorMessage(cause)); }
    finally { setSaving(false); }
  };
  if (loading || loadingIngredients) return <LoadingState label="Carregando produto..." />;
  if (loadError) return <ErrorState message={loadError} />;
  if (ingredientsError) return <ErrorState message={ingredientsError} />;
  if (data && !data.receitaCompletaId) return <ErrorState message="Este produto não está vinculado a uma receita completa." />;
  const initialValue = data ? {
    nomePublico: data.nomePublico,
    descricaoPublica: data.descricaoPublica ?? '',
    ingredientesPrincipais: data.ingredientesPrincipais ?? '',
    semLactose: data.semLactose,
    semGluten: data.semGluten,
    vegano: data.vegano,
    especificacaoExtra: data.especificacaoExtra ?? '',
    apresentarAoPublico: data.apresentarAoPublico,
    ativo: data.ativo,
  } : undefined;
  return (
    <>
      <PageHeader title="Editar produto" description="Essas informações complementam o produto gerado pela receita e podem ser exibidas na vitrine pública." />
      <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
        {data && <ProdutoForm initialValue={initialValue} receitaNome={recipeName || data.receitaCompletaNome || ''} ingredientes={ingredients} saving={saving} error={error} onSubmit={save} onCancel={() => navigate('/admin/produtos')} />}
      </Paper>
    </>
  );
}

export function ProdutoDetalhePage() {
  const { id } = useParams();
  const [version, setVersion] = useState(0);
  const carregar = useCallback(() => fase4Service.obterProduto(Number(id)), [id, version]);
  const { data: produto, loading, error, reload } = useAsyncData(carregar);
  const update = () => {
    setVersion((current) => current + 1);
    reloadPricing();
  };
  const { data: precificacao, loading: pricingLoading, error: pricingError, reload: reloadPricing } = usePrecificacao(Number(id));
  if (loading) return <LoadingState label="Carregando produto e composição..." />;
  if (error || !produto) return <Alert severity="error" action={<Button color="inherit" onClick={reload}>Tentar novamente</Button>}>{error ?? 'Produto não encontrado.'}</Alert>;
  return (
    <Stack spacing={2.2}>
      <PageHeader
        title={produto.nomePublico}
        description={produto.descricaoPublica || 'Descrição pública não informada.'}
        action={<Stack direction="row" spacing={1} flexWrap="wrap"><Button component={Link} to={`/admin/produtos/${produto.id}/editar`} variant="outlined">Editar produto</Button><Button component={Link} to={`/admin/produtos/${produto.id}/precificacao`} variant="contained">Precificação</Button></Stack>}
      />
      {precificacao && <AlertaVariacao precificacao={precificacao} />}
      {pricingError && <Alert severity="warning">Não foi possível carregar o alerta de variação: {pricingError}</Alert>}
      {pricingLoading && <LoadingState label="Consultando alertas de custo..." />}
      <Paper sx={{ p: 2.5, border: '1px solid #f0e7e0', borderRadius: 3 }}>
        <Typography variant="h2" sx={{ fontSize: 18, mb: 1 }}>Receita vinculada</Typography>
        <Typography>{produto.receitaCompletaNome ?? '—'}</Typography>
        <Typography variant="h2" sx={{ fontSize: 18, mt: 2, mb: 1 }}>Ingredientes principais</Typography>
        <Typography>{produto.ingredientesPrincipais || 'Não informados.'}</Typography>
      </Paper>
      <ItensExtrasEditor produtoId={produto.id} itens={produto.itensExtras ?? []} onChanged={update} />
      <ComposicaoCusto key={version} produtoId={produto.id} />
    </Stack>
  );
}
