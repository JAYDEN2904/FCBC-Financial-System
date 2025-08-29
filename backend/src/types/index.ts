// Database types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  date_of_birth?: string;
  membership_date: string;
  status: 'active' | 'inactive' | 'suspended';
  total_paid: number;
  total_owing: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  member_id: string;
  amount: number;
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer';
  payment_date: string;
  month: string;
  year: number;
  is_advance: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  member_id?: string;
  donor_name: string;
  amount: number;
  donation_type: 'tithe' | 'offering' | 'special' | 'other';
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer';
  donation_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
  receipt_url?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  member_id: string;
  message: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
}

// API Response types
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

// Request types
export interface CreateMemberRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
  date_of_birth?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateMemberRequest extends Partial<CreateMemberRequest> {
  status?: 'active' | 'inactive' | 'suspended';
}

export interface CreatePaymentRequest {
  memberId: string;
  amount: number;
  method: 'cash' | 'mobile_money' | 'bank_transfer';
  monthsPaid: string[];
  isAdvancePayment?: boolean;
  notes?: string;
}

export interface CreateDonationRequest {
  member_id?: string;
  donorName: string;
  amount: number;
  donationType: 'tithe' | 'offering' | 'special' | 'other';
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer';
  notes?: string;
}

export interface CreateExpenseRequest {
  category: string;
  amount: number;
  description: string;
  expenseDate: string;
  receiptUrl?: string;
}

export interface CreateBudgetRequest {
  category: string;
  amount: number;
  period: string;
}

export interface CreateFinancialGoalRequest {
  title: string;
  description: string;
  target_amount: number;
  deadline: string;
}

export interface CreateReminderRequest {
  memberId: string;
  message: string;
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
  phone?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadResponse {
  url: string;
  path: string;
  size: number;
  mimetype: string;
}

// Socket.IO types
export interface SocketEvents {
  'member:created': (member: Member) => void;
  'member:updated': (member: Member) => void;
  'member:deleted': (memberId: string) => void;
  'payment:created': (payment: Payment) => void;
  'payment:updated': (payment: Payment) => void;
  'donation:created': (donation: Donation) => void;
  'expense:created': (expense: Expense) => void;
  'expense:updated': (expense: Expense) => void;
  'reminder:sent': (reminder: Reminder) => void;
}

// Environment types
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  SMS_PROVIDER: string;
  SMS_API_KEY?: string;
  SMS_SENDER_ID?: string;
}
