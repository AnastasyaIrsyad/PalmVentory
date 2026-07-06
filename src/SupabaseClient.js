import { createClient } from '@supabase/supabase-js';

// URL utama Supabase (Pastikan tidak ada tanda /rest/v1/ di ujungnya)
const supabaseUrl = 'https://suhjtwrqaqovselsczna.supabase.co';

// Anon Public Key utuh milikmu
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aGp0d3JxYXFvdnNlbHNjem5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NDg3MTQsImV4cCI6MjA5NjEyNDcxNH0.t5lArhq9lwBRSj5lFxNC_TUdfs3lbLk1UK0tsK-EXj0';

// PERHATIKAN: Harus pakai 'export const' agar klop dengan KelolaBarang.jsx
export const supabase = createClient(supabaseUrl, supabaseAnonKey);