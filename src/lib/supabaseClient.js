import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;


// Validate that we have the necessary environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
}

// Initialize the Supabase client with options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
  realtime: {
    enabled: true,
  },
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase Error:', error.message, error.details, error.hint);
  
  // Return a user-friendly message
  if (error.code === '23505') {
    return 'This record already exists.';
  } else if (error.code === '23503') {
    return 'This operation failed due to a reference constraint.';
  } else if (error.code === 'PGRST116') {
    return 'You do not have permission to perform this action.';
  }
  
  return 'An error occurred. Please try again later.';
};

// Test the connection
export const testConnection = async () => {
  try {
    // Try to get a very small amount of data to test the connection
    const { data, error } = await supabase.from('tenants').select('id').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('Supabase connection successful!');
    return { success: true, message: 'Connection successful', data };
  } catch (error) {
    console.error('Supabase connection test failed:', error.message);
    return { success: false, message: error.message, error };
  }
};

export default supabase;
