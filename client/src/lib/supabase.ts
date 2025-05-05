import { createClient } from '@supabase/supabase-js';

// Note: Client-side use only
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anonymous Key. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    avatar_url?: string;
  };
  app_metadata?: {
    role?: string;
    companyId?: number;
  };
};