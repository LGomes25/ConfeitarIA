import { api } from './api';
import type { Compra, CompraFormData } from '../types/compra';

export const comprasService = {
  async registrar(data: CompraFormData): Promise<Compra> {
    const response = await api.post<Compra>('/compras', data);
    return response.data;
  },
  async excluir(id: number): Promise<void> {
    await api.delete(`/compras/${id}`);
  },
};
