import { Box, Grid, Paper, Typography } from '@mui/material';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import { AppLayout } from '../layout/AppLayout';
import { PageHeader } from '../common/PageHeader';
import { AvisoConstrucao } from '../common/AvisoConstrucao';

export function PaginaQuemSomos() {
  return (
    <AppLayout>
      <PageHeader
        title="Quem Somos"
        description="Conheça a história, o amor e a filosofia por trás das nossas receitas."
      />

      <AvisoConstrucao
        titulo="Área Institucional em Expansão..."
        mensagem="Estamos detalhando nossa história e a trajetória de nossa equipe para compartilhar com você!"
      />

      {/* Apresentação Principal e História */}
      <Paper elevation={1} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, border: '1px solid #f0e7e0', mb: 4 }}>
        <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
          Nossa História
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.9, fontSize: 15, mb: 2.5 }}>
          A <strong>ConfeitarIA</strong> nasceu do desejo genuíno de resgatar o sabor autêntico dos doces feitos em casa, aliando a riqueza da confeitaria clássica ao carinho de cada receita de família.
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.9, fontSize: 15 }}>
          O que começou como uma paixão na cozinha transformou-se em um ateliê dedicado a criar momentos especiais na vida das pessoas. Cada bolo, cada recheio e cada decoração carregam nossa dedicação incondicional à qualidade e ao encantamento.
        </Typography>
      </Paper>

      {/* Nosso Propósito */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          bgcolor: '#fff5ef',
          border: '1px solid #f6e8df',
          mb: 4,
        }}
      >
        <Typography variant="h3" sx={{ color: 'primary.dark', mb: 1, fontSize: 18 }}>
          Nosso Propósito
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          Adoçar o dia a dia e celebrar os grandes momentos da vida com produtos preparados de forma honesta, artesanal e memorável.
        </Typography>
      </Paper>

      {/* Nossos Valores */}
      <Typography variant="h2" sx={{ mb: 2.5, fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
        Nossos Valores
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: '#ffffff', border: '1px solid #f0e7e0', borderRadius: 3 }}>
            <Box sx={{ color: 'primary.main', mb: 1.5 }}>
              <FavoriteOutlinedIcon fontSize="large" />
            </Box>
            <Typography variant="h3" sx={{ fontSize: 17, mb: 1 }}>
              Amor em Cada Detalhe
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Não fazemos apenas doces; dedicamos nosso tempo e sensibilidade para entregar afeto em forma de sabor.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: '#ffffff', border: '1px solid #f0e7e0', borderRadius: 3 }}>
            <Box sx={{ color: 'primary.main', mb: 1.5 }}>
              <SpaOutlinedIcon fontSize="large" />
            </Box>
            <Typography variant="h3" sx={{ fontSize: 17, mb: 1 }}>
              Ingredientes Nobres
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Respeito absoluto à pureza dos insumos, optando sempre por matérias-primas de alta qualidade e procedência.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: '#ffffff', border: '1px solid #f0e7e0', borderRadius: 3 }}>
            <Box sx={{ color: 'primary.main', mb: 1.5 }}>
              <HandshakeOutlinedIcon fontSize="large" />
            </Box>
            <Typography variant="h3" sx={{ fontSize: 17, mb: 1 }}>
              Transparência e Cuidado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Relacionamento próximo e atencioso com nossos clientes, fornecedores e parceiros em cada etapa.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </AppLayout>
  );
}

