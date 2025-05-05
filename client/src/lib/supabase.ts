import { createClient } from '@supabase/supabase-js';

// Note: Client-side use only
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anonymous Key. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create avatars bucket if it doesn't exist
(async () => {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    // Create the bucket if it doesn't exist
    if (!avatarBucketExists) {
      const { data, error } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 2 * 1024 * 1024, // 2MB
      });
      
      if (error) {
        console.error('Error creating avatars bucket:', error);
      } else {
        console.log('Avatars bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
})();

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