import {
  Alert,
  Box,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
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
  Typography,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useState, type FormEvent } from 'react';
import type { Produto, ProdutoFormData } from '../../types/produto.types';
import { TIPOS_PRODUTO } from '../../types/produto.types';
import type { Insumo } from '../../types/insumo';
import type { ReceitaCompleta } from '../../types/receitaCompleta.types';
import type { Componente } from '../../types/componente.types';
import { formatCurrency, formatCurrency5 } from '../../utils/format';

export interface IngredienteItem {
  id?: number;
  insumoId: number;
  nome: string;
  origem: string;
  quantidade: string;
  isPrincipal: boolean;
  blockId?: string;
  blockOrigemId?: number;
}

export interface OrigemBloco {
  id: string;
  tipo: 'receita' | 'componente';
  origemId: number;
  nome: string;
  quantidade: number;
  insumos: IngredienteItem[];
}

export interface ItemExtraLocal {
  id?: number;
  insumoId?: number;
  nomeOuDescricao: string;
  quantidade: number;
  valorUnitario: number;
  custoTotal: number;
  tipo: 'insumo' | 'livre';
  isPrincipal: boolean;
}

export function ProdutoForm({
  initialValue,
  origemNome,
  ingredientesIniciais = [],
  receitasDisponiveis = [],
  componentesDisponiveis = [],
  insumosDisponiveis = [],
  saving,
  error,
  onSubmit,
  onCancel,
}: {
  initialValue?: Produto;
  origemNome: string;
  ingredientesIniciais?: IngredienteItem[];
  receitasDisponiveis?: ReceitaCompleta[];
  componentesDisponiveis?: Componente[];
  insumosDisponiveis?: Insumo[];
  saving: boolean;
  error: string | null;
  onSubmit: (data: ProdutoFormData) => void;
  onCancel: () => void;
}) {
  // 1. Dados Gerais do Produto
  const [nomePublico, setNomePublico] = useState(initialValue?.nomePublico ?? '');
  const [descricaoPublica, setDescricaoPublica] = useState(initialValue?.descricaoPublica ?? '');
  const [tipoProduto, setTipoProduto] = useState(initialValue?.tipoProduto ?? '');
  const [especificacoesAdicionais, setEspecificacoesAdicionais] = useState(
    initialValue?.especificacoesAdicionais ?? initialValue?.especificacaoExtra ?? '',
  );
  const [apresentarAoPublico, setApresentarAoPublico] = useState(initialValue?.apresentarAoPublico ?? false);
  const [ativo, setAtivo] = useState(initialValue?.ativo ?? true);

  // Características Especiais
  const [semLactose, setSemLactose] = useState(initialValue?.semLactose ?? false);
  const [semGluten, setSemGluten] = useState(initialValue?.semGluten ?? false);
  const [vegano, setVegano] = useState(initialValue?.vegano ?? false);

  // 9. Ingredientes e Principais
  const [ingredientes, setIngredientes] = useState<IngredienteItem[]>(() => {
    if (ingredientesIniciais.length > 0) return ingredientesIniciais;
    return [];
  });
  const [blocosOrigem, setBlocosOrigem] = useState<OrigemBloco[]>(() => {
    const grouped = new Map<string, OrigemBloco>();
    for (const item of ingredientesIniciais) {
      if (!item.blockId) continue;
      const blockId = item.blockId;
      const existing = grouped.get(blockId);
      if (existing) {
        existing.insumos.push(item);
      } else {
        const tipo = item.origem.startsWith('Receita') ? 'receita' : 'componente';
        grouped.set(blockId, {
          id: blockId,
          tipo,
          origemId: item.blockOrigemId ?? 0,
          nome: item.origem.replace(/^Receita — |^Componente — /, ''),
          quantidade: 1,
          insumos: [item],
        });
      }
    }
    return [...grouped.values()];
  });

  // 10. Itens Extras
  const [itensExtras, setItensExtras] = useState<ItemExtraLocal[]>(() => {
    const principaisSet = new Set(
      (initialValue?.ingredientesPrincipais ?? '')
        .split(',')
        .map((name) => name.trim().toLowerCase())
        .filter(Boolean),
    );
    return (initialValue?.itensExtras ?? []).map((extra) => ({
      id: extra.id,
      insumoId: extra.insumoId ?? undefined,
      nomeOuDescricao: extra.insumoNome ?? extra.descricaoItem ?? '',
      quantidade: extra.quantidade ?? 1,
      valorUnitario: extra.valorUnitario,
      custoTotal: extra.custoItem,
      tipo: extra.insumoId ? 'insumo' : 'livre',
      isPrincipal: principaisSet.has((extra.insumoNome ?? extra.descricaoItem ?? '').trim().toLowerCase()),
    }));
  });

  // Controles de diálogo de adição para produtos personalizados
  const [dialogReceitaOpen, setDialogReceitaOpen] = useState(false);
  const [dialogComponenteOpen, setDialogComponenteOpen] = useState(false);
  const [receitaSelecionadaId, setReceitaSelecionadaId] = useState('');
  const [componenteSelecionadoId, setComponenteSelecionadoId] = useState('');
  const [blocosExpandidos, setBlocosExpandidos] = useState<Record<string, boolean>>({});

  // Formulário para novo Item Extra
  const [tipoExtra, setTipoExtra] = useState<'insumo' | 'livre'>('insumo');
  const [extraInsumoId, setExtraInsumoId] = useState('');
  const [extraDescricao, setExtraDescricao] = useState('');
  const [extraQuantidade, setExtraQuantidade] = useState('1');
  const [extraValorUnitario, setExtraValorUnitario] = useState('');
  const [extraErro, setExtraErro] = useState<string | null>(null);

  const isPersonalizado = !initialValue?.receitaCompletaId;

  // Alterna o checkbox Principal de um ingrediente
  const togglePrincipal = (index: number) => {
    setIngredientes((current) =>
      current.map((item, i) => (i === index ? { ...item, isPrincipal: !item.isPrincipal } : item)),
    );
  };

  const togglePrincipalDoBloco = (blockId: string, insumoId: number) => {
    setIngredientes((current) =>
      current.map((item) =>
        item.blockId === blockId && item.insumoId === insumoId
          ? { ...item, isPrincipal: !item.isPrincipal }
          : item,
      ),
    );
  };

  const removerBloco = (blockId: string) => {
    setBlocosOrigem((current) => current.filter((block) => block.id !== blockId));
    setIngredientes((current) => current.filter((item) => item.blockId !== blockId));
  };

  const calcularSubtotalBloco = (block: OrigemBloco) => {
    if (block.tipo === 'componente') {
      const componente = componentesDisponiveis.find((item) => item.id === block.origemId);
      const unitCost = componente
        ? componente.custoTotal ?? (componente.itens ?? []).reduce((sum, item) => sum + (item.custoItem ?? 0), 0)
        : 0;
      return unitCost * block.quantidade;
    }
    const receita = receitasDisponiveis.find((item) => item.id === block.origemId);
    return (receita?.custoTotal ?? 0) * block.quantidade;
  };

  // Adiciona os insumos de uma Receita Completa (para produto personalizado)
  const confirmarAdicionarReceita = () => {
    const receita = receitasDisponiveis.find((r) => r.id === Number(receitaSelecionadaId));
    if (!receita) return;

    const blockId = `receita-${receita.id}-${Date.now()}`;
    const novosIngredientes: IngredienteItem[] = [];
    for (const item of receita.itens ?? []) {
      if (item.insumoId && item.insumoNome) {
        novosIngredientes.push({
          insumoId: item.insumoId,
          nome: item.insumoNome,
          origem: `Receita — ${receita.nome}`,
          quantidade: `${item.quantidade} ${item.unidadeMedida ?? ''}`.trim(),
          isPrincipal: false,
          blockId,
          blockOrigemId: receita.id,
        });
      }
      for (const sub of item.itensComponente ?? []) {
        if (sub.insumoId && sub.insumoNome) {
          novosIngredientes.push({
            insumoId: sub.insumoId,
            nome: sub.insumoNome,
            origem: `Componente — ${item.componenteNome ?? receita.nome}`,
            quantidade: `${sub.quantidade} ${sub.unidadeMedida ?? ''}`.trim(),
            isPrincipal: false,
            blockId,
            blockOrigemId: receita.id,
          });
        }
      }
    }

    setIngredientes((current) => [...current, ...novosIngredientes]);
    setBlocosOrigem((current) => [...current, {
      id: blockId,
      tipo: 'receita',
      origemId: receita.id,
      nome: receita.nome,
      quantidade: 1,
      insumos: novosIngredientes,
    }]);
    setReceitaSelecionadaId('');
    setDialogReceitaOpen(false);
  };

  // Adiciona os insumos de um Componente (para produto personalizado)
  const confirmarAdicionarComponente = () => {
    const comp = componentesDisponiveis.find((c) => c.id === Number(componenteSelecionadoId));
    if (!comp) return;

    const blockId = `componente-${comp.id}-${Date.now()}`;
    const novosIngredientes: IngredienteItem[] = [];
    for (const item of comp.itens ?? []) {
      if (item.insumoId && item.insumoNome) {
        novosIngredientes.push({
          insumoId: item.insumoId,
          nome: item.insumoNome,
          origem: `Componente — ${comp.nome}`,
          quantidade: `${item.quantidade} ${item.unidadeMedida ?? ''}`.trim(),
          isPrincipal: false,
          blockId,
          blockOrigemId: comp.id,
        });
      }
    }

    setIngredientes((current) => [...current, ...novosIngredientes]);
    setBlocosOrigem((current) => [...current, {
      id: blockId,
      tipo: 'componente',
      origemId: comp.id,
      nome: comp.nome,
      quantidade: 1,
      insumos: novosIngredientes,
    }]);
    setComponenteSelecionadoId('');
    setDialogComponenteOpen(false);
  };

  // Adiciona Item Extra
  const adicionarItemExtra = () => {
    setExtraErro(null);
    const qtd = Number(extraQuantidade);
    if (!Number.isFinite(qtd) || qtd <= 0) {
      setExtraErro('A quantidade deve ser maior que zero.');
      return;
    }

    if (tipoExtra === 'insumo') {
      const insumo = insumosDisponiveis.find((i) => i.id === Number(extraInsumoId));
      if (!insumo) {
        setExtraErro('Selecione um insumo cadastrado.');
        return;
      }
      const unitCost = Number(insumo.custoUnitario ?? insumo.valorUnitarioAtual ?? 0);
      const novo: ItemExtraLocal = {
        insumoId: insumo.id,
        nomeOuDescricao: `${insumo.nome} (${insumo.unidadeMedida})`,
        quantidade: qtd,
        valorUnitario: unitCost,
        custoTotal: qtd * unitCost,
        tipo: 'insumo',
        isPrincipal: false,
      };
      setItensExtras((current) => [...current, novo]);
      setExtraInsumoId('');
      setExtraQuantidade('1');
    } else {
      if (!extraDescricao.trim()) {
        setExtraErro('Informe a descrição do item.');
        return;
      }
      const unitCost = Number(extraValorUnitario);
      if (!Number.isFinite(unitCost) || unitCost < 0) {
        setExtraErro('Informe um valor unitário válido.');
        return;
      }
      const novo: ItemExtraLocal = {
        nomeOuDescricao: extraDescricao.trim(),
        quantidade: qtd,
        valorUnitario: unitCost,
        custoTotal: qtd * unitCost,
        tipo: 'livre',
        isPrincipal: false,
      };
      setItensExtras((current) => [...current, novo]);
      setExtraDescricao('');
      setExtraQuantidade('1');
      setExtraValorUnitario('');
    }
  };

  const removerItemExtra = (index: number) => {
    setItensExtras((current) => current.filter((_, i) => i !== index));
  };

  const togglePrincipalExtra = (index: number) => {
    setItensExtras((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, isPrincipal: !item.isPrincipal } : item,
      ),
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!nomePublico.trim()) return;

    // Concatena apenas os ingredientes marcados como Principais
    const principaisText = [
      ...ingredientes.filter((i) => i.isPrincipal).map((i) => i.nome),
      ...itensExtras.filter((item) => item.isPrincipal).map((item) =>
        item.tipo === 'insumo'
          ? item.nomeOuDescricao.replace(/ \([^)]*\)$/, '')
          : item.nomeOuDescricao,
      ),
    ].filter((name, index, names) => names.indexOf(name) === index).join(', ');

    // Formata itens extras para o payload da API
    const itensExtrasPayload = itensExtras.map((item) => {
      if (item.insumoId) {
        return {
          insumoId: item.insumoId,
          quantidade: item.quantidade,
        };
      }
      return {
        descricaoItem: item.quantidade > 1 ? `${item.nomeOuDescricao} (${item.quantidade}x)` : item.nomeOuDescricao,
        valorUnitario: item.quantidade * item.valorUnitario,
      };
    });

    const formData: ProdutoFormData = {
      nomePublico: nomePublico.trim(),
      descricaoPublica: descricaoPublica.trim(),
      tipoProduto: tipoProduto.trim(),
      especificacoesAdicionais: especificacoesAdicionais.trim(),
      especificacaoExtra: especificacoesAdicionais.trim(),
      apresentarAoPublico,
      ativo,
      semLactose,
      semGluten,
      vegano,
      ingredientesPrincipais: principaisText,
      receitaCompletaId: initialValue?.receitaCompletaId ?? null,
      componentes: blocosOrigem
        .filter((block) => block.tipo === 'receita'
          ? !(initialValue?.receitaCompletaId && block.origemId === initialValue.receitaCompletaId)
          : true)
        .map((block, index) => block.tipo === 'receita'
          ? { receitaCompletaId: block.origemId, ordem: index }
          : { componenteId: block.origemId, ordem: index }),
      itensExtras: itensExtrasPayload,
    };

    onSubmit(formData);
  };

  return (
    <Stack component="form" spacing={2.5} onSubmit={submit}>
      {error && <Alert severity="error">{error}</Alert>}

      {/* 1. Origem — Somente Leitura */}
      <TextField
        label="Origem"
        value={origemNome}
        InputProps={{ readOnly: true }}
        helperText="Origem do produto definida pelo sistema."
        sx={{ bgcolor: 'action.hover' }}
      />

      {/* 2. Nome Público */}
      <TextField
        label="Nome público"
        required
        autoFocus
        inputProps={{ maxLength: 200 }}
        value={nomePublico}
        onChange={(event) => setNomePublico(event.target.value)}
        helperText="Nome apresentado na vitrine e nos relatórios."
      />

      {/* 3. Descrição Pública */}
      <TextField
        label="Descrição pública"
        multiline
        minRows={3}
        value={descricaoPublica}
        onChange={(event) => setDescricaoPublica(event.target.value)}
        helperText="Apresentação do produto aos clientes."
      />

      {/* 4. Tipo de Produto */}
      <TextField
        select
        label="Tipo de produto"
        value={tipoProduto}
        onChange={(event) => setTipoProduto(event.target.value)}
      >
        <MenuItem value="">— (não definido)</MenuItem>
        {TIPOS_PRODUTO.map((t) => (
          <MenuItem key={t.value} value={t.value}>
            {t.label}
          </MenuItem>
        ))}
      </TextField>

      {/* 5. Especificações Adicionais */}
      <TextField
        label="Especificações adicionais"
        inputProps={{ maxLength: 150 }}
        value={especificacoesAdicionais}
        onChange={(event) => setEspecificacoesAdicionais(event.target.value)}
        helperText="Informações complementares (ex: 'Sem açúcar', 'Serve 12 fatias'). Até 150 caracteres."
      />

      {/* 6. Apresentar ao Público & 7. Status */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          fullWidth
          label="Apresentar ao público"
          value={apresentarAoPublico ? 'sim' : 'nao'}
          onChange={(event) => setApresentarAoPublico(event.target.value === 'sim')}
          helperText="Se 'Sim', será exibido na vitrine pública do site."
        >
          <MenuItem value="nao">Não</MenuItem>
          <MenuItem value="sim">Sim</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          label="Status"
          value={ativo ? 'ativo' : 'inativo'}
          onChange={(event) => setAtivo(event.target.value === 'ativo')}
        >
          <MenuItem value="ativo">Ativo</MenuItem>
          <MenuItem value="inativo">Inativo</MenuItem>
        </TextField>
      </Stack>

      {/* 8. Características Especiais */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Características Especiais
        </Typography>
        <FormGroup row sx={{ gap: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={semLactose} onChange={(e) => setSemLactose(e.target.checked)} />}
            label="Sem Lactose"
          />
          <FormControlLabel
            control={<Checkbox checked={semGluten} onChange={(e) => setSemGluten(e.target.checked)} />}
            label="Sem Glúten"
          />
          <FormControlLabel
            control={<Checkbox checked={vegano} onChange={(e) => setVegano(e.target.checked)} />}
            label="Vegano"
          />
        </FormGroup>
      </Paper>

      {/* 9. Ingredientes e Principais */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <div>
            <Typography variant="subtitle2" fontWeight={700}>
              Ingredientes e Principais
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Marque os itens que devem ser destacados como "Ingredientes principais" na vitrine.
            </Typography>
          </div>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Stack direction="row" spacing={1}>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => setDialogReceitaOpen(true)}
              >
                + Adicionar Receita Completa
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => setDialogComponenteOpen(true)}
              >
                + Adicionar Componente
              </Button>
            </Stack>
          </Stack>
        </Box>

        {ingredientes.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {isPersonalizado
              ? 'Nenhum ingrediente adicionado. Use os botões acima para incluir receitas ou componentes.'
              : 'A receita de origem ainda não possui insumos.'}
          </Typography>
        ) : (
          <Stack spacing={1}>
            {blocosOrigem.length > 0 ? blocosOrigem.map((block) => {
              const expanded = Boolean(blocosExpandidos[block.id]);
              const subtotal = calcularSubtotalBloco(block);
              const liveInsumos = ingredientes.filter((item) => item.blockId === block.id);
              const itemNames = liveInsumos.map((item) => item.nome).join(', ');
              return (
                <Box
                  key={block.id}
                  sx={{
                    border: '1px solid',
                    borderColor: block.tipo === 'componente' ? 'rgba(184,115,51,0.45)' : 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: block.tipo === 'componente' ? 'rgba(184,115,51,0.04)' : 'background.paper',
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr auto', sm: '1fr 110px 140px auto' },
                      alignItems: 'center',
                      gap: 1,
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <Box
                      onClick={() => setBlocosExpandidos((current) => ({ ...current, [block.id]: !expanded }))}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', minWidth: 0 }}
                    >
                      {expanded
                        ? <ExpandLessRoundedIcon fontSize="small" />
                        : <ExpandMoreRoundedIcon fontSize="small" />}
                      <Typography fontWeight={700} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {block.tipo === 'componente' ? '🧩' : '📖'} {block.nome}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'right', sm: 'left' } }}>
                      Quantidade: {block.quantidade}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.main', textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                      {formatCurrency(subtotal)}
                    </Typography>
                    <IconButton
                      aria-label={`Remover bloco ${block.nome}`}
                      color="error"
                      onClick={() => removerBloco(block.id)}
                    >
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </Box>
                  <Collapse in={expanded}>
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: 1.5, py: 1, bgcolor: 'action.hover' }}>
                      {liveInsumos.length > 0 ? (
                        <Table size="small" aria-label={`Insumos de ${block.nome}`}>
                          <TableHead>
                            <TableRow>
                              <TableCell>Insumo</TableCell>
                              <TableCell align="right">Quantidade</TableCell>
                              <TableCell align="center">Principal</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {liveInsumos.map((item) => (
                              <TableRow key={`${block.id}-${item.insumoId}`}>
                                <TableCell>{item.nome}</TableCell>
                                <TableCell align="right">{item.quantidade}</TableCell>
                                <TableCell align="center">
                                  <Checkbox
                                    checked={item.isPrincipal}
                                    onChange={() => togglePrincipalDoBloco(block.id, item.insumoId)}
                                    aria-label={`Marcar ${item.nome} como principal`}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Nenhum insumo disponível neste bloco.
                        </Typography>
                      )}
                      {itemNames && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {itemNames}
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              );
            }) : (
              <Table size="small" aria-label="Ingredientes e principais">
                <TableHead>
                  <TableRow>
                    <TableCell>Insumo</TableCell>
                    <TableCell>Origem</TableCell>
                    <TableCell>Quantidade</TableCell>
                    <TableCell align="center">Principal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ingredientes.map((item, index) => (
                    <TableRow key={`${item.insumoId}-${item.origem}-${index}`} hover>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell>{item.origem}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={item.isPrincipal}
                          onChange={() => togglePrincipal(index)}
                          aria-label={`Marcar ${item.nome} como principal`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Stack>
        )}
      </Paper>

      {/* 10. Itens Extras */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Itens Extras
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Adicione itens complementares (como embalagens, laços ou insumos avulsos) à composição do produto.
        </Typography>

        {extraErro && <Alert severity="error" sx={{ mb: 2 }}>{extraErro}</Alert>}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
          <TextField
            select
            size="small"
            label="Tipo de item"
            value={tipoExtra}
            onChange={(e) => setTipoExtra(e.target.value as 'insumo' | 'livre')}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="insumo">Insumo cadastrado</MenuItem>
            <MenuItem value="livre">Texto livre</MenuItem>
          </TextField>

          {tipoExtra === 'insumo' ? (
            <TextField
              select
              size="small"
              label="Insumo"
              value={extraInsumoId}
              onChange={(e) => setExtraInsumoId(e.target.value)}
              sx={{ minWidth: 220, flex: 1 }}
            >
              {insumosDisponiveis.map((ins) => (
                <MenuItem key={ins.id} value={ins.id}>
                  {ins.nome} ({ins.unidadeMedida}) — {formatCurrency(ins.custoUnitario ?? ins.valorUnitarioAtual ?? 0)}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              size="small"
              label="Descrição do item"
              value={extraDescricao}
              onChange={(e) => setExtraDescricao(e.target.value)}
              sx={{ flex: 1 }}
            />
          )}

          <TextField
            size="small"
            type="number"
            label="Quantidade"
            value={extraQuantidade}
            inputProps={{ min: 0.0001, step: 0.0001 }}
            onChange={(e) => setExtraQuantidade(e.target.value)}
            sx={{ width: { xs: '100%', md: 120 } }}
          />

          {tipoExtra === 'livre' && (
            <TextField
              size="small"
              type="number"
              label="Valor unitário"
              value={extraValorUnitario}
              inputProps={{ min: 0, step: 0.01 }}
              onChange={(e) => setExtraValorUnitario(e.target.value)}
              sx={{ width: { xs: '100%', md: 140 } }}
            />
          )}

          <Button
            type="button"
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={adicionarItemExtra}
            sx={{ height: 40 }}
          >
            Adicionar
          </Button>
        </Stack>

        {itensExtras.length > 0 && (
          <Table size="small" aria-label="Tabela de itens extras">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Quantidade</TableCell>
                <TableCell>Valor Unitário</TableCell>
                <TableCell>Custo Total</TableCell>
                <TableCell align="center">Principal</TableCell>
                <TableCell align="right">Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itensExtras.map((extra, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{extra.nomeOuDescricao}</TableCell>
                  <TableCell>{extra.quantidade}</TableCell>
                  <TableCell>{formatCurrency5(extra.valorUnitario)}</TableCell>
                  <TableCell>{formatCurrency(extra.custoTotal)}</TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={extra.isPrincipal}
                      onChange={() => togglePrincipalExtra(idx)}
                      aria-label={`Marcar ${extra.nomeOuDescricao} como principal`}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Remover item extra ${extra.nomeOuDescricao}`}
                      onClick={() => removerItemExtra(idx)}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* 11. Botões de Ação */}
      <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
        <Button type="button" variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={saving || !nomePublico.trim()}>
          {saving ? 'Salvando...' : 'Salvar produto'}
        </Button>
      </Stack>

      {/* Diálogo seletor de Receita Completa */}
      <Dialog open={dialogReceitaOpen} onClose={() => setDialogReceitaOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Adicionar Receita Completa</DialogTitle>
        <DialogContent>
          <TextField
            select
            autoFocus
            fullWidth
            label="Receita Completa"
            value={receitaSelecionadaId}
            onChange={(e) => setReceitaSelecionadaId(e.target.value)}
            sx={{ mt: 1 }}
          >
            {receitasDisponiveis.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.nome}
              </MenuItem>
            ))}
          </TextField>
          {!receitasDisponiveis.length && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Nenhuma receita completa ativa encontrada.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogReceitaOpen(false)}>Cancelar</Button>
          <Button onClick={confirmarAdicionarReceita} variant="contained" disabled={!receitaSelecionadaId}>
            Adicionar Receita
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo seletor de Componente */}
      <Dialog open={dialogComponenteOpen} onClose={() => setDialogComponenteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Adicionar Componente</DialogTitle>
        <DialogContent>
          <TextField
            select
            autoFocus
            fullWidth
            label="Componente"
            value={componenteSelecionadoId}
            onChange={(e) => setComponenteSelecionadoId(e.target.value)}
            sx={{ mt: 1 }}
          >
            {componentesDisponiveis.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.nome}
              </MenuItem>
            ))}
          </TextField>
          {!componentesDisponiveis.length && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Nenhum componente ativo encontrado.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogComponenteOpen(false)}>Cancelar</Button>
          <Button onClick={confirmarAdicionarComponente} variant="contained" disabled={!componenteSelecionadoId}>
            Adicionar Componente
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
