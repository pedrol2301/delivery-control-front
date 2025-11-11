import api from './api';
import type { DelivererAuthResponse, LoginRequest, Deliverer } from '../types';

export const delivererAuthService = {
  async login(credentials: LoginRequest): Promise<DelivererAuthResponse> {
    const response = await api.post<DelivererAuthResponse>('/deliverer/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/deliverer/auth/logout');
  },

  async me(): Promise<{ deliverer: Deliverer; user_type: 'deliverer' }> {
    const response = await api.get<{ deliverer: Deliverer; user_type: 'deliverer' }>('/deliverer/auth/me');
    return response.data;
  },

  async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/deliverer/auth/change-password', data);
    return response.data;
  },

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  removeToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('deliverer');
    localStorage.removeItem('userType');
    localStorage.removeItem('mustChangePassword');
  },

  saveDeliverer(deliverer: Deliverer): void {
    localStorage.setItem('deliverer', JSON.stringify(deliverer));
    localStorage.setItem('userType', 'deliverer');
  },

  getDeliverer(): Deliverer | null {
    const deliverer = localStorage.getItem('deliverer');
    return deliverer ? JSON.parse(deliverer) : null;
  },

  getUserType(): string | null {
    return localStorage.getItem('userType');
  },

  saveMustChangePassword(mustChange: boolean): void {
    localStorage.setItem('mustChangePassword', mustChange.toString());
  },

  getMustChangePassword(): boolean {
    return localStorage.getItem('mustChangePassword') === 'true';
  },

  clearMustChangePassword(): void {
    localStorage.removeItem('mustChangePassword');
  },
};
