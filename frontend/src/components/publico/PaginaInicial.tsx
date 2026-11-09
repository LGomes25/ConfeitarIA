import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Link } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { PageHeader } from '../common/PageHeader';
import { AvisoConstrucao } from '../common/AvisoConstrucao';

export function PaginaInicial() {
  return (
    <AppLayout>
      <PageHeader
        title="Bem-vindo à ConfeitarIA"
        description="A arte da confeitaria artesanal com dedicação, sabor e afeto em cada detalhe."
      />

      {/* Destaque Principal (Hero) */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 4, sm: 6 },
          textAlign: 'center',
          background: 'radial-gradient(circle at 85% 20%, #fbe5ed 0, transparent 40%), #ffffff',
          borderRadius: 4,
          border: '1px solid #f0e7e0',
          mb: 4,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            mx: 'auto',
            mb: 2.5,
            display: 'grid',
            placeItems: 'center',
            color: 'primary.dark',
            bgcolor: '#fbe5ed',
            borderRadius: 4,
          }}
        >
          <CakeOutlinedIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem' }, mb: 2 }}>
          Doces artesanais para momentos inesquecíveis
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ maxWidth: 640, mx: 'auto', mb: 4, fontSize: { xs: 15, sm: 16 }, lineHeight: 1.8 }}
        >
          Nossas receitas combinam ingredientes nobres e técnicas artesanais para transformar momentos simples em celebrações doces e memoráveis.
        </Typography>
        <Button
          component={Link}
          to="/produtos"
          variant="contained"
          size="large"
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{ px: 3.5, py: 1.2, fontSize: 15 }}
        >
          Conheça nossos produtos
        </Button>
      </Paper>

      {/* Aviso de Construção Padronizado */}
      <AvisoConstrucao
        titulo="Estamos preparando algo especial..."
        mensagem="Em breve você poderá conferir nosso cardápio completo e fazer encomendas diretamente por aqui!"
      />

      {/* Destaques Institucionais */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: '#ffffff', border: '1px solid #f0e7e0', borderRadius: 3 }}>
            <Box sx={{ color: 'primary.main', mb: 1.5 }}>
              <CakeOutlinedIcon fontSize="large" />
            </Box>
            <Typography variant="h3" sx={{ fontSize: 18, mb: 1 }}>
              Receitas Exclusivas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Bolos decorados, doces finos e sobremesas autorais pensadas para encantar paladares exigentes.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: '#ffffff', border: '1px solid #f0e7e0', borderRadius: 3 }}>
            <Box sx={{ color: 'primary.main', mb: 1.5 }}>
              <FavoriteBorderRoundedIcon fontSize="large" />
            </Box>
            <Typography variant="h3" sx={{ fontSize: 18, mb: 1 }}>
              Amor pelo Artesanal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Cada fornada é preparada à mão, respeitando o tempo de cada ingrediente e o carinho em cada acabamento.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: '#ffffff', border: '1px solid #f0e7e0', borderRadius: 3 }}>
            <Box sx={{ color: 'primary.main', mb: 1.5 }}>
              <AutoAwesomeOutlinedIcon fontSize="large" />
            </Box>
            <Typography variant="h3" sx={{ fontSize: 18, mb: 1 }}>
              Ocasiões Especiais
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Aniversários, casamentos e eventos corporativos personalizados para transformar seu momento em pura festa.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </AppLayout>
  );
}

