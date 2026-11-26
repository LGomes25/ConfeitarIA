import { useEffect, useState } from 'react';
import { Alert, Button, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { fase4Service } from '../../services/fase4Service';
import { insumosService } from '../../services/insumosService';
import { getApiErrorMessage } from '../../services/api';
import type { Insumo } from '../../types/insumo';
import type { ItemExtraProduto, ItemExtraProdutoFormData } from '../../types/itemExtraProduto.types';
import { formatCurrency } from '../../utils/format';
import { LoadingState } from '../feedback/AsyncStates';

export function ItensExtrasEditor({ produtoId, itens, onChanged }: {
  produtoId: number;
  itens: ItemExtraProduto[];
  onChanged: () => void;
}) {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'insumo' | 'livre'>('insumo');
  const [insumoId, setInsumoId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [descricao, setDescricao] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [updates, setUpdates] = useState<Record<number, { quantidade: string; descricao: string; valorUnitario: string }>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    insumosService.listar('ativos')
      .then((result) => { if (active) setInsumos(result); })
      .catch((cause: unknown) => { if (active) setError(getApiErrorMessage(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const save = async () => {
    setError(null);
    const data = mode === 'insumo'
      ? { insumoId: Number(insumoId), quantidade: Number(quantidade) }
      : { descricaoItem: descricao.trim(), valorUnitario: Number(valorUnitario) };
    if (mode === 'insumo' && (!Number.isInteger(Number(insumoId)) || Number(insumoId) < 1 || !Number.isFinite(Number(quantidade)) || Number(quantidade) <= 0)) {
      setError('Selecione um insumo e informe uma quantidade maior que zero.'); return;
    }
    if (mode === 'livre' && (!descricao.trim() || !Number.isFinite(Number(valorUnitario)) || Number(valorUnitario) <= 0)) {
      setError('Informe a descrição e um valor unitário maior que zero.'); return;
    }
    setBusy(true);
    try {
      await fase4Service.adicionarExtraProduto(produtoId, data);
      setInsumoId(''); setQuantidade('1'); setDescricao(''); setValorUnitario('');
      onChanged();
    } catch (cause) { setError(getApiErrorMessage(cause)); }
    finally { setBusy(false); }
  };
  const update = async (item: ItemExtraProduto) => {
    const draft = updates[item.id] ?? { quantidade: String(item.quantidade ?? ''), descricao: item.descricaoItem ?? '', valorUnitario: String(item.valorUnitario) };
    let data: ItemExtraProdutoFormData;
    if (item.insumoId) {
      const quantity = Number(draft.quantidade);
      if (!Number.isFinite(quantity) || quantity <= 0) { setError('Informe uma quantidade maior que zero.'); return; }
      data = { insumoId: item.insumoId, quantidade: quantity };
    } else {
      const unitPrice = Number(draft.valorUnitario);
      if (!draft.descricao.trim() || !Number.isFinite(unitPrice) || unitPrice <= 0) { setError('Verifique a descrição e o valor unitário do item.'); return; }
      data = { descricaoItem: draft.descricao.trim(), valorUnitario: unitPrice };
    }
    setBusy(true); setError(null);
    try { await fase4Service.atualizarExtraProduto(item.id, data); onChanged(); }
    catch (cause) { setError(getApiErrorMessage(cause)); }
    finally { setBusy(false); }
  };
  const remove = async (id: number) => {
    setBusy(true); setError(null);
    try { await fase4Service.removerExtraProduto(id); onChanged(); }
    catch (cause) { setError(getApiErrorMessage(cause)); }
    finally { setBusy(false); }
  };

  if (loading) return <LoadingState label="Carregando insumos..." />;
  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ fontSize: 18, mb: 2 }}>Itens extras</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {itens.length > 0 && (
        <Table size="small" sx={{ mb: 2 }} aria-label="Itens extras do produto">
          <TableHead><TableRow><TableCell>Item</TableCell><TableCell>Quantidade / valor unitário</TableCell><TableCell>Custo</TableCell><TableCell align="right">Ações</TableCell></TableRow></TableHead>
          <TableBody>
            {itens.map((item) => {
              const draft = updates[item.id] ?? { quantidade: String(item.quantidade ?? ''), descricao: item.descricaoItem ?? '', valorUnitario: String(item.valorUnitario) };
              return (
                <TableRow key={item.id}>
                  <TableCell>{item.insumoNome ?? item.descricaoItem}</TableCell>
                  <TableCell>
                    {item.insumoId ? (
                      <TextField size="small" type="number" label="Quantidade" value={draft.quantidade} inputProps={{ min: 0.0001, step: 0.0001 }} onChange={(event) => setUpdates({ ...updates, [item.id]: { ...draft, quantidade: event.target.value } })} sx={{ width: 145 }} />
                    ) : (
                      <Stack spacing={1}>
                        <TextField size="small" label="Descrição" value={draft.descricao} onChange={(event) => setUpdates({ ...updates, [item.id]: { ...draft, descricao: event.target.value } })} />
                        <TextField size="small" type="number" label="Valor unitário" value={draft.valorUnitario} inputProps={{ min: 0.01, step: 0.01 }} onChange={(event) => setUpdates({ ...updates, [item.id]: { ...draft, valorUnitario: event.target.value } })} />
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(item.custoItem)}</TableCell>
                  <TableCell align="right">
                    <Button aria-label={`Salvar ${item.insumoNome ?? item.descricaoItem}`} size="small" startIcon={<SaveOutlinedIcon />} onClick={() => void update(item)} disabled={busy}>Salvar</Button>
                    <Button aria-label={`Remover ${item.insumoNome ?? item.descricaoItem}`} size="small" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => void remove(item.id)} disabled={busy}>Remover</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.3} alignItems={{ sm: 'flex-start' }}>
        <TextField select label="Tipo de item" value={mode} onChange={(event) => setMode(event.target.value as 'insumo' | 'livre')} sx={{ minWidth: 180 }}>
          <MenuItem value="insumo">Insumo cadastrado</MenuItem><MenuItem value="livre">Texto livre</MenuItem>
        </TextField>
        {mode === 'insumo' ? (
          <>
            <TextField select label="Insumo" value={insumoId} onChange={(event) => setInsumoId(event.target.value)} sx={{ flex: 1, minWidth: 180 }}>
              {insumos.map((item) => <MenuItem key={item.id} value={item.id}>{item.nome} ({item.unidadeMedida})</MenuItem>)}
            </TextField>
            <TextField type="number" label="Quantidade" value={quantidade} inputProps={{ min: 0.0001, step: 0.0001 }} onChange={(event) => setQuantidade(event.target.value)} sx={{ width: { xs: '100%', sm: 140 } }} />
          </>
        ) : (
          <>
            <TextField label="Descrição" value={descricao} onChange={(event) => setDescricao(event.target.value)} sx={{ flex: 1, minWidth: 170 }} />
            <TextField type="number" label="Valor unitário" value={valorUnitario} inputProps={{ min: 0.01, step: 0.01 }} onChange={(event) => setValorUnitario(event.target.value)} sx={{ width: { xs: '100%', sm: 160 } }} />
          </>
        )}
        <Button variant="outlined" onClick={() => void save()} disabled={busy} sx={{ minHeight: 56 }}>Adicionar</Button>
      </Stack>
    </Paper>
  );
}
