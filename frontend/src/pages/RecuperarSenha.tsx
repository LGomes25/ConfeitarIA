import { useState, type FormEvent } from 'react';
import { Alert, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { getApiErrorMessage } from '../services/api';
import { redefinirSenha, solicitarRecuperacao } from '../services/auth.service';

export function RecuperarSenha() {
  const [identificador, setIdentificador] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [instrucoesEnviadas, setInstrucoesEnviadas] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function solicitar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await solicitarRecuperacao(identificador);
      setInstrucoesEnviadas(true);
      setMensagem('Se os dados estiverem cadastrados, enviaremos as instruções de recuperação.');
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setEnviando(false);
    }
  }

  async function redefinir(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await redefinirSenha(identificador, token, novaSenha);
      setMensagem('Senha redefinida com sucesso. Você já pode entrar.');
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
        <Paper sx={{ p: { xs: 3, sm: 5 } }}>
          <Typography variant="h2" sx={{ mb: 1 }}>Recuperar senha</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Enviaremos um código para os contatos cadastrados.</Typography>
          {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
          {mensagem && <Alert severity="success" sx={{ mb: 2 }}>{mensagem}</Alert>}
          {!mensagem.includes('redefinida com sucesso') && (
            <Paper component="form" variant="outlined" onSubmit={solicitar} sx={{ p: 2, mb: 2 }}>
              <TextField fullWidth required label="Email ou telefone" value={identificador} onChange={(event) => setIdentificador(event.target.value)} sx={{ mb: 2 }} />
              <Button fullWidth type="submit" variant="contained" disabled={enviando}>Enviar instruções</Button>
            </Paper>
          )}
          {instrucoesEnviadas && (
            <Paper component="form" variant="outlined" onSubmit={redefinir} sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Depois de receber o código pelo contato cadastrado, informe-o abaixo.
              </Typography>
              <TextField fullWidth required label="Código recebido" value={token} onChange={(event) => setToken(event.target.value)} sx={{ mb: 2 }} />
              <TextField fullWidth required type="password" label="Nova senha" value={novaSenha} onChange={(event) => setNovaSenha(event.target.value)} inputProps={{ minLength: 6 }} sx={{ mb: 2 }} />
              <Button fullWidth type="submit" variant="outlined" disabled={enviando}>Redefinir senha</Button>
            </Paper>
          )}
          <Button component={Link} to="/login" sx={{ mt: 2 }}>Voltar para login</Button>
        </Paper>
      </Container>
    </>
  );
}
