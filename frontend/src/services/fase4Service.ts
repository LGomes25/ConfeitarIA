import { api } from './api';
import type { Componente, ComponenteFormData, ItemReceitaFormData } from '../types/componente.types';
import type { ReceitaCompleta, ReceitaCompletaFormData } from '../types/receitaCompleta.types';
import type { ItemExtraProduto, ItemExtraProdutoFormData } from '../types/itemExtraProduto.types';
import type { Produto, ProdutoFormData, ProdutoPublico, ProdutoComponente } from '../types/produto.types';
import type { ComposicaoCusto } from '../types/analiseCusto.types';
import type { Precificacao, PrecificacaoFormData, RelatorioCustoPreco } from '../types/precificacao.types';

type ReceitaTipo = 'componente' | 'receita';
const rotaReceita = (tipo: ReceitaTipo) => tipo === 'componente' ? '/componentes' : '/receitas-completas';

export const fase4Service = {
  async listarReceitas(tipo: ReceitaTipo, inativos = false): Promise<Array<Componente | ReceitaCompleta>> {
    const response = await api.get<Array<Componente | ReceitaCompleta>>(
      `${rotaReceita(tipo)}${inativos ? '/inativos' : ''}`,
    );
    return response.data;
  },
  async obterReceita(tipo: ReceitaTipo, id: number): Promise<Componente | ReceitaCompleta> {
    const response = await api.get<Componente | ReceitaCompleta>(`${rotaReceita(tipo)}/${id}`);
    return response.data;
  },
  async salvarReceita(tipo: ReceitaTipo, data: ComponenteFormData | ReceitaCompletaFormData, id?: number) {
    const response = id
      ? await api.put<Componente | ReceitaCompleta>(`${rotaReceita(tipo)}/${id}`, data)
      : await api.post<Componente | ReceitaCompleta>(rotaReceita(tipo), data);
    return response.data;
  },
  async inativarReceita(tipo: ReceitaTipo, id: number): Promise<void> {
    await api.patch(`${rotaReceita(tipo)}/${id}/inativar`);
  },
  async adicionarItemReceita(tipo: ReceitaTipo, id: number, data: ItemReceitaFormData) {
    const component = tipo === 'receita' && data.componenteId;
    await api.post(`${rotaReceita(tipo)}/${id}/${component ? 'componentes' : 'itens'}`, data);
  },
  async atualizarItemReceita(tipo: ReceitaTipo, id: number, data: { quantidade: number }) {
    await api.put(`${rotaReceita(tipo)}/itens/${id}`, { quantidade: data.quantidade });
  },
  async removerItemReceita(tipo: ReceitaTipo, id: number): Promise<void> {
    await api.delete(`${rotaReceita(tipo)}/itens/${id}`);
  },

  async listarProdutos(): Promise<Produto[]> {
    const response = await api.get<Produto[]>('/produtos');
    return response.data;
  },
  async listarProdutosAtivos(): Promise<ProdutoPublico[]> {
    const response = await api.get<ProdutoPublico[]>('/produtos/ativos');
    return response.data;
  },
  async obterProduto(id: number): Promise<Produto> {
    const response = await api.get<Produto>(`/produtos/${id}`);
    return response.data;
  },
  async criarProduto(data: ProdutoFormData): Promise<Produto> {
    const response = await api.post<Produto>('/produtos', data);
    return response.data;
  },
  async atualizarProduto(id: number, data: ProdutoFormData): Promise<Produto> {
    const response = await api.put<Produto>(`/produtos/${id}`, data);
    return response.data;
  },
  async inativarProduto(id: number): Promise<void> {
    await api.patch(`/produtos/${id}/inativar`);
  },
  async adicionarComponenteProduto(id: number, data: { componenteId?: number; receitaCompletaId?: number; ordem: number }): Promise<void> {
    await api.post(`/produtos/${id}/componentes`, data);
  },
  async atualizarComponenteProduto(id: number, data: { componenteId?: number; receitaCompletaId?: number; ordem: number }): Promise<void> {
    await api.put(`/produtos/componentes/${id}`, data);
  },
  async removerComponenteProduto(id: number): Promise<void> {
    await api.delete(`/produtos/componentes/${id}`);
  },
  async adicionarExtraProduto(produtoId: number, data: ItemExtraProdutoFormData): Promise<void> {
    await api.post(`/produtos/${produtoId}/itens-extras`, data);
  },
  async atualizarExtraProduto(id: number, data: ItemExtraProdutoFormData): Promise<void> {
    await api.put(`/produtos/itens-extras/${id}`, data);
  },
  async removerExtraProduto(id: number): Promise<void> {
    await api.delete(`/produtos/itens-extras/${id}`);
  },
  async obterPrecificacao(id: number): Promise<Precificacao> {
    const response = await api.get<Precificacao>(`/produtos/${id}/precificacao`);
    return response.data;
  },
  async salvarPrecificacao(id: number, data: PrecificacaoFormData): Promise<Precificacao> {
    const response = await api.put<Precificacao>(`/produtos/${id}/precificacao`, data);
    return response.data;
  },
  async obterComposicaoCusto(id: number): Promise<ComposicaoCusto> {
    const response = await api.get<ComposicaoCusto>(`/produtos/${id}/composicao-custo`);
    return response.data;
  },
  async listarRelatorio(): Promise<RelatorioCustoPreco[]> {
    const response = await api.get<RelatorioCustoPreco[]>('/relatorios/custos-e-precos');
    return response.data;
  },
  async exportarRelatorio(params: { alerta?: boolean; margemAbaixoSugerida?: boolean } = {}): Promise<Blob> {
    const response = await api.get<Blob>('/relatorios/custos-e-precos/exportar', { params, responseType: 'blob' });
    return response.data;
  },
};

export type { ReceitaTipo, ItemExtraProduto, ProdutoComponente };
