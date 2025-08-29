import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl: string = process.env.SUPABASE_URL!;
const supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for user operations (uses anon key)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Admin client for server-side operations (uses service role key)
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database tables
export const TABLES = {
  USERS: 'users',
  MEMBERS: 'members',
  PAYMENTS: 'payments',
  DONATIONS: 'donations',
  EXPENSES: 'expenses',
  BUDGET_CATEGORIES: 'budget_categories',
  FINANCIAL_GOALS: 'financial_goals',
  REMINDERS: 'reminders',
  REMINDER_SETTINGS: 'reminder_settings',
  MEMBER_OWING_MONTHS: 'member_owing_months',
  MEMBER_CREDIT_MONTHS: 'member_credit_months',
  SYSTEM_SETTINGS: 'system_settings'
} as const;

// Real-time subscriptions
export const REALTIME_CHANNELS = {
  MEMBERS: 'members_changes',
  PAYMENTS: 'payments_changes',
  DONATIONS: 'donations_changes',
  EXPENSES: 'expenses_changes',
  REMINDERS: 'reminders_changes',
  DASHBOARD: 'dashboard_updates'
} as const;

// Error response interface
interface ErrorResponse {
  error: string;
  status: number;
}

// Success response interface
interface SuccessResponse<T = any> {
  data: T;
  error: null;
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: PostgrestError, operation: string = 'operation'): ErrorResponse => {
  console.error(`Supabase error during ${operation}:`, error);
  
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        return { error: 'No data found', status: 404 };
      case '23505':
        return { error: 'Duplicate entry', status: 409 };
      case '23503':
        return { error: 'Foreign key constraint violation', status: 400 };
      case '23502':
        return { error: 'Required field missing', status: 400 };
      default:
        return { error: error.message || 'Database error', status: 500 };
    }
  }
  
  return { error: error.message || 'Unknown error', status: 500 };
};

// Helper function to format Supabase response
export const formatResponse = <T = any>(
  data: T | null, 
  error: PostgrestError | null, 
  operation: string = 'operation'
): SuccessResponse<T> | ErrorResponse => {
  if (error) {
    return handleSupabaseError(error, operation);
  }
  
  return { data: data!, error: null };
};

// Helper function to get user from JWT token
export const getUserFromToken = async (token: string): Promise<{ user: any; error: any }> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return { user: null, error };
    }
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

// Helper function to create real-time subscription
export const createRealtimeSubscription = (
  table: string, 
  callback: (payload: any) => void, 
  filters: Record<string, any> = {}
) => {
  const query = supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: table,
        ...filters
      }, 
      callback
    )
    .subscribe();

  return query;
};

export default supabase;
