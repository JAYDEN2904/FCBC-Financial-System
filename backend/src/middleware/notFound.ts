import { Request, Response, NextFunction } from 'express';

// 404 Not Found middleware
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as Error & { status?: number; code?: string };
  error.status = 404;
  error.code = 'NOT_FOUND';
  next(error);
};
