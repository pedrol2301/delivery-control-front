import api from './api';
import type { Delivery, PaginatedResponse } from '../types';

export const delivererDeliveryService = {
  async getMyDeliveries(params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Delivery>> {
    const response = await api.get<PaginatedResponse<Delivery>>('/deliverer/deliveries', { params });
    return response.data;
  },

  async updateStatus(
    id: number,
    data: {
      status: 'in_transit' | 'delivered' | 'failed';
      delivery_proof?: string;
      failure_reason?: string;
      latitude?: number;
      longitude?: number;
    }
  ): Promise<{ message: string; delivery: Delivery }> {
    const response = await api.put<{ message: string; delivery: Delivery }>(
      `/deliverer/deliveries/${id}/status`,
      data
    );
    return response.data;
  },
};
