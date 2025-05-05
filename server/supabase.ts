import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anonymous Key. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);