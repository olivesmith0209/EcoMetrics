
import { supabase } from '../server/supabase';
import * as schema from "@shared/schema";

// Export supabase client for database operations
export const db = supabase;

// You can add helper functions here to work with your schema
export async function query<T>(table: string) {
  const { data, error } = await supabase
    .from(table)
    .select('*');
    
  if (error) throw error;
  return data as T[];
}
