// API client for connecting to the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    phone?: string;
  };
  token: string;
}

// Member types
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  status: 'active' | 'inactive' | 'suspended';
  total_paid: number;
  total_owing: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMemberRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

// Payment types
export interface Payment {
  id: string;
  member_id: string;
  amount: number;
  method: 'cash' | 'mobile_money' | 'bank_transfer';
  payment_date: string;
  is_advance: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  memberId: string;
  amount: number;
  method: 'cash' | 'mobile_money' | 'bank_transfer';
  monthsPaid: string[];
  isAdvancePayment?: boolean;
  notes?: string;
}

// Dashboard types
export interface DashboardStats {
  total_members: number;
  active_members: number;
  total_income: number;
  total_expenses: number;
  net_balance: number;
  monthly_collections: Array<{
    month: string;
    amount: number;
  }>;
  payment_methods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  recent_activity: Array<{
    id: string;
    type: string;
    description: string;
    amount?: number;
    created_at: string;
  }>;
}

// API Client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get authentication token
  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token');
  }

  // Make HTTP request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('Making API request to:', url, 'with config:', config);
      const response = await fetch(url, config);
      console.log('Response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/auth/login', credentials);
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/auth/register', userData);
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.post('/auth/logout');
    this.setToken(null);
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<AuthResponse['user']>> {
    return this.get<AuthResponse['user']>('/auth/me');
  }

  // Members endpoints
  async getMembers(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Member>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/members${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<Member[]>(endpoint) as Promise<PaginatedResponse<Member>>;
  }

  async getMember(id: string): Promise<ApiResponse<Member>> {
    return this.get<Member>(`/members/${id}`);
  }

  async createMember(member: CreateMemberRequest): Promise<ApiResponse<Member>> {
    return this.post<Member>('/members', member);
  }

  async updateMember(id: string, member: Partial<CreateMemberRequest>): Promise<ApiResponse<Member>> {
    return this.put<Member>(`/members/${id}`, member);
  }

  async deleteMember(id: string): Promise<ApiResponse> {
    return this.delete(`/members/${id}`);
  }

  // Payments endpoints
  async getPayments(params?: {
    memberId?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Payment>> {
    const queryParams = new URLSearchParams();
    if (params?.memberId) queryParams.append('memberId', params.memberId);
    if (params?.method) queryParams.append('method', params.method);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<Payment[]>(endpoint) as Promise<PaginatedResponse<Payment>>;
  }

  async createPayment(payment: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    return this.post<Payment>('/payments', payment);
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.get<DashboardStats>('/dashboard/stats');
  }

  async getMonthlyCollections(): Promise<ApiResponse<{ chartData: any[] }>> {
    return this.get<{ chartData: any[] }>('/dashboard/charts/monthly-collections');
  }

  async getPaymentMethods(): Promise<ApiResponse<{ paymentMethodData: any[] }>> {
    return this.get<{ paymentMethodData: any[] }>('/dashboard/charts/payment-methods');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export default
export default apiClient;
