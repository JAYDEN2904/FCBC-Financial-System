# Supabase Storage Setup Guide

This guide will help you set up file storage for your Church Management System using Supabase Storage.

## 🗂️ Storage Buckets Overview

The system uses 2 main storage buckets (simplified for transaction-focused system):

1. **`expense-receipts`** - Expense receipt images and documents (private)
2. **`reports`** - Generated financial and member reports (private)

## 🚀 Setup Steps

### Step 1: Run Storage Setup SQL

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire content from `storage-setup.sql`
4. Paste and run the SQL script

This will create:
- Storage buckets with proper configurations
- Row Level Security (RLS) policies
- Automatic folder creation for new members
- Storage cleanup functions
- Usage monitoring views

### Step 2: Verify Buckets Creation

1. Go to **Storage** in your Supabase dashboard
2. You should see these buckets:
   - `expense-receipts`
   - `reports`

### Step 3: Test File Upload

You can test the upload functionality using the API endpoints:

```bash
# Upload expense receipt
curl -X POST http://localhost:3001/api/upload/expense-receipts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/receipt.jpg" \
  -F "expenseId=expense-uuid-here"

# Upload report
curl -X POST http://localhost:3001/api/upload/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/report.pdf" \
  -F "folder=financial"
```

## 📁 File Structure

### Expense Receipts
```
expense-receipts/
├── expenses/
│   ├── {expense-id}/
│   │   ├── receipt_1.jpg
│   │   ├── receipt_2.pdf
│   │   └── ...
└── general/
    ├── 1640995200000_abc123.jpg
    └── ...
```

### Reports
```
reports/
├── financial/
│   ├── 2024-01-financial-report.pdf
│   └── ...
├── members/
│   ├── 2024-01-members-report.pdf
│   └── ...
└── general/
    ├── 1640995200000_abc123.pdf
    └── ...
```

## 🔐 Security Features

### Row Level Security (RLS)
- All buckets have RLS enabled
- Only authenticated users can access files
- All files are private and require authentication

### File Validation
- File type validation based on bucket
- File size limits (5MB for images, 10MB for documents)
- Automatic file naming to prevent conflicts

### Access Control
- Admin and Treasurer roles can manage all files
- Regular users can only access files they have permission for

## 📊 API Endpoints

### Upload File
```http
POST /api/upload/:bucket
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: File to upload
- expenseId: (optional) Expense ID for expense receipts
- folder: (optional) Custom folder name
```

### List Files
```http
GET /api/upload/:bucket?folder=subfolder
Authorization: Bearer {token}
```

### Get File URL
```http
GET /api/upload/:bucket/:filePath/url
Authorization: Bearer {token}
```

### Generate Signed URL
```http
POST /api/upload/:bucket/:filePath/signed-url
Authorization: Bearer {token}

Body:
{
  "expiresIn": 3600  // seconds
}
```

### Delete File
```http
DELETE /api/upload/:bucket/:filePath
Authorization: Bearer {token}
```

### Storage Statistics
```http
GET /api/upload/stats
Authorization: Bearer {token}
```

## 🎯 Frontend Integration

### Upload Expense Receipt
```javascript
const uploadExpenseReceipt = async (expenseId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('expenseId', expenseId);

  const response = await fetch('/api/upload/expense-receipts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};
```

### Upload Report
```javascript
const uploadReport = async (folder, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/upload/reports', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};
```

### Get File URL
```javascript
const getFileUrl = (bucket, filePath) => {
  return `/api/upload/${bucket}/${filePath}/url`;
};
```

## 📈 Monitoring

### Storage Usage View
The system includes a `storage_usage` view that provides:
- File count per bucket
- Total storage used
- Oldest and newest files

### Usage Statistics Function
```sql
SELECT * FROM get_storage_stats();
```

## 🔧 Configuration

### File Size Limits
- Member photos: 5MB
- Documents: 10MB
- Reports: 10MB
- Expense receipts: 5MB

### Allowed File Types
- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX
- **Spreadsheets**: XLS, XLSX

### Automatic Cleanup
- When a member is deleted, their associated files are automatically removed
- Folders are automatically created when new members are added

## 🚨 Troubleshooting

### Common Issues

1. **File upload fails**
   - Check file size limits
   - Verify file type is allowed
   - Ensure user is authenticated

2. **Permission denied**
   - Verify RLS policies are set up correctly
   - Check user role and permissions

3. **Storage bucket not found**
   - Run the storage-setup.sql script
   - Verify bucket names match exactly

### Debug Commands

```sql
-- Check if buckets exist
SELECT * FROM storage.buckets;

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Check storage usage
SELECT * FROM storage_usage;
```

## 📝 Best Practices

1. **File Naming**: Use descriptive names with timestamps
2. **Folder Structure**: Organize files logically by type and date
3. **Cleanup**: Regularly review and clean up unused files
4. **Backup**: Consider backing up important documents
5. **Monitoring**: Monitor storage usage to avoid hitting limits

## 🔄 Migration

If you need to migrate existing files:

1. Export files from current system
2. Use the upload API to transfer files
3. Update database records with new file paths
4. Verify all files are accessible

## 📞 Support

For storage-related issues:
1. Check Supabase Storage documentation
2. Verify RLS policies
3. Check file permissions
4. Review error logs
