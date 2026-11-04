import { api } from './api';
import type { DadosSessao, Endereco, EnderecoForm, MeuPerfil, PerfilAcesso, UsuarioResumo } from '../types/usuario';

export interface CadastroInput {
  nomeApelido: string;
  email: string;
  telefone: string;
  senha: string;
  notificarPorWhatsApp: boolean;
  notificarPorEmail: boolean;
}

export async function cadastrar(input: CadastroInput): Promise<void> {
  await api.post('/auth/cadastro', input);
}

export async function login(tipoLogin: 'Email' | 'Telefone', identificador: string, senha: string): Promise<DadosSessao> {
  const { data } = await api.post<DadosSessao>('/auth/login', { tipoLogin, identificador, senha });
  return data;
}

export async function renovarSessao(refreshToken: string): Promise<DadosSessao> {
  const { data } = await api.post<DadosSessao>('/auth/refresh', { refreshToken });
  return data;
}

export async function encerrarSessao(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}

export async function solicitarRecuperacao(identificador: string): Promise<void> {
  await api.post('/auth/esqueci-senha', { identificador });
}

export async function redefinirSenha(identificador: string, token: string, novaSenha: string): Promise<void> {
  await api.post('/auth/redefinir-senha', { identificador, token, novaSenha });
}

export async function trocarSenha(senhaAtual: string, novaSenha: string): Promise<DadosSessao> {
  const { data } = await api.post<DadosSessao>('/auth/trocar-senha', { senhaAtual, novaSenha });
  return data;
}

export async function obterPerfil(): Promise<MeuPerfil> {
  const { data } = await api.get<MeuPerfil>('/meu-perfil');
  return data;
}

export async function atualizarPerfil(input: Pick<MeuPerfil, 'nomeApelido' | 'email' | 'telefone' | 'notificarPorEmail' | 'notificarPorWhatsApp'>): Promise<void> {
  await api.put('/meu-perfil', input);
}

export async function salvarEndereco(tipo: 'residencial' | 'entrega', endereco: EnderecoForm): Promise<Endereco> {
  const { data } = await api.put<Endereco>(`/meu-perfil/endereco-${tipo}`, {
    ...endereco,
    tipo: tipo === 'entrega' ? 'Entrega' : 'Residencial',
  });
  return data;
}

export async function listarUsuarios(): Promise<UsuarioResumo[]> {
  const { data } = await api.get<UsuarioResumo[]>('/usuarios');
  return data;
}

export async function alterarPerfis(id: string, perfis: PerfilAcesso[]): Promise<void> {
  await api.patch(`/usuarios/${id}/perfil`, { perfis });
}

export async function definirSenhaTemporaria(id: string): Promise<string> {
  const { data } = await api.post<{ senhaTemporaria: string }>(`/usuarios/${id}/senha-temporaria`);
  return data.senhaTemporaria;
}

export async function bloquearUsuario(id: string): Promise<void> {
  await api.patch(`/usuarios/${id}/bloquear`);
}

export async function desbloquearUsuario(id: string): Promise<void> {
  await api.patch(`/usuarios/${id}/desbloquear`);
}
