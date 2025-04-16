import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eaccyifftnylzxscqjvv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhY2N5aWZmdG55bHp4c2NxanZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzU4MTgsImV4cCI6MjA2MDMxMTgxOH0.eTODB8h9Emgtu8Sfc32QBmojrZrL7Y0MzXfNP_yCeIY';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});