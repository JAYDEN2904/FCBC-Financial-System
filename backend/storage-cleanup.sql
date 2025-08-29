-- Storage Cleanup Script
-- Use this if you want to completely remove existing storage setup and start fresh
-- Run this BEFORE running storage-setup-safe.sql

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can view expense receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload expense receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update expense receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete expense receipts" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can view reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete reports" ON storage.objects;

-- Drop existing functions
DROP FUNCTION IF EXISTS cleanup_expense_storage();
DROP FUNCTION IF EXISTS get_storage_stats();

-- Drop existing triggers
DROP TRIGGER IF EXISTS cleanup_expense_storage_trigger ON public.expenses;

-- Drop existing views
DROP VIEW IF EXISTS storage_usage;

-- Delete existing buckets (this will also delete all files in them)
DELETE FROM storage.buckets WHERE id IN ('expense-receipts', 'reports');

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Storage cleanup completed successfully!';
  RAISE NOTICE 'All existing policies, functions, triggers, and buckets have been removed';
  RAISE NOTICE 'You can now run storage-setup-safe.sql to create a fresh setup';
END $$;
