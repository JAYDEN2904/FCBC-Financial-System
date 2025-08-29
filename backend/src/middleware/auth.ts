import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { supabase, getUserFromToken } from '../config/supabase.js';
import { User } from '../types/index.js';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userRole?: string;
    }
  }
}

// Middleware to verify JWT token
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    // First try to verify as our custom JWT token
    try {
      const decoded = verifyToken(token);
      
      // Get user from database using the decoded user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', (decoded as any).userId)
        .single();

      if (userError || !userData) {
        res.status(403).json({ 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      // Add user to request object
      req.user = userData;
      next();
      return;
    } catch (jwtError) {
      // If our JWT verification fails, try Supabase token
      const { user, error } = await getUserFromToken(token);
      
      if (error || !user) {
        res.status(403).json({ 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        });
        return;
      }

      // Add user to request object
      req.user = user;
      next();
    }
  } catch (error: any) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware to check user roles
export const requireRole = (roles: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      // Get user role from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (error || !userData) {
        res.status(403).json({ 
          error: 'User role not found',
          code: 'ROLE_NOT_FOUND'
        });
        return;
      }

      const userRole = userData.role;
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: allowedRoles,
          current: userRole
        });
        return;
      }

      req.userRole = userRole;
      next();
    } catch (error: any) {
      console.error('Role check error:', error);
      res.status(500).json({ 
        error: 'Role verification failed',
        code: 'ROLE_ERROR'
      });
    }
  };
};

// Middleware to check if user is admin
export const requireAdmin = requireRole(['admin']);

// Middleware to check if user is admin or treasurer
export const requireAdminOrTreasurer = requireRole(['admin', 'treasurer']);

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { user, error } = await getUserFromToken(token);
      if (!error && user) {
        req.user = user;
      }
    }

    next();
  } catch (error: any) {
    // Continue without authentication
    next();
  }
};

// Helper function to generate JWT token
export const generateToken = (payload: any): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(payload, secret, { expiresIn } as any);
};

// Helper function to verify JWT token
export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.verify(token, secret) as JwtPayload;
};
