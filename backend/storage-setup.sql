-- Storage Setup for Church Management System
-- Run this in your Supabase SQL Editor

-- Create storage buckets (this should work with your permissions)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('expense-receipts', 'expense-receipts', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf']),
  ('reports', 'reports', false, 10485760, ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- Verify buckets were created
SELECT 'Buckets created successfully:' as status;
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id IN ('expense-receipts', 'reports');