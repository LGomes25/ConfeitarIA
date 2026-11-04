import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import type { PerfilAcesso, UsuarioResumo } from '../../types/usuario';
import { getApiErrorMessage } from '../../services/api';

const perfisDisponiveis: PerfilAcesso[] = ['Admin', 'Manager', 'Team', 'Customer'];

export function UsuarioCard({
  usuario,
  onSaveRoles,
  onBlock,
  onTemporaryPassword,
}: {
  usuario: UsuarioResumo;
  onSaveRoles: (roles: PerfilAcesso[]) => Promise<void>;
  onBlock: () => Promise<void>;
  onTemporaryPassword: () => Promise<string>;
}) {
  const [roles, setRoles] = useState<PerfilAcesso[]>(usuario.perfis);
  const [erro, setErro] = useState('');
  const [senhaTemporaria, setSenhaTemporaria] = useState('');
  const [processando, setProcessando] = useState(false);

  async function executar(action: () => Promise<void>) {
    setErro('');
    setProcessando(true);
    try {
      await action();
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setProcessando(false);
    }
  }

  async function gerarSenha() {
    setErro('');
    setProcessando(true);
    try {
      setSenhaTemporaria(await onTemporaryPassword());
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setProcessando(false);
    }
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={700}>{usuario.nomeApelido}</Typography>
            <Typography variant="body2" color="text.secondary">{usuario.email || usuario.telefone}</Typography>
            <Typography variant="caption" color={usuario.ativo ? 'success.main' : 'error.main'}>
              {usuario.ativo ? 'Ativo' : 'Bloqueado'}{usuario.senhaTemporaria ? ' · troca de senha pendente' : ''}
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel id={`roles-${usuario.id}`}>Perfis</InputLabel>
            <Select
              labelId={`roles-${usuario.id}`}
              multiple
              value={roles}
              label="Perfis"
              onChange={(event) => setRoles(event.target.value as PerfilAcesso[])}
              renderValue={(selected) => selected.join(', ')}
            >
              {perfisDisponiveis.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
            </Select>
          </FormControl>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Button size="small" onClick={() => void executar(() => onSaveRoles(roles))} disabled={processando}>Salvar perfis</Button>
            <Button size="small" onClick={() => void gerarSenha()} disabled={processando}>Senha temporária</Button>
            <Button size="small" color={usuario.ativo ? 'error' : 'success'} onClick={() => void executar(onBlock)} disabled={processando}>
              {usuario.ativo ? 'Bloquear' : 'Desbloquear'}
            </Button>
          </Stack>
        </Stack>
        {erro && <Alert severity="error" sx={{ mt: 2 }}>{erro}</Alert>}
        {senhaTemporaria && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Senha temporária: <strong>{senhaTemporaria}</strong>. Compartilhe-a com o usuário por um canal seguro.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
