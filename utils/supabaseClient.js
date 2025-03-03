import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yvfvgodszapuawdprrkt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZnZnb2RzemFwdWF3ZHBycmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2Njc5ODAsImV4cCI6MjA1NjI0Mzk4MH0.I0rSs9udESEM9gIy8J0YfJGBrW3NBdJqGdYreSHE3Rw'; 

export const supabase = createClient(supabaseUrl, supabaseKey);





