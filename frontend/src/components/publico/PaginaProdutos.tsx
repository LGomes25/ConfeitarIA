import { Box, Chip, Grid, Paper, Typography } from '@mui/material';
import BakeryDiningOutlinedIcon from '@mui/icons-material/BakeryDiningOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import CookieOutlinedIcon from '@mui/icons-material/CookieOutlined';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import { AppLayout } from '../layout/AppLayout';
import { PageHeader } from '../common/PageHeader';
import { AvisoConstrucao } from '../common/AvisoConstrucao';

interface CategoriaVitrine {
  id: string;
  titulo: string;
  descricao: string;
  destaques: string[];
  icone: typeof CakeOutlinedIcon;
}

const categoriasVitrine: CategoriaVitrine[] = [
  {
    id: 'bolos-artesanais',
    titulo: 'Bolos & Tortas Artesanais',
    descricao: 'Massas fofinhas, recheios cremosos e coberturas delicadas para todas as ocasiões.',
    destaques: ['Red Velvet', 'Ninho com Morango', 'Cenoura com Brigadeiro Belga', 'Torta Holandesa'],
    icone: CakeOutlinedIcon,
  },
  {
    id: 'doces-finos',
    titulo: 'Doces Finos & Brigadeiros',
    descricao: 'Brigadeiros gourmet, trufas e docinhos especiais preparados com chocolates nobres.',
    destaques: ['Brigadeiro Tradicional 70%', 'Pistache Cremoso', 'Camafeu de Nozes', 'Palha Italiana'],
    icone: CookieOutlinedIcon,
  },
  {
    id: 'confeitaria-individual',
    titulo: 'Porções Individuais & Sobremesas',
    descricao: 'Copos da felicidade, fatias generosas e potes para saborear a qualquer hora do dia.',
    destaques: ['Bolo de Pote', 'Banoffee Individual', 'Mousse de Maracujá', 'Brownie Recheado'],
    icone: BakeryDiningOutlinedIcon,
  },
  {
    id: 'festas-eventos',
    titulo: 'Festas & Comemorações',
    descricao: 'Kits completos para aniversários e eventos corporativos personalizados com todo o carinho.',
    destaques: ['Kits Degustação', 'Mesas de Doces', 'Lembrancinhas Doce', 'Bolo Personalizado'],
    icone: CelebrationOutlinedIcon,
  },
];

export function PaginaProdutos() {
  return (
    <AppLayout>
      <PageHeader
        title="Nossos Produtos"
        description="Conheça nossas criações artesanais. Cada item é elaborado com ingredientes selecionados."
      />

      <AvisoConstrucao
        titulo="Vitrine em Construção..."
        mensagem="Estamos montando nosso catálogo interativo com opções de encomendas e personalizações para a próxima fase!"
      />

      {/* Grid de Vitrine Responsiva */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {categoriasVitrine.map((categoria) => {
          const Icone = categoria.icone;
          return (
            <Grid item xs={12} sm={6} key={categoria.id}>
              <Paper
                elevation={1}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid #f0e7e0',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(101, 72, 59, 0.08)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      bgcolor: '#fbe5ed',
                      color: 'primary.dark',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Icone />
                  </Box>
                  <Box>
                    <Typography variant="h3" sx={{ fontSize: 17, fontWeight: 700 }}>
                      {categoria.titulo}
                    </Typography>
                    <Chip label="Em breve" size="small" sx={{ height: 20, fontSize: 11, mt: 0.3 }} />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7, flexGrow: 1 }}>
                  {categoria.descricao}
                </Typography>

                <Box sx={{ pt: 2, borderTop: '1px solid #f8f1eb' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
                    EXEMPLOS DO CARDÁPIO:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {categoria.destaques.map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: '#f0e7e0', color: 'text.primary', fontSize: 12 }}
                      />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </AppLayout>
  );
}

