import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Checkbox, Container, FormControlLabel, Paper, TextField, Typography } from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';
import {
  atualizarPerfil,
  obterPerfil,
  salvarEndereco,
  trocarSenha as trocarSenhaService,
} from '../services/auth.service';
import type { Endereco, EnderecoForm, MeuPerfil } from '../types/usuario';

const enderecoVazio: EnderecoForm = {
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: '',
  cep: '',
  complemento: '',
};

function enderecoParaFormulario(endereco?: Endereco): EnderecoForm {
  if (!endereco) return { ...enderecoVazio };
  return {
    logradouro: endereco.logradouro ?? '',
    numero: endereco.numero ?? '',
    bairro: endereco.bairro ?? '',
    cidade: endereco.cidade ?? '',
    uf: endereco.uf ?? '',
    cep: endereco.cep ?? '',
    complemento: endereco.complemento ?? '',
  };
}

export function Perfil() {
  const [perfil, setPerfil] = useState<MeuPerfil | null>(null);
  const [residencial, setResidencial] = useState<EnderecoForm>({ ...enderecoVazio });
  const [entrega, setEntrega] = useState<EnderecoForm>({ ...enderecoVazio });
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const { sessao, atualizarSessao } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const deveTrocarSenha = perfil?.senhaTemporaria || searchParams.get('trocarSenha') === '1';

  async function carregarPerfil() {
    const data = await obterPerfil();
    setPerfil(data);
    setResidencial(enderecoParaFormulario(data.enderecos.find((item) => item.tipo === 'Residencial')));
    setEntrega(enderecoParaFormulario(data.enderecos.find((item) => item.tipo === 'Entrega')));
  }

  useEffect(() => {
    let active = true;
    obterPerfil()
      .then((data) => {
        if (!active) return;
        setPerfil(data);
        setResidencial(enderecoParaFormulario(data.enderecos.find((item) => item.tipo === 'Residencial')));
        setEntrega(enderecoParaFormulario(data.enderecos.find((item) => item.tipo === 'Entrega')));
      })
      .catch((error: unknown) => {
        if (active) setErro(getApiErrorMessage(error));
      })
      .finally(() => {
        if (active) setCarregando(false);
      });
    return () => { active = false; };
  }, []);

  async function salvarDados(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!perfil) return;
    setErro('');
    setMensagem('');
    try {
      await atualizarPerfil({
        nomeApelido: perfil.nomeApelido,
        email: perfil.email,
        telefone: perfil.telefone,
        notificarPorEmail: perfil.notificarPorEmail,
        notificarPorWhatsApp: perfil.notificarPorWhatsApp,
      });
      setMensagem('Seus dados foram atualizados.');
      await carregarPerfil();
    } catch (error) {
      setErro(getApiErrorMessage(error));
    }
  }

  async function gravarEndereco(tipo: 'residencial' | 'entrega', address: EnderecoForm) {
    setErro('');
    setMensagem('');
    try {
      await salvarEndereco(tipo, address);
      setMensagem(`Endereço ${tipo} salvo com sucesso.`);
      await carregarPerfil();
    } catch (error) {
      setErro(getApiErrorMessage(error));
    }
  }

  async function submitSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');
    setMensagem('');
    if (!sessao) return;
    try {
      const novaSessao = await trocarSenhaService(senhaAtual, novaSenha);
      atualizarSessao(novaSessao);
      setSenhaAtual('');
      setNovaSenha('');
      setMensagem('Senha alterada com sucesso.');
      await carregarPerfil();
      navigate('/perfil', { replace: true });
    } catch (error) {
      setErro(getApiErrorMessage(error));
    }
  }

  if (carregando) return <Typography>Carregando perfil...</Typography>;
  if (!perfil) return <Alert severity="error">{erro || 'Não foi possível carregar o perfil.'}</Alert>;

  return (
    <Container maxWidth="md" disableGutters>
      <Typography variant="h2" sx={{ mb: 1 }}>Meu perfil</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Atualize seus dados e endereços quando precisar.</Typography>
      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
      {mensagem && <Alert severity="success" sx={{ mb: 2 }}>{mensagem}</Alert>}
      {deveTrocarSenha && (
        <Alert severity="warning" sx={{ mb: 2 }}>Crie uma nova senha para continuar.</Alert>
      )}

      <Paper component="form" onSubmit={salvarDados} sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>Dados pessoais</Typography>
        <TextField fullWidth required label="Nome/apelido" value={perfil.nomeApelido} onChange={(event) => setPerfil({ ...perfil, nomeApelido: event.target.value })} inputProps={{ minLength: 3, maxLength: 100 }} sx={{ mb: 2 }} />
        <TextField fullWidth type="email" label="Email" value={perfil.email ?? ''} onChange={(event) => setPerfil({ ...perfil, email: event.target.value || null })} sx={{ mb: 2 }} />
        <TextField fullWidth label="Telefone" value={perfil.telefone ?? ''} onChange={(event) => setPerfil({ ...perfil, telefone: event.target.value || null })} sx={{ mb: 2 }} />
        <FormControlLabel control={<Checkbox checked={perfil.notificarPorEmail} onChange={(event) => setPerfil({ ...perfil, notificarPorEmail: event.target.checked })} />} label="Notificações por email" />
        <FormControlLabel control={<Checkbox checked={perfil.notificarPorWhatsApp} onChange={(event) => setPerfil({ ...perfil, notificarPorWhatsApp: event.target.checked })} />} label="Notificações por WhatsApp" sx={{ display: 'flex', mb: 2 }} />
        <Button type="submit" variant="contained">Salvar dados</Button>
      </Paper>

      <EnderecoEditor titulo="Endereço residencial" value={residencial} onChange={setResidencial} onSave={() => gravarEndereco('residencial', residencial)} />
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h3">Endereço de entrega</Typography>
          <Button
            startIcon={<ContentCopyOutlinedIcon />}
            onClick={() => setEntrega({ ...residencial })}
            disabled={!residencial.logradouro && !residencial.cidade}
          >
            Copiar endereço residencial
          </Button>
        </Box>
        <CamposEndereco value={entrega} onChange={setEntrega} />
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => void gravarEndereco('entrega', entrega)}>Salvar endereço</Button>
      </Paper>

      <Paper component="form" onSubmit={submitSenha} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>Alterar senha</Typography>
        <TextField fullWidth required type="password" label="Senha atual" value={senhaAtual} onChange={(event) => setSenhaAtual(event.target.value)} autoComplete="current-password" sx={{ mb: 2 }} />
        <TextField fullWidth required type="password" label="Nova senha (mínimo 6 caracteres, incluindo número)" value={novaSenha} onChange={(event) => setNovaSenha(event.target.value)} inputProps={{ minLength: 6 }} autoComplete="new-password" sx={{ mb: 2 }} />
        <Button type="submit" variant="outlined">Alterar senha</Button>
      </Paper>
    </Container>
  );
}

