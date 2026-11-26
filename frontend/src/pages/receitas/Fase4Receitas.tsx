import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ItemReceitaEditor, type ItemReceitaDraft } from '../../components/receitas/ItemReceitaEditor';
import { EmptyState, LoadingState } from '../../components/feedback/AsyncStates';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fase4Service, type ReceitaTipo } from '../../services/fase4Service';
import { insumosService } from '../../services/insumosService';
import { getApiErrorMessage } from '../../services/api';
import type { Componente, ComponenteFormData } from '../../types/componente.types';
import type { ReceitaCompleta, ReceitaCompletaFormData } from '../../types/receitaCompleta.types';
import type { Insumo } from '../../types/insumo';
import { formatCurrency } from '../../utils/format';

const config = {
  componente: {
    singular: 'componente',
    plural: 'Componentes',
    route: '/receitas/componentes',
    title: 'Componentes',
    description: 'Cadastre módulos reutilizáveis e seus insumos para montagem de produtos.',
  },
  receita: {
    singular: 'receita',
    plural: 'Receitas completas',
    route: '/receitas/completas',
    title: 'Receitas completas',
    description: 'Gerencie receitas fechadas com rendimento, tempo e composição de insumos.',
  },
};

function getItens(value: Componente | ReceitaCompleta): Array<ItemReceitaDraft & { id: number }> {
  return (value.itens ?? []).map((item) => ({
    id: item.id,
    insumoId: item.insumoId ?? undefined,
    componenteId: item.componenteId ?? undefined,
    componenteNome: item.componenteNome ?? undefined,
    itensComponente: item.itensComponente,
    quantidade: item.quantidade,
  }));
}

