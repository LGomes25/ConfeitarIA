import { api } from './api';
import type { Insumo, InsumoDetalhe, InsumoFormData } from '../types/insumo';
import type { Compra, GraficoEvolucaoPrecos } from '../types/compra';

export type StatusInsumos = 'ativos' | 'inativos' | 'todos';

export const insumosService = {
  async listar(status: StatusInsumos): Promise<Insumo[]> {
    const response = await api.get<Insumo[]>('/insumos', { params: { status } });
    return response.data;
  },
  async obter(id: number): Promise<InsumoDetalhe> {
    const response = await api.get<InsumoDetalhe>(`/insumos/${id}`);
    return response.data;
  },
  async criar(data: InsumoFormData): Promise<Insumo> {
    const response = await api.post<Insumo>('/insumos', data);
    return response.data;
  },
  async atualizar(id: number, data: InsumoFormData): Promise<Insumo> {
    const response = await api.put<Insumo>(`/insumos/${id}`, data);
    return response.data;
  },
  async inativar(id: number): Promise<void> {
    await api.delete(`/insumos/${id}`);
  },
  async reativar(id: number): Promise<void> {
    await api.patch(`/insumos/${id}/reativar`);
  },
  async listarCompras(id: number): Promise<Compra[]> {
    const response = await api.get<Compra[]>(`/insumos/${id}/compras`);
    return response.data;
  },
  async obterGrafico(id: number): Promise<GraficoEvolucaoPrecos> {
    const response = await api.get<GraficoEvolucaoPrecos>(`/insumos/${id}/grafico-precos`);
    return response.data;
  },
};
