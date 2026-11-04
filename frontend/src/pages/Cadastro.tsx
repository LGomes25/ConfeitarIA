import { useState, type FormEvent } from 'react';
import { Alert, Button, Checkbox, Container, FormControlLabel, Paper, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { getApiErrorMessage } from '../services/api';
import { cadastrar } from '../services/auth.service';

export function Cadastro() {
  const [nomeApelido, setNomeApelido] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [notificarPorEmail, setNotificarPorEmail] = useState(true);
  const [notificarPorWhatsApp, setNotificarPorWhatsApp] = useState(true);
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');
    if (!email.trim() && !telefone.trim()) {
      setErro('Informe um email ou telefone para criar sua conta.');
      return;
    }
    setEnviando(true);
    try {
      await cadastrar({ nomeApelido, email, telefone, senha, notificarPorEmail, notificarPorWhatsApp });
      setEnviado(true);
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
          <Typography variant="h2" sx={{ mb: 1 }}>Crie sua conta</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Preencha seu nome e pelo menos um contato.</Typography>
          {enviado ? (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>Conta criada com sucesso! Já pode entrar.</Alert>
              <Button fullWidth type="button" variant="contained" onClick={() => navigate('/login')}>Ir para login</Button>
            </>
          ) : (
            <>
              {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
              <TextField fullWidth required label="Como quer ser chamado(a)?" value={nomeApelido} onChange={(event) => setNomeApelido(event.target.value)} inputProps={{ minLength: 3, maxLength: 100 }} sx={{ mb: 2 }} />
              <TextField fullWidth type="email" label="Email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" sx={{ mb: 2 }} />
              <TextField fullWidth label="Telefone" value={telefone} onChange={(event) => setTelefone(event.target.value)} placeholder="(11) 99999-9999" autoComplete="tel" sx={{ mb: 2 }} />
              <TextField fullWidth required type="password" label="Senha (mínimo 6 caracteres, incluindo número)" value={senha} onChange={(event) => setSenha(event.target.value)} inputProps={{ minLength: 6 }} autoComplete="new-password" sx={{ mb: 1 }} />
              <FormControlLabel control={<Checkbox checked={notificarPorEmail} onChange={(event) => setNotificarPorEmail(event.target.checked)} />} label="Receber notificações por email" />
              <FormControlLabel control={<Checkbox checked={notificarPorWhatsApp} onChange={(event) => setNotificarPorWhatsApp(event.target.checked)} />} label="Receber notificações por WhatsApp" sx={{ display: 'flex', mb: 2 }} />
              <Button fullWidth type="submit" variant="contained" disabled={enviando}>{enviando ? 'Criando conta...' : 'Criar conta'}</Button>
            </>
          )}
          <Typography textAlign="center" color="text.secondary" sx={{ mt: 3 }}>
            Já tem conta? <Button component={Link} to="/login" type="button">Entrar</Button>
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