function EnderecoEditor({
  titulo,
  value,
  onChange,
  onSave,
}: {
  titulo: string;
  value: EnderecoForm;
  onChange: (address: EnderecoForm) => void;
  onSave: () => void;
}) {
  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>{titulo}</Typography>
      <CamposEndereco value={value} onChange={onChange} />
      <Button variant="contained" sx={{ mt: 2 }} onClick={onSave}>Salvar endereço</Button>
    </Paper>
  );
}

function CamposEndereco({ value, onChange }: { value: EnderecoForm; onChange: (address: EnderecoForm) => void }) {
  const fields: Array<{ key: keyof EnderecoForm; label: string; width: string }> = [
    { key: 'logradouro', label: 'Logradouro', width: '100%' },
    { key: 'numero', label: 'Número', width: '32%' },
    { key: 'bairro', label: 'Bairro', width: '64%' },
    { key: 'cidade', label: 'Cidade', width: '48%' },
    { key: 'uf', label: 'UF', width: '20%' },
    { key: 'cep', label: 'CEP', width: '28%' },
    { key: 'complemento', label: 'Complemento', width: '100%' },
  ];
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
      {fields.map((field) => (
        <TextField
          key={field.key}
          label={field.label}
          value={value[field.key]}
          onChange={(event) => onChange({ ...value, [field.key]: event.target.value })}
          sx={{ flex: `1 1 ${field.width}`, minWidth: field.width === '100%' ? '100%' : 100 }}
          inputProps={field.key === 'uf' ? { maxLength: 2 } : undefined}
        />
      ))}
    </Box>
  );
}
