import { Box, Button, Container, Paper, Typography } from '@mui/material';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

export function Inicio() {
  const { sessao } = useAuth();
  return (
    <Box sx={{ minHeight: '100vh', background: 'radial-gradient(circle at 85% 20%, #fbe5ed 0, transparent 34%), #fffaf5' }}>
      <Header />
      <Container maxWidth="md" sx={{ py: { xs: 7, md: 12 } }}>
        <Paper elevation={1} sx={{ p: { xs: 3, md: 7 }, textAlign: 'center', overflow: 'hidden' }}>
          <CakeOutlinedIcon color="primary" sx={{ fontSize: 56, mb: 2 }} />
          <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 2 }}>
            Sua confeitaria, organizada com carinho
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 620, mx: 'auto', mb: 4, lineHeight: 1.8 }}>
            Acompanhe seus insumos e compras em um só lugar, com ferramentas simples para cuidar dos custos de cada receita.
          </Typography>
          <Button
            component={Link}
            to={sessao ? '/perfil' : '/cadastro'}
            variant="contained"
            size="large"
          >
            {sessao ? 'Acessar meu perfil' : 'Começar agora'}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
