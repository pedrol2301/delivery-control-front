import api from './api';
import type { Deliverer, PaginatedResponse } from '../types';

export interface DelivererFilters {
  is_active?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface CreateDelivererData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  cnh?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_active?: boolean;
}

export const delivererService = {
  async getAll(filters?: DelivererFilters): Promise<PaginatedResponse<Deliverer>> {
    const response = await api.get<PaginatedResponse<Deliverer>>('/deliverers', {
      params: filters,
    });
    return response.data;
  },

  async getById(id: number): Promise<{ deliverer: Deliverer }> {
    const response = await api.get<{ deliverer: Deliverer }>(`/deliverers/${id}`);
    return response.data;
  },

  async create(
    data: CreateDelivererData
  ): Promise<{ message: string; deliverer: Deliverer }> {
    const response = await api.post<{ message: string; deliverer: Deliverer }>(
      '/deliverers',
      data
    );
    return response.data;
  },

  async update(
    id: number,
    data: Partial<CreateDelivererData>
  ): Promise<{ message: string; deliverer: Deliverer }> {
    const response = await api.put<{ message: string; deliverer: Deliverer }>(
      `/deliverers/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/deliverers/${id}`);
    return response.data;
  },
};
