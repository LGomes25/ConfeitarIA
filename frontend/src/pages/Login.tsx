import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Container, Paper, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';

export function Login() {
  const [tipo, setTipo] = useState<'Email' | 'Telefone'>('Email');
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { entrar, erroSessao } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrar(tipo, identificador, senha);
      const state = location.state as { from?: { pathname?: string } } | null;
      navigate(state?.from?.pathname ?? '/perfil', { replace: true });
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Header />
      <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 } }}>
        <Paper component="form" onSubmit={submit} sx={{ p: { xs: 3, sm: 5 } }}>
          <Typography variant="h2" sx={{ mb: 1 }}>Que bom ter você de volta!</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Entre com seu email ou telefone cadastrado.</Typography>
          {(erroSessao || erro) && <Alert severity="error" sx={{ mb: 2 }}>{erroSessao || erro}</Alert>}
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={tipo}
            onChange={(_, value: 'Email' | 'Telefone' | null) => value && setTipo(value)}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="Email">Email</ToggleButton>
            <ToggleButton value="Telefone">Telefone</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            fullWidth
            required
            label={tipo}
            value={identificador}
            onChange={(event) => setIdentificador(event.target.value)}
            autoComplete={tipo === 'Email' ? 'email' : 'tel'}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            required
            type="password"
            label="Senha"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            autoComplete="current-password"
            sx={{ mb: 1 }}
          />
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Button component={Link} to="/recuperar-senha" type="button" size="small">Esqueci minha senha</Button>
          </Box>
          <Button fullWidth type="submit" variant="contained" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </Button>
          <Typography textAlign="center" color="text.secondary" sx={{ mt: 3 }}>
            Ainda não tem conta? <Button component={Link} to="/cadastro" type="button">Cadastre-se</Button>
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
