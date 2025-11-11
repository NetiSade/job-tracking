import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with user's auth token
export const createSupabaseClient = (accessToken?: string): SupabaseClient => {
  if (accessToken) {
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }
  return createClient(supabaseUrl, supabaseKey);
};

// Default client (for non-authenticated operations if needed)
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;

