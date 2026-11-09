import { useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { AppLayout } from '../layout/AppLayout';
import { PageHeader } from '../common/PageHeader';
import { AvisoConstrucao } from '../common/AvisoConstrucao';

export function PaginaContato() {
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (nome.trim() && mensagem.trim()) {
      setEnviado(true);
      setNome('');
      setContato('');
      setMensagem('');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Fale Conosco"
        description="Dúvidas, pedidos personalizados ou orçamentos especiais? Estamos à disposição!"
      />

      <AvisoConstrucao
        titulo="Canal de Atendimento em Expansão..."
        mensagem="Nosso atendimento automatizado está em desenvolvimento. Para contato imediato, utilize nossos canais diretos abaixo!"
      />

      <Grid container spacing={4} sx={{ mt: 1 }}>
        {/* Informações e Canais de Contato */}
        <Grid item xs={12} md={5}>
          <Paper elevation={1} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, border: '1px solid #f0e7e0', height: '100%' }}>
            <Typography variant="h2" sx={{ fontSize: 20, mb: 2 }}>
              Canais Diretos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
              Entre em contato conosco diretamente pelos nossos canais oficiais de comunicação:
            </Typography>

            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: '#e8f5e9',
                    color: '#2e7d32',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <WhatsAppIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    WHATSAPP
                  </Typography>
                  <Typography
                    component="a"
                    href="https://wa.me/5521999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'primary.dark', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    (21) 99999-9999
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: '#fff5ef',
                    color: 'secondary.main',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <PhoneOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    TELEFONE
                  </Typography>
                  <Typography
                    component="a"
                    href="tel:+552122222222"
                    sx={{ color: 'text.primary', fontWeight: 600, textDecoration: 'none' }}
                  >
                    (21) 2222-2222
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: '#fbe5ed',
                    color: 'primary.dark',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <EmailOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    EMAIL
                  </Typography>
                  <Typography
                    component="a"
                    href="mailto:contato@confeitaria.com.br"
                    sx={{ color: 'primary.dark', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    contato@confeitaria.com.br
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: '#f5f0e6',
                    color: 'secondary.dark',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <LocationOnOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    LOCALIZAÇÃO
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Petrópolis / RJ — Região Serrana
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Formulário de Contato */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={1}
            component="form"
            onSubmit={handleSubmit}
            sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, border: '1px solid #f0e7e0' }}
          >
            <Typography variant="h2" sx={{ fontSize: 20, mb: 1 }}>
              Envie sua Mensagem
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Preencha os campos abaixo e entraremos em contato o mais breve possível.
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                fullWidth
                required
                label="Seu Nome"
                placeholder="Como podemos te chamar?"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />

              <TextField
                fullWidth
                label="Email ou WhatsApp"
                placeholder="Para respondermos sua mensagem"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
              />

              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Mensagem"
                placeholder="Escreva sua dúvida, sugestão ou pedido..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SendRoundedIcon />}
                sx={{ alignSelf: 'flex-start', px: 3.5, mt: 1 }}
              >
                Enviar mensagem
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={enviado}
        autoHideDuration={4000}
        onClose={() => setEnviado(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setEnviado(false)} sx={{ width: '100%', borderRadius: 2 }}>
          Mensagem recebida com sucesso! Retornaremos em breve.
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}

