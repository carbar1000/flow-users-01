
import { createClient } from '@supabase/supabase-js';

// Get credentials from localStorage if available
const supabaseUrl = localStorage.getItem('SUPABASE_URL') || 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://your-supabase-url.supabase.co';

const supabaseKey = localStorage.getItem('SUPABASE_KEY') || 
  import.meta.env.VITE_SUPABASE_KEY || 
  'your-supabase-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to reinitialize the client with new credentials
export const createSupabaseClient = (url: string, key: string) => {
  return createClient(url, key);
};
