import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { getApiErrorMessage } from '../../services/api';
import {
  alterarPerfis,
  bloquearUsuario,
  definirSenhaTemporaria,
  desbloquearUsuario,
  listarUsuarios,
} from '../../services/auth.service';
import type { PerfilAcesso, UsuarioResumo } from '../../types/usuario';
import { UsuarioCard } from '../../components/usuarios/UsuarioCard';

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioResumo[]>([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      setUsuarios(await listarUsuarios());
    } catch (error) {
      setErro(getApiErrorMessage(error));
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const filtrados = usuarios.filter((usuario) => {
    const matchesText = `${usuario.nomeApelido} ${usuario.email ?? ''} ${usuario.telefone ?? ''}`
      .toLocaleLowerCase()
      .includes(filtroTexto.toLocaleLowerCase());
    const matchesRole = !filtroPerfil || usuario.perfis.includes(filtroPerfil as PerfilAcesso);
    const matchesStatus = filtroStatus === 'todos'
      || (filtroStatus === 'ativos' && usuario.ativo)
      || (filtroStatus === 'bloqueados' && !usuario.ativo);
    return matchesText && matchesRole && matchesStatus;
  });

  async function updateRoles(id: string, perfis: PerfilAcesso[]) {
    await alterarPerfis(id, perfis);
    await carregar();
  }

  async function updateBlock(usuario: UsuarioResumo) {
    if (usuario.ativo) await bloquearUsuario(usuario.id);
    else await desbloquearUsuario(usuario.id);
    await carregar();
  }

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 1 }}>Gestão de usuários</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Altere perfis e controle o acesso das contas.</Typography>
      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField fullWidth label="Buscar por nome ou contato" value={filtroTexto} onChange={(event) => setFiltroTexto(event.target.value)} />
          <Select value={filtroPerfil} displayEmpty onChange={(event) => setFiltroPerfil(event.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem value="">Todos os perfis</MenuItem>
            {['Admin', 'Manager', 'Team', 'Customer'].map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
          </Select>
          <Select value={filtroStatus} onChange={(event) => setFiltroStatus(event.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem value="todos">Todos os status</MenuItem>
            <MenuItem value="ativos">Ativos</MenuItem>
            <MenuItem value="bloqueados">Bloqueados</MenuItem>
          </Select>
        </Stack>
      </Paper>
      <Stack spacing={1.5}>
        {filtrados.map((usuario) => (
          <UsuarioCard
            key={usuario.id}
            usuario={usuario}
            onSaveRoles={(roles) => updateRoles(usuario.id, roles)}
            onBlock={() => updateBlock(usuario)}
            onTemporaryPassword={() => definirSenhaTemporaria(usuario.id)}
          />
        ))}
        {filtrados.length === 0 && <Typography color="text.secondary">Nenhum usuário encontrado.</Typography>}
      </Stack>
    </Box>
  );
}
