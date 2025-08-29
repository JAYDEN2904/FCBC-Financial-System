-- Safe Storage Setup for Church Management System
-- This version handles existing policies gracefully
-- Run this in your Supabase SQL Editor

-- Create storage buckets (with conflict handling)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('expense-receipts', 'expense-receipts', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf']),
  ('reports', 'reports', false, 10485760, ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can view expense receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload expense receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update expense receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete expense receipts" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can view reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete reports" ON storage.objects;

-- Create storage policies for expense-receipts bucket
CREATE POLICY "Authenticated users can view expense receipts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'expense-receipts' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload expense receipts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'expense-receipts' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update expense receipts" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'expense-receipts' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete expense receipts" ON storage.objects
FOR DELETE USING (
  bucket_id = 'expense-receipts' 
  AND auth.role() = 'authenticated'
);

-- Create storage policies for reports bucket
CREATE POLICY "Authenticated users can view reports" ON storage.objects
FOR SELECT USING (
  bucket_id = 'reports' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload reports" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'reports' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update reports" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'reports' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete reports" ON storage.objects
FOR DELETE USING (
  bucket_id = 'reports' 
  AND auth.role() = 'authenticated'
);

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance (with conflict handling)
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);
CREATE INDEX IF NOT EXISTS idx_storage_objects_created_at ON storage.objects(created_at);

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS cleanup_expense_storage();
DROP FUNCTION IF EXISTS get_storage_stats();
DROP TRIGGER IF EXISTS cleanup_expense_storage_trigger ON public.expenses;

-- Create function to clean up storage when expense is deleted
CREATE OR REPLACE FUNCTION cleanup_expense_storage()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete expense receipts
  DELETE FROM storage.objects 
  WHERE bucket_id = 'expense-receipts' 
  AND name LIKE 'expenses/' || OLD.id || '/%';
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to clean up storage when expense is deleted
CREATE TRIGGER cleanup_expense_storage_trigger
  AFTER DELETE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_expense_storage();

-- Create function to get storage usage statistics
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE (
  bucket_name TEXT,
  file_count BIGINT,
  total_size BIGINT,
  avg_size NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.name as bucket_name,
    COUNT(o.id) as file_count,
    COALESCE(SUM(o.metadata->>'size')::BIGINT, 0) as total_size,
    COALESCE(AVG((o.metadata->>'size')::NUMERIC), 0) as avg_size
  FROM storage.buckets b
  LEFT JOIN storage.objects o ON b.id = o.bucket_id
  WHERE b.name IN ('expense-receipts', 'reports')
  GROUP BY b.id, b.name
  ORDER BY b.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_storage_stats() TO authenticated;

-- Drop existing view if it exists
DROP VIEW IF EXISTS storage_usage;

-- Create a view for easy storage monitoring
CREATE OR REPLACE VIEW storage_usage AS
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM((metadata->>'size')::BIGINT) as total_size_bytes,
  ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2) as total_size_mb,
  MIN(created_at) as oldest_file,
  MAX(created_at) as newest_file
FROM storage.objects
WHERE bucket_id IN ('expense-receipts', 'reports')
GROUP BY bucket_id
ORDER BY total_size_bytes DESC;

-- Grant access to the view
GRANT SELECT ON storage_usage TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Storage setup completed successfully!';
  RAISE NOTICE 'Created buckets: expense-receipts, reports';
  RAISE NOTICE 'Created policies, functions, and views';
END $$;
