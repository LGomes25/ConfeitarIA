import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/AsyncStates';
import { ProdutoForm, type IngredienteItem } from '../../components/produtos/ProdutoForm';
import { ComposicaoReceita } from '../../components/produtos/ComposicaoReceita';
import { AlertaVariacao } from '../../components/precificacao/AlertaVariacao';
import { useAsyncData } from '../../hooks/useAsyncData';
import { usePrecificacao } from '../../hooks/usePrecificacao';
import { useAuth } from '../../context/AuthContext';
import { fase4Service } from '../../services/fase4Service';
import { insumosService } from '../../services/insumosService';
import { getApiErrorMessage } from '../../services/api';
import type { Produto, ProdutoFormData } from '../../types/produto.types';
import { TIPOS_PRODUTO } from '../../types/produto.types';
import type { Insumo } from '../../types/insumo';
import type { ReceitaCompleta } from '../../types/receitaCompleta.types';
import type { Componente } from '../../types/componente.types';

export function ProdutosListaPage() {
  const { sessao } = useAuth();
  const podeEditar =
    sessao?.usuario.perfis.some((role) => {
      const r = role.toLowerCase();
      return r === 'admin' || r === 'manager';
    }) ?? false;

  const [status, setStatus] = useState('ativos');
  const [origem, setOrigem] = useState('todos');
  const [tipo, setTipo] = useState('todos');
  const [alerta, setAlerta] = useState('todos');

  const [alvo, setAlvo] = useState<Produto | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorAction, setErrorAction] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const carregar = useCallback(
    () => fase4Service.listarProdutos({ status, origem, tipo, alerta }),
    [status, origem, tipo, alerta, version],
  );
  const { data: produtos, loading, error, reload } = useAsyncData(carregar);

  const inativar = async () => {
    if (!alvo) return;
    setSaving(true);
    setErrorAction(null);
    try {
      await fase4Service.inativarProduto(alvo.id);
      setAlvo(null);
      setVersion((current) => current + 1);
    } catch (cause) {
      setErrorAction(getApiErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  const ativar = async (produto: Produto) => {
    setSaving(true);
    setErrorAction(null);
    try {
      const payload: ProdutoFormData = {
        nomePublico: produto.nomePublico,
        descricaoPublica: produto.descricaoPublica ?? '',
        ingredientesPrincipais: produto.ingredientesPrincipais ?? '',
        tipoProduto: produto.tipoProduto ?? 'PADRAO',
        especificacoesAdicionais: produto.especificacoesAdicionais ?? produto.especificacaoExtra ?? '',
        especificacaoExtra: produto.especificacoesAdicionais ?? produto.especificacaoExtra ?? '',
        semLactose: produto.semLactose,
        semGluten: produto.semGluten,
        vegano: produto.vegano,
        apresentarAoPublico: produto.apresentarAoPublico,
        ativo: true,
        receitaCompletaId: produto.receitaCompletaId,
      };
      await fase4Service.atualizarProduto(produto.id, payload);
      setVersion((current) => current + 1);
    } catch (cause) {
      setErrorAction(getApiErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Gerencie os produtos gerados a partir de receitas ou criados de forma personalizada."
        action={
          podeEditar ? (
            <Button
              component={Link}
              to="/admin/produtos/novo"
              variant="contained"
              startIcon={<AddRoundedIcon />}
            >
              Novo Produto
            </Button>
          ) : undefined
        }
      />
      {errorAction && <Alert severity="error" sx={{ mb: 2 }}>{errorAction}</Alert>}

      <Stack spacing={2}>
        {/* Barra de Filtros: Status, Origem, Tipo, Alerta de Custo */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 1 }}
        >
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="ativos">Ativos</MenuItem>
            <MenuItem value="inativos">Inativos</MenuItem>
            <MenuItem value="todos">Todos</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Origem"
            value={origem}
            onChange={(e) => setOrigem(e.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="receita">da Receita</MenuItem>
            <MenuItem value="personalizado">Personalizado</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="todos">Todos</MenuItem>
            {TIPOS_PRODUTO.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Alerta de custo"
            value={alerta}
            onChange={(e) => setAlerta(e.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="com-alerta">Com alerta</MenuItem>
            <MenuItem value="sem-alerta">Sem alerta</MenuItem>
          </TextField>
        </Stack>

        {loading && <LoadingState label="Carregando produtos..." />}
        {!loading && error && (
          <Alert severity="error" action={<Button color="inherit" onClick={reload}>Tentar novamente</Button>}>
            {error}
          </Alert>
        )}
        {!loading && !error && (!produtos || produtos.length === 0) && (
          <Paper><EmptyState>Nenhum produto encontrado com os filtros selecionados.</EmptyState></Paper>
        )}
        {!loading && !error && Boolean(produtos?.length) && (
          <Paper sx={{ overflowX: 'auto', border: '1px solid #f0e7e0', borderRadius: 3 }}>
            <Table aria-label="Produtos cadastrados">
              <TableHead>
                <TableRow>
                  <TableCell>Produto</TableCell>
                  <TableCell>Origem</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Alerta de custo</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {produtos?.map((produto) => {
                  const tipoLabel =
                    TIPOS_PRODUTO.find((t) => t.value === produto.tipoProduto)?.label ?? '—';
                  const origemLabel = produto.receitaCompletaId
                    ? `Receita — ${produto.receitaCompletaNome || 'Receita'}`
                    : 'Personalizado';

                  return (
                    <TableRow hover key={produto.id}>
                      <TableCell>
                        <Typography fontWeight={700}>{produto.nomePublico}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {produto.descricaoPublica || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{origemLabel}</TableCell>
                      <TableCell>{tipoLabel}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={produto.ativo ? 'Ativo' : 'Inativo'}
                          color={produto.ativo ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {produto.alertaVariacaoPreco ? (
                          <Chip size="small" color="warning" label="⚠️ Revisar preço" />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                          <Tooltip title="Detalhes">
                            <IconButton
                              size="medium"
                              component={Link}
                              to={`/admin/produtos/${produto.id}`}
                              aria-label={`Abrir detalhes de ${produto.nomePublico}`}
                              color="success"
                              sx={{ color: '#2179fd'  }}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {podeEditar && (
                            <Tooltip title="Editar">
                              <IconButton
                                size="medium"
                                component={Link}
                                to={`/admin/produtos/${produto.id}/editar`}
                                aria-label={`Editar ${produto.nomePublico}`}
                                color="warning"
                                sx={{ color: '#e69500' }}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {podeEditar && (
                            produto.ativo ? (
                              <Tooltip title="Inativar">
                                <IconButton
                                  size="medium"
                                  color="error"
                                  aria-label={`Inativar ${produto.nomePublico}`}
                                  onClick={() => setAlvo(produto)}
                                  sx={{ color: '#d32f2f' }}
                                >
                                  <PauseCircleOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Ativar">
                                <IconButton
                                  size="medium"
                                  color="success"
                                  aria-label={`Ativar ${produto.nomePublico}`}
                                  onClick={() => void ativar(produto)}
                                  sx={{ color: '#2e7d32' }}
                                >
                                  <PlayCircleOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Stack>

      <ConfirmDialog
        open={Boolean(alvo)}
        title="Inativar produto?"
        message={`"${alvo?.nomePublico ?? ''}" deixará de aparecer na vitrine pública.`}
        confirmLabel="Inativar"
        busy={saving}
        onCancel={() => setAlvo(null)}
        onConfirm={inativar}
      />
    </>
  );
}

export function ProdutoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCriacao = !id;

  const [productData, setProductData] = useState<Produto | null>(null);
  const [ingredientes, setIngredients] = useState<IngredienteItem[]>([]);
  const [receitas, setReceitas] = useState<ReceitaCompleta[]>([]);
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [loadedInsumos, loadedReceitas, loadedComponentes] = await Promise.all([
          insumosService.listar('ativos'),
          fase4Service.listarReceitas('receita'),
          fase4Service.listarReceitas('componente'),
        ]);

        if (!active) return;
        setInsumos(loadedInsumos);
        setReceitas(loadedReceitas as ReceitaCompleta[]);
        setComponentes(loadedComponentes as Componente[]);

        if (!isCriacao && id) {
          const produto = await fase4Service.obterProduto(Number(id));
          if (!active) return;
          setProductData(produto);

          // Se vinculado a receita, carrega os insumos da receita
          if (produto.receitaCompletaId) {
            const recipe = await fase4Service.obterReceita('receita', produto.receitaCompletaId);
            if (!active) return;

            const principaisSet = new Set(
              (produto.ingredientesPrincipais ?? '')
                .split(',')
                .map((n) => n.trim().toLowerCase())
                .filter(Boolean),
            );

            const items: IngredienteItem[] = [];
            const blockId = `receita-${produto.receitaCompletaId}-${Date.now()}`;
            for (const item of recipe.itens ?? []) {
              if (item.insumoId && item.insumoNome) {
                items.push({
                  insumoId: item.insumoId,
                  nome: item.insumoNome,
                  origem: `Receita — ${recipe.nome}`,
                  quantidade: `${item.quantidade} ${item.unidadeMedida ?? ''}`.trim(),
                  isPrincipal: principaisSet.has(item.insumoNome.toLowerCase()),
                  blockId,
                  blockOrigemId: produto.receitaCompletaId,
                });
              }
              for (const sub of item.itensComponente ?? []) {
                if (sub.insumoId && sub.insumoNome) {
                  items.push({
                    insumoId: sub.insumoId,
                    nome: sub.insumoNome,
                    origem: `Componente — ${item.componenteNome ?? recipe.nome}`,
                    quantidade: `${sub.quantidade} ${sub.unidadeMedida ?? ''}`.trim(),
                    isPrincipal: principaisSet.has(sub.insumoNome.toLowerCase()),
                    blockId,
                    blockOrigemId: produto.receitaCompletaId,
                  });
                }
              }
            }
            setIngredients(items);
          } else {
            const principaisSet = new Set(
              (produto.ingredientesPrincipais ?? '')
                .split(',')
                .map((n) => n.trim().toLowerCase())
                .filter(Boolean),
            );
            const items: IngredienteItem[] = [];
            for (const link of produto.componentes ?? []) {
              if (link.receitaCompletaId) {
                const recipe = (loadedReceitas as ReceitaCompleta[]).find((item) => item.id === link.receitaCompletaId);
                if (!recipe) continue;
                const blockId = `receita-${recipe.id}-${link.id}-${Date.now()}`;
                for (const item of recipe.itens ?? []) {
                  if (item.insumoId && item.insumoNome) {
                    items.push({
                      insumoId: item.insumoId,
                      nome: item.insumoNome,
                      origem: `Receita — ${recipe.nome}`,
                      quantidade: `${item.quantidade} ${item.unidadeMedida ?? ''}`.trim(),
                      isPrincipal: principaisSet.has(item.insumoNome.toLowerCase()),
                      blockId,
                      blockOrigemId: recipe.id,
                    });
                  }
                  for (const sub of item.itensComponente ?? []) {
                    if (sub.insumoId && sub.insumoNome) {
                      items.push({
                        insumoId: sub.insumoId,
                        nome: sub.insumoNome,
                        origem: `Componente — ${item.componenteNome ?? recipe.nome}`,
                        quantidade: `${sub.quantidade} ${sub.unidadeMedida ?? ''}`.trim(),
                        isPrincipal: principaisSet.has(sub.insumoNome.toLowerCase()),
                        blockId,
                        blockOrigemId: recipe.id,
                      });
                    }
                  }
                }
              } else if (link.componenteId) {
                const component = (loadedComponentes as Componente[]).find((item) => item.id === link.componenteId);
                if (!component) continue;
                const blockId = `componente-${component.id}-${link.id}-${Date.now()}`;
                for (const item of component.itens ?? []) {
                  if (item.insumoId && item.insumoNome) {
                    items.push({
                      insumoId: item.insumoId,
                      nome: item.insumoNome,
                      origem: `Componente — ${component.nome}`,
                      quantidade: `${item.quantidade} ${item.unidadeMedida ?? ''}`.trim(),
                      isPrincipal: principaisSet.has(item.insumoNome.toLowerCase()),
                      blockId,
                      blockOrigemId: component.id,
                    });
                  }
                }
              }
            }
            setIngredients(items);
          }
        }
      } catch (cause) {
        if (active) setError(getApiErrorMessage(cause));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadAll();
    return () => {
      active = false;
    };
  }, [id, isCriacao]);

  const save = async (formData: ProdutoFormData) => {
    setSaving(true);
    setError(null);
    try {
      if (isCriacao) {
        const saved = await fase4Service.criarProduto(formData);
        navigate(`/admin/produtos/${saved.id}`);
      } else {
        const saved = await fase4Service.atualizarProduto(Number(id), formData);
        navigate(`/admin/produtos/${saved.id}`);
      }
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Carregando dados do produto..." />;
  if (error && !productData && !isCriacao) return <ErrorState message={error} />;

  const origemNome = isCriacao
    ? 'Personalizado'
    : productData?.receitaCompletaId
    ? `Receita — ${productData.receitaCompletaNome || 'Receita'}`
    : 'Personalizado';

  return (
    <>
      <PageHeader
        title={isCriacao ? 'Novo produto' : 'Editar produto'}
        description={
          isCriacao
            ? 'Cadastre um novo produto com características, ingredientes e itens extras.'
            : 'Atualize os dados e a apresentação pública do produto.'
        }
        action={
          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/admin/produtos')}
          >
            Voltar
          </Button>
        }
      />
      <Paper sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
        <ProdutoForm
          initialValue={productData ?? undefined}
          origemNome={origemNome}
          ingredientesIniciais={ingredientes}
          receitasDisponiveis={receitas}
          componentesDisponiveis={componentes}
          insumosDisponiveis={insumos}
          saving={saving}
          error={error}
          onSubmit={save}
          onCancel={() => navigate('/admin/produtos')}
        />
      </Paper>
    </>
  );
}

export function ProdutoDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessao } = useAuth();
  const podeEditar =
    sessao?.usuario.perfis.some((role) => {
      const r = role.toLowerCase();
      return r === 'admin' || r === 'manager';
    }) ?? false;

  const carregar = useCallback(() => fase4Service.obterProduto(Number(id)), [id]);
  const { data: produto, loading, error, reload } = useAsyncData(carregar);

  const { data: precificacao, loading: pricingLoading, error: pricingError } =
    usePrecificacao(Number(id));

  if (loading) return <LoadingState label="Carregando produto e composição..." />;
  if (error || !produto) {
    return (
      <Alert severity="error" action={<Button color="inherit" onClick={reload}>Tentar novamente</Button>}>
        {error ?? 'Produto não encontrado.'}
      </Alert>
    );
  }

  const tipoLabel = TIPOS_PRODUTO.find((t) => t.value === produto.tipoProduto)?.label;
  const origemLabel = produto.receitaCompletaId
    ? `Receita — ${produto.receitaCompletaNome || 'Receita'}`
    : 'Personalizado';

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={produto.nomePublico}
        description={produto.descricaoPublica || 'Descrição pública não informada.'}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate('/admin/produtos')}
            >
              Voltar
            </Button>
            {podeEditar && (
              <>
                <Button component={Link} to={`/admin/produtos/${produto.id}/editar`} variant="outlined">
                  Editar produto
                </Button>
                <Button component={Link} to={`/admin/produtos/${produto.id}/precificacao`} variant="contained">
                  Precificação
                </Button>
              </>
            )}
          </Stack>
        }
      />

      {precificacao && <AlertaVariacao precificacao={precificacao} />}
      {pricingError && <Alert severity="warning">Não foi possível carregar o alerta de variação: {pricingError}</Alert>}
      {pricingLoading && <LoadingState label="Consultando alertas de custo..." />}

      {/* Características Especiais e Informações Públicas (5.4) */}
      <Paper sx={{ p: 2.5, border: '1px solid #f0e7e0', borderRadius: 3 }}>
        <Typography variant="h2" sx={{ fontSize: 18, mb: 1.5 }}>
          Informações Gerais
        </Typography>

        <Stack spacing={1.5}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Origem
            </Typography>
            <Typography fontWeight={600}>{origemLabel}</Typography>
          </Box>

          {tipoLabel && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Tipo de produto
              </Typography>
              <Typography fontWeight={600}>{tipoLabel}</Typography>
            </Box>
          )}

          {/* Características Especiais em destaque (5.4) */}
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Características especiais
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {produto.semLactose && <Chip label="Sem Lactose" color="success" size="small" variant="outlined" />}
              {produto.semGluten && <Chip label="Sem Glúten" color="success" size="small" variant="outlined" />}
              {produto.vegano && <Chip label="Vegano" color="success" size="small" variant="outlined" />}
              {!produto.semLactose && !produto.semGluten && !produto.vegano && (
                <Typography variant="body2" color="text.secondary">Nenhuma característica especial assinalada.</Typography>
              )}
            </Stack>
          </Box>

          {(produto.especificacoesAdicionais || produto.especificacaoExtra) && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Especificações adicionais
              </Typography>
              <Typography variant="body2">
                {produto.especificacoesAdicionais || produto.especificacaoExtra}
              </Typography>
            </Box>
          )}

          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Ingredientes principais
            </Typography>
            <Typography variant="body2">
              {produto.ingredientesPrincipais || 'Não informados.'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* 5.2 Composição da Receita — Sem Valores Monetários, Sem Itens Extras */}
      <ComposicaoReceita produto={produto} />
    </Stack>
  );
}
