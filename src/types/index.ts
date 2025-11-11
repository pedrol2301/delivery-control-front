export interface User {
  id: number;
  company_id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user';
  is_active: boolean;
  company: Company;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deliverer {
  id: number;
  company_id: number;
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
  is_active: boolean;
  company?: Company;
  created_at: string;
  updated_at: string;
}

export type DeliveryStatus =
  | 'pending'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface Delivery {
  id: number;
  company_id: number;
  deliverer_id: number;
  created_by: number;
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
  started_at?: string;
  completed_at?: string;
  status: DeliveryStatus;
  notes?: string;
  delivery_proof?: string;
  failure_reason?: string;
  latitude?: number;
  longitude?: number;
  deliverer?: Deliverer;
  creator?: User;
  created_at: string;
  updated_at: string;
}

export interface DeliveryStatistics {
  total: number;
  pending: number;
  assigned: number;
  in_transit: number;
  delivered: number;
  failed: number;
  cancelled: number;
  total_value: number;
  total_delivery_fees: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: string;
  user_type?: string;
}

export interface DelivererAuthResponse {
  message: string;
  deliverer: Deliverer;
  access_token: string;
  token_type: string;
  user_type: 'deliverer';
  must_change_password: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  company_name: string;
  company_cnpj: string;
  company_email: string;
  company_phone?: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
