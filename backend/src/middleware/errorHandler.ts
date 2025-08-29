import { Request, Response, NextFunction } from 'express';

// Error interface
interface ErrorWithDetails extends Error {
  status?: number;
  code?: string;
  details?: any;
}

// Global error handling middleware
export const errorHandler = (err: ErrorWithDetails, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);

  // Default error
  let error: {
    message: string;
    status: number;
    code: string;
    details?: any;
  } = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
    code: err.code || 'INTERNAL_ERROR'
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.message = 'Validation failed';
    error.details = err.details || err.message;
  }

  if (err.name === 'UnauthorizedError') {
    error.status = 401;
    error.code = 'UNAUTHORIZED';
    error.message = 'Unauthorized access';
  }

  if (err.name === 'ForbiddenError') {
    error.status = 403;
    error.code = 'FORBIDDEN';
    error.message = 'Access forbidden';
  }

  if (err.name === 'NotFoundError') {
    error.status = 404;
    error.code = 'NOT_FOUND';
    error.message = 'Resource not found';
  }

  if (err.name === 'ConflictError') {
    error.status = 409;
    error.code = 'CONFLICT';
    error.message = 'Resource conflict';
  }

  // Handle Supabase errors
  if (err.code && err.code.startsWith('PGRST')) {
    error.status = 400;
    error.code = 'DATABASE_ERROR';
    error.message = 'Database operation failed';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.code = 'INVALID_TOKEN';
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.code = 'TOKEN_EXPIRED';
    error.message = 'Token expired';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    if (error.status >= 500) {
      error.message = 'Internal Server Error';
      error.details = undefined;
    }
  }

  // Send error response
  res.status(error.status).json({
    error: error.message,
    code: error.code,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Custom error classes
export class AppError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(message: string, status: number = 500, code: string = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: any = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}