export function ListaReceitasPage({ tipo }: { tipo: ReceitaTipo }) {
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [alvo, setAlvo] = useState<Componente | ReceitaCompleta | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [atualizacao, setAtualizacao] = useState(0);
  const carregar = useCallback(
    () => fase4Service.listarReceitas(tipo, mostrarInativos),
    [tipo, mostrarInativos, atualizacao],
  );
  const { data, loading, error, reload } = useAsyncData(carregar);
  const itens = (data ?? []) as Array<Componente | ReceitaCompleta>;
  const labels = config[tipo];

  const inativar = async () => {
    if (!alvo) return;
    setSalvando(true);
    setErroAcao(null);
    try {
      await fase4Service.inativarReceita(tipo, alvo.id);
      setAlvo(null);
      setAtualizacao((count) => count + 1);
    } catch (cause) {
      setErroAcao(getApiErrorMessage(cause));
    } finally {
      setSalvando(false);
    }
  };

  const ativar = async (item: Componente | ReceitaCompleta) => {
    setSalvando(true);
    setErroAcao(null);
    try {
      const payload = tipo === 'componente'
        ? {
            nome: item.nome,
            descricao: item.descricao ?? '',
            tempoPreparoMinutos: item.tempoPreparoMinutos,
            ativo: true,
          }
        : {
            nome: item.nome,
            descricao: item.descricao ?? '',
            tempoPreparoMinutos: item.tempoPreparoMinutos,
            rendimento: (item as ReceitaCompleta).rendimento ?? '',
            ativo: true,
          };
      await fase4Service.salvarReceita(tipo, payload, item.id);
      setAtualizacao((count) => count + 1);
    } catch (cause) {
      setErroAcao(getApiErrorMessage(cause));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <PageHeader
        title={labels.title}
        description={labels.description}
        action={<Button component={Link} to={`${labels.route}/novo`} variant="contained" startIcon={<AddRoundedIcon />}>Novo cadastro</Button>}
      />
      {erroAcao && <Alert severity="error" sx={{ mb: 2 }}>{erroAcao}</Alert>}
      <Stack spacing={2}>
        <TextField
          select
          size="small"
          label="Exibir"
          value={mostrarInativos ? 'inativos' : 'ativos'}
          onChange={(event) => setMostrarInativos(event.target.value === 'inativos')}
          sx={{ width: { xs: '100%', sm: 220 } }}
        >
          <MenuItem value="ativos">Ativos</MenuItem>
          <MenuItem value="inativos">Inativos</MenuItem>
        </TextField>
        {loading && <LoadingState label={`Carregando ${labels.plural.toLowerCase()}...`} />}
        {!loading && error && <Alert severity="error" action={<Button color="inherit" onClick={reload}>Tentar novamente</Button>}>{error}</Alert>}
        {!loading && !error && !itens.length && <Paper><EmptyState>Nenhum cadastro encontrado.</EmptyState></Paper>}
        {!loading && !error && Boolean(itens.length) && (
          <Paper sx={{ overflowX: 'auto', border: '1px solid #f0e7e0', borderRadius: 3 }}>
            <Table aria-label={`Lista de ${labels.plural.toLowerCase()}`}>
              <TableHead><TableRow><TableCell>Nome</TableCell><TableCell>Tempo</TableCell><TableCell>Insumos</TableCell><TableCell>Custo</TableCell><TableCell>Status</TableCell><TableCell align="center">Ações</TableCell></TableRow></TableHead>
              <TableBody>
                {itens.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography
                        component={Link}
                        to={`${labels.route}/${item.id}`}
                        fontWeight={700}
                        color="primary"
                        sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {item.nome}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.tempoPreparoMinutos ? `${item.tempoPreparoMinutos} min` : '—'}</TableCell>
                    <TableCell>{item.itens?.length ?? 0}</TableCell>
                    <TableCell>{formatCurrency(item.custoTotal ?? item.itens?.reduce((sum, ingrediente) => sum + ingrediente.custoItem, 0) ?? 0)}</TableCell>
                    <TableCell><Chip size="small" label={item.ativo ? 'Ativo' : 'Inativo'} color={item.ativo ? 'success' : 'default'} /></TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <Tooltip title="Detalhes">
                          <IconButton
                            aria-label={`Ver detalhes de ${item.nome}`}
                            component={Link}
                            to={`${labels.route}/${item.id}`}
                            size="medium"
                            sx={{ color: '#2179fd' }}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            aria-label={`Editar ${item.nome}`}
                            component={Link}
                            to={`${labels.route}/${item.id}/editar`}
                            size="medium"
                            color="warning"
                            sx={{ color: '#e69500' }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {item.ativo ? (
                          <Tooltip title="Inativar">
                            <IconButton
                              aria-label={`Inativar ${item.nome}`}
                              color="error"
                              size="medium"
                              onClick={() => setAlvo(item)}
                              sx={{ color: '#d32f2f' }}
                            >
                              <PauseCircleOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Ativar">
                            <IconButton
                              aria-label={`Ativar ${item.nome}`}
                              color="success"
                              size="medium"
                              onClick={() => void ativar(item)}
                              sx={{ color: '#2e7d32' }}
                            >
                              <PlayCircleOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Stack>
      <ConfirmDialog
        open={Boolean(alvo)}
        title={`Inativar ${labels.singular}?`}
        message={`"${alvo?.nome ?? ''}" deixará de aparecer nas opções de novos cadastros. O histórico será mantido.`}
        confirmLabel="Inativar"
        busy={salvando}
        onCancel={() => setAlvo(null)}
        onConfirm={inativar}
      />
    </>
  );
}

export function FormReceitaPage({ tipo }: { tipo: ReceitaTipo }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = Boolean(id);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [loadingInsumos, setLoadingInsumos] = useState(true);
  const [loadingComponentes, setLoadingComponentes] = useState(tipo === 'receita');
  const [loadingEntity, setLoadingEntity] = useState(editando);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [itens, setItens] = useState<ItemReceitaDraft[]>([]);
  const [dados, setDados] = useState({
    nome: '',
    descricao: '',
    tempoPreparoMinutos: '',
    rendimento: '',
    ativo: true,
  });
  const labels = config[tipo];

  useEffect(() => {
    let active = true;
    void insumosService.listar('ativos')
      .then((result) => { if (active) setInsumos(result); })
      .catch((cause: unknown) => { if (active) setError(getApiErrorMessage(cause)); })
      .finally(() => { if (active) setLoadingInsumos(false); });
    if (tipo === 'receita') {
      void fase4Service.listarReceitas('componente')
        .then((result) => { if (active) setComponentes(result as Componente[]); })
        .catch((cause: unknown) => { if (active) setError(getApiErrorMessage(cause)); })
        .finally(() => { if (active) setLoadingComponentes(false); });
    }
    if (editando) {
      void fase4Service.obterReceita(tipo, Number(id))
        .then((result) => {
          if (!active) return;
          setDados({
            nome: result.nome,
            descricao: result.descricao ?? '',
            tempoPreparoMinutos: result.tempoPreparoMinutos?.toString() ?? '',
            rendimento: tipo === 'receita' ? (result as ReceitaCompleta).rendimento ?? '' : '',
            ativo: result.ativo,
          });
          setItens(getItens(result));
        })
        .catch((cause: unknown) => { if (active) setError(getApiErrorMessage(cause)); })
        .finally(() => { if (active) setLoadingEntity(false); });
    }
    return () => { active = false; };
  }, [editando, id, tipo]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    if (!dados.nome.trim()) { setError('Informe o nome.'); return; }
    if (dados.tempoPreparoMinutos && Number(dados.tempoPreparoMinutos) < 1) { setError('O tempo deve ser maior que zero.'); return; }
    if (itens.some((item) =>
      (!item.componenteId && (!item.insumoId || item.insumoId <= 0)) ||
      !Number.isFinite(item.quantidade) || item.quantidade <= 0)) {
      setError('Selecione um insumo e informe uma quantidade maior que zero para cada item.');
      return;
    }
    setSaving(true);
    try {
      const base = {
        nome: dados.nome.trim(),
        descricao: dados.descricao.trim(),
        tempoPreparoMinutos: dados.tempoPreparoMinutos ? Number(dados.tempoPreparoMinutos) : null,
        ativo: dados.ativo,
      };
      const payload: ComponenteFormData | ReceitaCompletaFormData = tipo === 'componente'
        ? base
        : { ...base, rendimento: dados.rendimento.trim() };
      const entity = await fase4Service.salvarReceita(tipo, payload, id ? Number(id) : undefined);
      const currentItems = editando ? getItens(await fase4Service.obterReceita(tipo, entity.id)) : [];
      const currentById = new Map(currentItems.map((item) => [item.id, item]));
      const submittedIds = new Set(itens.flatMap((item) => item.id ? [item.id] : []));
      for (const oldItem of currentItems) {
        if (!submittedIds.has(oldItem.id)) await fase4Service.removerItemReceita(tipo, oldItem.id);
      }
      for (const item of itens) {
        const itemData = item.componenteId
          ? { componenteId: item.componenteId, quantidade: item.quantidade }
          : { insumoId: item.insumoId, quantidade: item.quantidade };
        const existing = item.id ? currentById.get(item.id) : undefined;
        if (existing && existing.insumoId === item.insumoId && existing.componenteId === item.componenteId) {
          await fase4Service.atualizarItemReceita(tipo, item.id!, { quantidade: item.quantidade });
        } else {
          if (item.id && existing) await fase4Service.removerItemReceita(tipo, item.id);
          await fase4Service.adicionarItemReceita(tipo, entity.id, itemData);
        }
      }
      setSaved(true);
      window.setTimeout(() => navigate(labels.route), 650);
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  if (loadingEntity || loadingInsumos || loadingComponentes) return <LoadingState label="Carregando dados do formulário..." />;
  return (
    <>
      <PageHeader title={`${editando ? 'Editar' : 'Novo'} ${labels.singular}`} description="Informe os dados e adicione os insumos usados nesta preparação." />
      <Paper component="form" onSubmit={submit} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
        <Stack spacing={2.2}>
          {error && <Alert severity="error">{error}</Alert>}
          {saved && <Alert severity="success">Cadastro realizado com sucesso!</Alert>}
          <TextField label="Nome" required value={dados.nome} inputProps={{ maxLength: 150 }} onChange={(event) => setDados({ ...dados, nome: event.target.value })} />
          <TextField label="Descrição e modo de preparo" multiline minRows={3} value={dados.descricao} onChange={(event) => setDados({ ...dados, descricao: event.target.value })} />
          <TextField label="Tempo de preparo (minutos)" type="number" value={dados.tempoPreparoMinutos} inputProps={{ min: 1, step: 1 }} onChange={(event) => setDados({ ...dados, tempoPreparoMinutos: event.target.value })} />
          {tipo === 'receita' && <TextField label="Rendimento" value={dados.rendimento} inputProps={{ maxLength: 100 }} onChange={(event) => setDados({ ...dados, rendimento: event.target.value })} />}
          <TextField select label="Status" value={dados.ativo ? 'ativo' : 'inativo'} onChange={(event) => setDados({ ...dados, ativo: event.target.value === 'ativo' })}>
            <MenuItem value="ativo">Ativo</MenuItem><MenuItem value="inativo">Inativo</MenuItem>
          </TextField>
          <Typography variant="h2" sx={{ fontSize: 18 }}>Insumos e quantidades</Typography>
          {insumos.length === 0 && <Alert severity="info">Cadastre ao menos um insumo ativo antes de montar a composição.</Alert>}
          <ItemReceitaEditor
            itens={itens}
            insumos={insumos}
            componentes={componentes}
            permitirComponentes={tipo === 'receita'}
            onChange={setItens}
          />
          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
            <Button component={Link} to={labels.route} variant="outlined">Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving || (!insumos.length && (!componentes.length || tipo !== 'receita'))}>{saving ? 'Salvando...' : 'Salvar cadastro'}</Button>
          </Stack>
        </Stack>
      </Paper>
    </>
  );
}

export function ComponentesListaPage() { return <ListaReceitasPage tipo="componente" />; }
export function ComponentesFormPage() { return <FormReceitaPage tipo="componente" />; }
export function ReceitasCompletasListaPage() { return <ListaReceitasPage tipo="receita" />; }
export function ReceitasCompletasFormPage() { return <FormReceitaPage tipo="receita" />; }

export function ComponenteDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [componente, setComponente] = useState<Componente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void fase4Service.obterReceita('componente', Number(id))
      .then((value) => { if (active) setComponente(value as Componente); })
      .catch((cause: unknown) => { if (active) setError(getApiErrorMessage(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <LoadingState label="Carregando detalhes do componente..." />;
  if (error || !componente) {
    return <Alert severity="error">{error ?? 'Componente não encontrado.'}</Alert>;
  }

  return (
    <Stack spacing={2.2}>
      <PageHeader
        title={componente.nome}
        description="Detalhes de composição e modo de preparo do componente."
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/receitas/componentes')}>
              Voltar
            </Button>
            <Button
              component={Link}
              to={`/receitas/componentes/${componente.id}/editar`}
              variant="contained"
              startIcon={<EditOutlinedIcon />}
            >
              Editar Componente
            </Button>
          </Stack>
        }
      />

      <Paper sx={{ p: 2.5, border: '1px solid #f0e7e0', borderRadius: 3 }}>
        <Typography variant="h2" sx={{ fontSize: 18, mb: 1.5 }}>Informações Gerais</Typography>
        <Stack spacing={1.2}>
          <Box><Typography variant="caption" color="text.secondary">Nome</Typography><Typography fontWeight={700}>{componente.nome}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Tempo de preparo</Typography><Typography>{componente.tempoPreparoMinutos ? `${componente.tempoPreparoMinutos} min` : 'Não informado'}</Typography></Box>
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>Status</Typography>
            <Chip size="small" label={componente.ativo ? 'Ativo' : 'Inativo'} color={componente.ativo ? 'success' : 'default'} sx={{ ml: 0 }} />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5, border: '1px solid #f0e7e0', borderRadius: 3 }}>
        <Typography variant="h2" sx={{ fontSize: 18, mb: 1.5 }}>Insumos utilizados neste componente</Typography>
        {(componente.itens ?? []).length === 0 ? (
          <Alert severity="info">Nenhum insumo cadastrado neste componente.</Alert>
        ) : (
          <Table size="small" aria-label="Insumos do componente">
            <TableHead><TableRow><TableCell>Insumo</TableCell><TableCell align="right">Quantidade e Unidade</TableCell></TableRow></TableHead>
            <TableBody>
              {(componente.itens ?? []).filter((item) => item.insumoId).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.insumoNome}</TableCell>
                  <TableCell align="right">{item.quantidade} {item.unidadeMedida ?? ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Paper sx={{ p: 2.5, border: '1px solid #f0e7e0', borderRadius: 3 }}>
        <Typography variant="h2" sx={{ fontSize: 18, mb: 1.5 }}>Descrição e Modo de Preparo</Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{componente.descricao || 'Nenhuma descrição ou modo de preparo informado.'}</Typography>
      </Paper>
    </Stack>
  );
}

export function ReceitaCompletaDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receita, setReceita] = useState<ReceitaCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void fase4Service.obterReceita('receita', Number(id))
      .then((value) => { if (active) setReceita(value as ReceitaCompleta); })
      .catch((cause: unknown) => { if (active) setError(getApiErrorMessage(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <LoadingState label="Carregando detalhes da receita..." />;
  if (error || !receita) {
    return <Alert severity="error">{error ?? 'Receita completa não encontrada.'}</Alert>;
  }

  const componentes = (receita.itens ?? []).filter((item) => item.componenteId);
  const insumosDiretos = (receita.itens ?? []).filter((item) => item.insumoId);

  return (
    <Stack spacing={2.2}>
      <PageHeader
        title={receita.nome}
        description="Detalhes de rendimento, composição e modo de preparo da receita."
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/receitas/completas')}>
              Voltar
            </Button>
            <Button
              component={Link}
              to={`/receitas/completas/${receita.id}/editar`}
              variant="contained"
              startIcon={<EditOutlinedIcon />}
            >
              Editar Receita
            </Button>
          </Stack>
        }
      />

      <Paper sx={{ p: 2.5, border: '1px solid #f0e7e0', borderRadius: 3 }}>
        <Typography variant="h2" sx={{ fontSize: 18, mb: 1.5 }}>Informações Gerais</Typography>
        <Stack spacing={1.2}>
          <Box><Typography variant="caption" color="text.secondary">Nome</Typography><Typography fontWeight={700}>{receita.nome}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Rendimento</Typography><Typography>{receita.rendimento || 'Não informado'}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Tempo de preparo</Typography><Typography>{receita.tempoPreparoMinutos ? `${receita.tempoPreparoMinutos} min` : 'Não informado'}</Typography></Box>
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>Status</Typography>
            <Chip size="small" label={receita.ativo ? 'Ativo' : 'Inativo'} color={receita.ativo ? 'success' : 'default'} sx={{ ml: 0 }} />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5, border: '1px solid #f0e7e0', borderRadius: 3 }}>
        <Typography variant="h2" sx={{ fontSize: 18, mb: 0.5 }}>Composição da Receita</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Esta é a composição completa da receita, com todos os ingredientes e quantidades.
        </Typography>

        {componentes.length > 0 && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {componentes.map((item) => (
              <Accordion key={item.id} disableGutters variant="outlined">
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                  <Typography fontWeight={700}>🧩 {item.componenteNome ?? 'Componente'}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0 }}>
                  {(item.itensComponente ?? []).length === 0 ? (
                    <Typography px={2} py={1} color="text.secondary">Nenhum insumo informado neste componente.</Typography>
                  ) : (
                    <Table size="small" aria-label={`Insumos de ${item.componenteNome ?? 'componente'}`}>
                      <TableHead><TableRow><TableCell>Insumo</TableCell><TableCell align="right">Quantidade</TableCell></TableRow></TableHead>
                      <TableBody>
                        {(item.itensComponente ?? []).map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell>{sub.insumoNome}</TableCell>
                            <TableCell align="right">{sub.quantidade * item.quantidade} {sub.unidadeMedida ?? ''}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}

        {insumosDiretos.length === 0 ? (
          <Typography color="text.secondary">Nenhum insumo direto informado nesta receita.</Typography>
        ) : (
          <Table size="small" aria-label="Insumos diretos da receita">
            <TableHead><TableRow><TableCell>Insumo</TableCell><TableCell align="right">Quantidade</TableCell></TableRow></TableHead>
            <TableBody>
              {insumosDiretos.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.insumoNome}</TableCell>
                  <TableCell align="right">{item.quantidade} {item.unidadeMedida ?? ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Paper sx={{ p: 2.5, border: '1px solid #f0e7e0', borderRadius: 3 }}>
        <Typography variant="h2" sx={{ fontSize: 18, mb: 1.5 }}>Descrição e Modo de Preparo</Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{receita.descricao || 'Nenhuma descrição ou modo de preparo informado.'}</Typography>
      </Paper>
    </Stack>
  );
}
