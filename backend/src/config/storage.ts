import { supabase, supabaseAdmin } from './supabase.js';
import { FileUpload, UploadResponse } from '../types/index.js';

// Storage bucket names (simplified for transaction-focused system)
export const STORAGE_BUCKETS = {
  REPORTS: 'reports',
  EXPENSE_RECEIPTS: 'expense-receipts'
} as const;

// Storage policies (simplified)
export const STORAGE_POLICIES = {
  // Reports - only authenticated users
  REPORTS: {
    SELECT: 'authenticated',
    INSERT: 'authenticated',
    UPDATE: 'authenticated',
    DELETE: 'authenticated'
  },
  // Expense receipts - only authenticated users
  EXPENSE_RECEIPTS: {
    SELECT: 'authenticated',
    INSERT: 'authenticated',
    UPDATE: 'authenticated',
    DELETE: 'authenticated'
  }
} as const;

// Upload options interface
interface UploadOptions {
  cacheControl?: string;
  upsert?: boolean;
  contentType?: string;
}

// Upload result interface
interface UploadResult {
  success: boolean;
  path?: string;
  url?: string;
  fullPath?: string;
  error?: string;
}

// Delete result interface
interface DeleteResult {
  success: boolean;
  data?: any;
  error?: string;
}

// List files result interface
interface ListFilesResult {
  success: boolean;
  files?: any[];
  error?: string;
}

// Signed URL result interface
interface SignedUrlResult {
  success: boolean;
  signedUrl?: string;
  error?: string;
}

// File validation options interface
interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

// File validation result interface
interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

// Helper function to upload file to storage
export const uploadFile = async (
  bucket: string, 
  filePath: string, 
  file: FileUpload | Buffer, 
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file as any, {
        cacheControl: '3600',
        upsert: false,
        ...options
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
      fullPath: data.fullPath
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to delete file from storage
export const deleteFile = async (bucket: string, filePath: string): Promise<DeleteResult> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to get file URL
export const getFileUrl = (bucket: string, filePath: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Helper function to list files in bucket
export const listFiles = async (bucket: string, folder: string = ''): Promise<ListFilesResult> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      throw error;
    }

    return {
      success: true,
      files: data
    };
  } catch (error: any) {
    console.error('List files error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to create signed URL for private files
export const createSignedUrl = async (
  bucket: string, 
  filePath: string, 
  expiresIn: number = 3600
): Promise<SignedUrlResult> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw error;
    }

    return {
      success: true,
      signedUrl: data.signedUrl
    };
  } catch (error: any) {
    console.error('Signed URL error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// File validation helpers
export const validateFile = (
  file: FileUpload, 
  options: FileValidationOptions = {}
): FileValidationResult => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  } = options;

  const errors: string[] = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} is not allowed`);
  }

  // Check file extension
  const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate unique file path
export const generateFilePath = (
  prefix: string, 
  originalName: string, 
  expenseId?: string | null
): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.substring(originalName.lastIndexOf('.'));
  const fileName = `${timestamp}_${randomString}${extension}`;
  
  if (expenseId) {
    return `${prefix}/${expenseId}/${fileName}`;
  }
  
  return `${prefix}/${fileName}`;
};

export default {
  uploadFile,
  deleteFile,
  getFileUrl,
  listFiles,
  createSignedUrl,
  validateFile,
  generateFilePath,
  STORAGE_BUCKETS,
  STORAGE_POLICIES
};
