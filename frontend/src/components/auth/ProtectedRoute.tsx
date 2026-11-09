import { Link, Navigate, useLocation } from 'react-router-dom';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../layout/AppLayout';
import type { PerfilAcesso } from '../../types/usuario';

export function ProtectedRoute({ children, perfis }: { children: React.ReactNode; perfis?: PerfilAcesso[] }) {
  const { sessao, erroSessao } = useAuth();
  const location = useLocation();

  if (!sessao) {
    return (
      <AppLayout>
        <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 } }}>
          <Paper
            elevation={1}
            sx={{
              p: { xs: 3, sm: 5 },
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid #f0e7e0',
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                bgcolor: '#fbe5ed',
                color: 'primary.dark',
                display: 'grid',
                placeItems: 'center',
                mx: 'auto',
                mb: 2.5,
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h2" sx={{ mb: 1.5, fontSize: { xs: 20, sm: 24 } }}>
              Acesso Restrito
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.7 }}>
              Para acessar este recurso interno da confeitaria, por favor faça login com suas credenciais.
            </Typography>
            {erroSessao && (
              <Typography color="error.main" sx={{ mb: 2, fontSize: 13 }}>
                {erroSessao}
              </Typography>
            )}
            <Button
              component={Link}
              to="/login"
              state={{ from: location }}
              variant="contained"
              size="large"
              sx={{ px: 4, py: 1.2 }}
            >
              Fazer Login
            </Button>
          </Paper>
        </Container>
      </AppLayout>
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
