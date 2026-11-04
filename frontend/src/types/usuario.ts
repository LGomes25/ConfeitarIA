export type PerfilAcesso = 'Admin' | 'Manager' | 'Team' | 'Customer';
export type TipoEndereco = 'Residencial' | 'Entrega';

export interface UsuarioResumo {
  id: string;
  nomeApelido: string;
  email: string | null;
  telefone: string | null;
  ativo: boolean;
  senhaTemporaria: boolean;
  perfis: PerfilAcesso[];
}

export interface Endereco {
  id: number | null;
  tipo: TipoEndereco;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  complemento: string | null;
}

export interface MeuPerfil {
  id: string;
  nomeApelido: string;
  email: string | null;
  telefone: string | null;
  notificarPorWhatsApp: boolean;
  notificarPorEmail: boolean;
  senhaTemporaria: boolean;
  perfis: PerfilAcesso[];
  enderecos: Endereco[];
}

export interface DadosSessao {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  usuario: UsuarioResumo;
}

export interface EnderecoForm {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  complemento: string;
}
