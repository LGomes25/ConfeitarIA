import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import type { PerfilAcesso } from '../../types/usuario';

export function ProtectedRoute({ children, perfis }: { children: React.ReactNode; perfis?: PerfilAcesso[] }) {
  const { sessao, erroSessao } = useAuth();
  const location = useLocation();

  if (!sessao) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', p: 3 }}>
        {erroSessao && <Alert severity="warning" sx={{ mb: 2 }}>{erroSessao}</Alert>}
        <Navigate to="/login" replace state={{ from: location }} />
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (sessao.usuario.senhaTemporaria && location.pathname !== '/perfil') {
    return <Navigate to="/perfil?trocarSenha=1" replace />;
  }
  if (perfis && !perfis.some((perfil) => sessao.usuario.perfis.includes(perfil))) {
    return <Navigate to="/sem-permissao" replace />;
  }
  return <>{children}</>;
}
