import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { 
  uploadFile, 
  deleteFile, 
  getFileUrl, 
  listFiles, 
  createSignedUrl,
  validateFile, 
  generateFilePath,
  STORAGE_BUCKETS 
} from '../config/storage.js';
import { authenticateToken, requireAdminOrTreasurer } from '../middleware/auth.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import { FileUpload, UploadResponse } from '../types/index.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Define allowed file types (simplified)
    const allowedTypes: Record<string, string[]> = {
      'reports': ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      'expense-receipts': ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    };

    const bucket = req.body.bucket || req.params.bucket;
    const allowedMimeTypes = allowedTypes[bucket] || [];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed for bucket ${bucket}`) as any, false);
    }
  }
});

// @route   POST /api/upload/:bucket
// @desc    Upload file to specified bucket
// @access  Private
router.post('/:bucket', upload.single('file'), [
  body('expenseId').optional().isUUID().withMessage('Valid expense ID required'),
  body('folder').optional().trim().isLength({ min: 1 }).withMessage('Folder name required')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { bucket } = req.params;
    const { expenseId, folder } = req.body;
    const file = req.file;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Validate bucket
    if (!bucket || !Object.values(STORAGE_BUCKETS).includes(bucket as any)) {
      throw new ValidationError(`Invalid bucket: ${bucket}`);
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new ValidationError('File validation failed', validation.errors);
    }

    // Generate file path
    const filePath = generateFilePath(
      folder || 'general',
      file.originalname,
      expenseId
    );

    // Upload file
    const result = await uploadFile(bucket as any, filePath, file);

    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    const response: UploadResponse = {
      url: result.url!,
      path: result.path!,
      size: file.size,
      mimetype: file.mimetype
    };

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: response
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   GET /api/upload/:bucket
// @desc    List files in bucket
// @access  Private
router.get('/:bucket', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bucket } = req.params;
    const { folder = '' } = req.query;

    // Validate bucket
    if (!bucket || !Object.values(STORAGE_BUCKETS).includes(bucket as any)) {
      throw new ValidationError(`Invalid bucket: ${bucket}`);
    }

    const result = await listFiles(bucket as any, folder as string);

    if (!result.success) {
      throw new Error(result.error || 'Failed to list files');
    }

    res.json({
      success: true,
      data: result.files
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   DELETE /api/upload/:bucket/:path(*)
// @desc    Delete file from bucket
// @access  Private (Admin/Treasurer)
router.delete('/:bucket/*', requireAdminOrTreasurer, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bucket } = req.params;
    const filePath = req.params[0]; // Get the rest of the path

    if (!filePath) {
      throw new ValidationError('File path is required');
    }

    // Validate bucket
    if (!bucket || !Object.values(STORAGE_BUCKETS).includes(bucket as any)) {
      throw new ValidationError(`Invalid bucket: ${bucket}`);
    }

    const result = await deleteFile(bucket as any, filePath);

    if (!result.success) {
      throw new Error(result.error || 'Delete failed');
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   GET /api/upload/:bucket/signed-url/:path(*)
// @desc    Get signed URL for private file
// @access  Private
router.get('/:bucket/signed-url/*', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bucket } = req.params;
    const filePath = req.params[0];
    const { expiresIn = 3600 } = req.query;

    if (!filePath) {
      throw new ValidationError('File path is required');
    }

    // Validate bucket
    if (!bucket || !Object.values(STORAGE_BUCKETS).includes(bucket as any)) {
      throw new ValidationError(`Invalid bucket: ${bucket}`);
    }

    const result = await createSignedUrl(bucket as any, filePath, Number(expiresIn));

    if (!result.success) {
      throw new Error(result.error || 'Failed to create signed URL');
    }

    res.json({
      success: true,
      data: {
        signedUrl: result.signedUrl
      }
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
