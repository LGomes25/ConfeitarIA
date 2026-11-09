import { Box, Paper, Typography } from '@mui/material';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';

interface AvisoConstrucaoProps {
  titulo?: string;
  mensagem?: string;
}

export function AvisoConstrucao({
  titulo = 'Estamos preparando algo especial...',
  mensagem = 'Em breve novidades! Esta área está sendo desenvolvida com muito carinho para você.',
}: AvisoConstrucaoProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        my: 3,
        bgcolor: '#fff5ef',
        border: '1px solid #f6e8df',
        borderRadius: 3,
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        flexDirection: { xs: 'column', sm: 'row' },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          bgcolor: '#fbe5ed',
          color: 'primary.dark',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <ConstructionOutlinedIcon />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h3" sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          🚧 {titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {mensagem}
        </Typography>
      </Box>
    </Paper>
  );
}

