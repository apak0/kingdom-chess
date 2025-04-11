import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ncwivquuczzysxtsnkgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jd2l2cXV1Y3p6eXN4dHNua2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNjIzMTMsImV4cCI6MjA1OTkzODMxM30.q14ZTDXSIIoKwC_-iVkoRBS3Yb8Z-YrTvOo0Z8iIkXM';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});