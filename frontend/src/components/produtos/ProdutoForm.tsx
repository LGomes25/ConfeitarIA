import { Alert, Button, Checkbox, FormControlLabel, FormGroup, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import type { ProdutoFormData } from '../../types/produto.types';

export function ProdutoForm({
  initialValue,
  receitaNome,
  ingredientes,
  saving,
  error,
  onSubmit,
  onCancel,
}: {
  initialValue?: ProdutoFormData;
  receitaNome: string;
  ingredientes: Array<{ insumoId: number; nome: string }>;
  saving: boolean;
  error: string | null;
  onSubmit: (data: ProdutoFormData) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState<ProdutoFormData>(initialValue ?? {
    nomePublico: '',
    descricaoPublica: '',
    ingredientesPrincipais: '',
    semLactose: false,
    semGluten: false,
    vegano: false,
    especificacaoExtra: '',
    apresentarAoPublico: false,
    ativo: true,
  });
  const [ingredientesMarcados, setIngredientesMarcados] = useState<string[]>(() => {
    const nomes = new Set((initialValue?.ingredientesPrincipais ?? '').split(',').map((name) => name.trim().toLocaleLowerCase()).filter(Boolean));
    return ingredientes.filter((ingredient) => nomes.has(ingredient.nome.toLocaleLowerCase())).map((ingredient) => String(ingredient.insumoId));
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!data.nomePublico.trim()) return;
    const ingredientText = ingredientes
      .filter((ingredient) => ingredientesMarcados.includes(String(ingredient.insumoId)))
      .map((ingredient) => ingredient.nome)
      .join(', ');
    onSubmit({
      ...data,
      nomePublico: data.nomePublico.trim(),
      descricaoPublica: data.descricaoPublica.trim(),
      ingredientesPrincipais: ingredientText,
      especificacaoExtra: data.especificacaoExtra.trim(),
    });
  };
  const alternarIngrediente = (insumoId: number) => {
    const key = String(insumoId);
    const selected = ingredientesMarcados.includes(key)
      ? ingredientesMarcados.filter((item) => item !== key)
      : [...ingredientesMarcados, key];
    setIngredientesMarcados(selected);
    setData({
      ...data,
      ingredientesPrincipais: ingredientes
        .filter((ingredient) => selected.includes(String(ingredient.insumoId)))
        .map((ingredient) => ingredient.nome)
        .join(', '),
    });
  };
  return (
    <Stack component="form" spacing={2} onSubmit={submit}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField label="Receita vinculada" value={receitaNome} InputProps={{ readOnly: true }} />
      <TextField label="Nome público" required autoFocus inputProps={{ maxLength: 200 }} value={data.nomePublico} onChange={(event) => setData({ ...data, nomePublico: event.target.value })} />
      <TextField label="Descrição pública" multiline minRows={2} value={data.descricaoPublica} onChange={(event) => setData({ ...data, descricaoPublica: event.target.value })} />
      <Stack spacing={0.75}>
        <Typography fontWeight={700}>Ingredientes principais</Typography>
        <FormGroup>
          {ingredientes.map((ingredient) => (
            <FormControlLabel
              key={ingredient.insumoId}
              control={<Checkbox checked={ingredientesMarcados.includes(String(ingredient.insumoId))} onChange={() => alternarIngrediente(ingredient.insumoId)} />}
              label={`${ingredient.nome} — Ingrediente principal`}
            />
          ))}
        </FormGroup>
        {!ingredientes.length && <Typography color="text.secondary">A receita ainda não possui insumos.</Typography>}
      </Stack>
      <FormControlLabel control={<Checkbox checked={data.semLactose} onChange={(event) => setData({ ...data, semLactose: event.target.checked })} />} label="Sem Lactose" />
      <FormControlLabel control={<Checkbox checked={data.semGluten} onChange={(event) => setData({ ...data, semGluten: event.target.checked })} />} label="Sem Glúten" />
      <FormControlLabel control={<Checkbox checked={data.vegano} onChange={(event) => setData({ ...data, vegano: event.target.checked })} />} label="Vegano" />
      <TextField label="Especificações adicionais" inputProps={{ maxLength: 100 }} value={data.especificacaoExtra} onChange={(event) => setData({ ...data, especificacaoExtra: event.target.value })} />
      <TextField select label="Apresentar ao público" value={data.apresentarAoPublico ? 'sim' : 'nao'} onChange={(event) => setData({ ...data, apresentarAoPublico: event.target.value === 'sim' })}>
        <MenuItem value="sim">Sim</MenuItem><MenuItem value="nao">Não</MenuItem>
      </TextField>
      <TextField select label="Status" value={data.ativo ? 'ativo' : 'inativo'} onChange={(event) => setData({ ...data, ativo: event.target.value === 'ativo' })}>
        <MenuItem value="ativo">Ativo</MenuItem><MenuItem value="inativo">Inativo</MenuItem>
      </TextField>
      <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
        <Button type="button" variant="outlined" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={saving || !data.nomePublico.trim()}>{saving ? 'Salvando...' : 'Salvar dados'}</Button>
      </Stack>
    </Stack>
  );
}
