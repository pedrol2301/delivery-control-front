import api from './api';
import type { Delivery, DeliveryStatistics, PaginatedResponse } from '../types';

export interface DeliveryFilters {
  deliverer_id?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateDeliveryData {
  deliverer_id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip_code: string;
  address_reference?: string;
  order_number?: string;
  description?: string;
  value?: number;
  delivery_fee?: number;
  scheduled_date: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateDeliveryStatusData {
  status: string;
  delivery_proof?: string;
  failure_reason?: string;
}

export const deliveryService = {
  async getAll(filters?: DeliveryFilters): Promise<PaginatedResponse<Delivery>> {
    const response = await api.get<PaginatedResponse<Delivery>>('/deliveries', {
      params: filters,
    });
    return response.data;
  },

  async getById(id: number): Promise<{ delivery: Delivery }> {
    const response = await api.get<{ delivery: Delivery }>(`/deliveries/${id}`);
    return response.data;
  },

  async create(data: CreateDeliveryData): Promise<{ message: string; delivery: Delivery }> {
    const response = await api.post<{ message: string; delivery: Delivery }>(
      '/deliveries',
      data
    );
    return response.data;
  },

  async update(
    id: number,
    data: Partial<CreateDeliveryData>
  ): Promise<{ message: string; delivery: Delivery }> {
    const response = await api.put<{ message: string; delivery: Delivery }>(
      `/deliveries/${id}`,
      data
    );
    return response.data;
  },

  async updateStatus(
    id: number,
    data: UpdateDeliveryStatusData
  ): Promise<{ message: string; delivery: Delivery }> {
    const response = await api.put<{ message: string; delivery: Delivery }>(
      `/deliveries/${id}/status`,
      data
    );
    return response.data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/deliveries/${id}`);
    return response.data;
  },

  async getStatistics(start_date?: string, end_date?: string): Promise<DeliveryStatistics> {
    const response = await api.get<DeliveryStatistics>('/deliveries/statistics', {
      params: { start_date, end_date },
    });
    return response.data;
  },
};
