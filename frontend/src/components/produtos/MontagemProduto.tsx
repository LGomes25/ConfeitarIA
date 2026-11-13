import { useEffect, useState } from 'react';
import { Alert, Box, Button, IconButton, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { fase4Service, type ReceitaTipo } from '../../services/fase4Service';
import type { ProdutoComponente } from '../../types/produto.types';
import type { Componente } from '../../types/componente.types';
import type { ReceitaCompleta } from '../../types/receitaCompleta.types';
import { getApiErrorMessage } from '../../services/api';
import { LoadingState } from '../feedback/AsyncStates';

type Option = { id: number; nome: string; tipo: ReceitaTipo };

export function MontagemProduto({ produtoId, componentes, onChanged }: {
  produtoId: number;
  componentes: ProdutoComponente[];
  onChanged: () => void;
}) {
  const [opcoes, setOpcoes] = useState<Option[]>([]);
  const [tipo, setTipo] = useState<ReceitaTipo>('componente');
  const [selecionado, setSelecionado] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [ordens, setOrdens] = useState<Record<number, string>>({});

  useEffect(() => {
    let active = true;
    Promise.all([fase4Service.listarReceitas('componente'), fase4Service.listarReceitas('receita')])
      .then(([comps, receitas]) => {
        if (!active) return;
        const options: Option[] = [
          ...(comps as Componente[]).map((item) => ({ id: item.id, nome: item.nome, tipo: 'componente' as const })),
          ...(receitas as ReceitaCompleta[]).map((item) => ({ id: item.id, nome: item.nome, tipo: 'receita' as const })),
        ];
        setOpcoes(options);
      })
      .catch((cause: unknown) => { if (active) setErro(getApiErrorMessage(cause)); })
      .finally(() => { if (active) setCarregando(false); });
    return () => { active = false; };
  }, []);

  const add = async () => {
    const option = opcoes.find((item) => `${item.tipo}-${item.id}` === selecionado);
    if (!option) { setErro('Selecione um componente ou uma receita.'); return; }
    setSalvando(true);
    setErro(null);
    try {
      await fase4Service.adicionarComponenteProduto(produtoId, {
        ...(option.tipo === 'componente' ? { componenteId: option.id } : { receitaCompletaId: option.id }),
        ordem: componentes.length + 1,
      });
      setSelecionado('');
      onChanged();
    } catch (cause) {
      setErro(getApiErrorMessage(cause));
    } finally {
      setSalvando(false);
    }
  };
  const remove = async (itemId: number) => {
    setSalvando(true);
    setErro(null);
    try { await fase4Service.removerComponenteProduto(itemId); onChanged(); }
    catch (cause) { setErro(getApiErrorMessage(cause)); }
    finally { setSalvando(false); }
  };
  const updateOrder = async (item: ProdutoComponente) => {
    const order = Number(ordens[item.id] ?? item.ordem);
    if (!Number.isInteger(order) || order < 1) { setErro('A ordem deve ser um número inteiro maior que zero.'); return; }
    setSalvando(true);
    setErro(null);
    try {
      await fase4Service.atualizarComponenteProduto(item.id, {
        ...(item.componenteId ? { componenteId: item.componenteId } : { receitaCompletaId: item.receitaCompletaId ?? undefined }),
        ordem: order,
      });
      onChanged();
    } catch (cause) { setErro(getApiErrorMessage(cause)); }
    finally { setSalvando(false); }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: '1px solid #f0e7e0', borderRadius: 3 }}>
      <Typography variant="h2" sx={{ fontSize: 18, mb: 2 }}>Composição do produto</Typography>
      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
      {carregando ? <LoadingState label="Carregando componentes e receitas..." /> : (
        <Stack spacing={1.5}>
          {componentes.length === 0 && <Typography color="text.secondary">Adicione um ou mais componentes ou uma receita completa.</Typography>}
          {componentes.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ flex: '1 1 200px' }}>{item.componenteNome ?? item.receitaCompletaNome ?? `Item ${item.id}`}</Typography>
              <TextField type="number" label="Ordem" size="small" value={ordens[item.id] ?? item.ordem} inputProps={{ min: 1, step: 1, 'aria-label': `Ordem de ${item.componenteNome ?? item.receitaCompletaNome ?? 'item'}` }} onChange={(event) => setOrdens({ ...ordens, [item.id]: event.target.value })} sx={{ width: 110 }} />
              <Button size="small" onClick={() => void updateOrder(item)} disabled={salvando}>Atualizar ordem</Button>
              <IconButton aria-label={`Remover ${item.componenteNome ?? item.receitaCompletaNome ?? 'item'}`} color="error" disabled={salvando} onClick={() => void remove(item.id)}><DeleteOutlineRoundedIcon /></IconButton>
            </Box>
          ))}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
            <TextField select label="Tipo" value={tipo} onChange={(event) => { setTipo(event.target.value as ReceitaTipo); setSelecionado(''); }} sx={{ minWidth: 170 }}>
              <MenuItem value="componente">Componente</MenuItem><MenuItem value="receita">Receita completa</MenuItem>
            </TextField>
            <TextField select label="Selecionar" value={selecionado} onChange={(event) => setSelecionado(event.target.value)} sx={{ flexGrow: 1 }}>
              {opcoes.filter((option) => option.tipo === tipo).map((option) => <MenuItem key={option.id} value={`${option.tipo}-${option.id}`}>{option.nome}</MenuItem>)}
            </TextField>
            <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => void add()} disabled={salvando || !selecionado}>Adicionar</Button>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
}
